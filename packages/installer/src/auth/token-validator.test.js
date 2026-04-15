/**
 * Unit tests for resolveDNSWithFallback() + fetchJSON integration.
 *
 * Covers:
 *   - resolveDNSWithFallback: primary, Google, Cloudflare, all-fail, empty array, undefined address, breadcrumbs
 *   - fetchJSON (via validateToken): IP as hostname, SNI servername, Host header preservation
 *
 * Mocks the 'dns' module (no real DNS calls) and spies on 'https.request' (no real network).
 * RULE_15 — Generator Completeness: feature code ships with its test.
 */

const { EventEmitter } = require('events');

const mockLookup = jest.fn();
const mockResolve4 = jest.fn();
const mockSetServers = jest.fn();
const mockCancel = jest.fn();

jest.mock('dns', () => {
  const MockResolver = jest.fn().mockImplementation(() => ({
    setServers: mockSetServers,
    resolve4: mockResolve4,
    cancel: mockCancel,
  }));
  return {
    promises: {
      lookup: mockLookup,
      Resolver: MockResolver,
    },
  };
});

const https = require('https');
const { resolveDNSWithFallback, validateToken } = require('./token-validator');

describe('resolveDNSWithFallback()', () => {
  beforeEach(() => {
    mockLookup.mockReset();
    mockResolve4.mockReset();
    mockSetServers.mockReset();
    mockCancel.mockReset();
  });

  test('1. primary DNS succeeds → returns IP directly, no fallback', async () => {
    mockLookup.mockResolvedValueOnce({ address: '203.0.113.1', family: 4 });

    const ip = await resolveDNSWithFallback('example.supabase.co');

    expect(ip).toBe('203.0.113.1');
    expect(mockLookup).toHaveBeenCalledTimes(1);
    expect(mockLookup).toHaveBeenCalledWith('example.supabase.co');
    expect(mockSetServers).not.toHaveBeenCalled();
    expect(mockResolve4).not.toHaveBeenCalled();
  });

  test('2. primary DNS fails → Google fallback succeeds', async () => {
    mockLookup.mockRejectedValueOnce(new Error('ENOTFOUND'));
    mockResolve4.mockResolvedValueOnce(['198.51.100.5']);

    const ip = await resolveDNSWithFallback('long.subdomain.supabase.co');

    expect(ip).toBe('198.51.100.5');
    expect(mockLookup).toHaveBeenCalledTimes(1);
    expect(mockResolve4).toHaveBeenCalledTimes(1);
    expect(mockResolve4).toHaveBeenCalledWith('long.subdomain.supabase.co');
    expect(mockSetServers).toHaveBeenCalledWith(['8.8.8.8', '8.8.4.4']);
    // Smith F2: resolver.cancel() called in finally block
    expect(mockCancel).toHaveBeenCalled();
  });

  test('3. primary + Google fail → Cloudflare fallback succeeds', async () => {
    mockLookup.mockRejectedValueOnce(new Error('ENOTFOUND'));
    mockResolve4
      .mockRejectedValueOnce(new Error('SERVFAIL'))
      .mockResolvedValueOnce(['192.0.2.100']);

    const ip = await resolveDNSWithFallback('another.supabase.co');

    expect(ip).toBe('192.0.2.100');
    expect(mockLookup).toHaveBeenCalledTimes(1);
    expect(mockResolve4).toHaveBeenCalledTimes(2);
    expect(mockSetServers).toHaveBeenNthCalledWith(1, ['8.8.8.8', '8.8.4.4']);
    expect(mockSetServers).toHaveBeenNthCalledWith(2, ['1.1.1.1', '1.0.0.1']);
    // Smith F2: cancel called for BOTH resolvers (Google failed + Cloudflare success)
    expect(mockCancel).toHaveBeenCalledTimes(2);
  });

  test('4. all DNS servers fail → throws Error with hostname AND breadcrumbs (Smith F4)', async () => {
    mockLookup.mockRejectedValueOnce(new Error('ENOTFOUND'));
    mockResolve4
      .mockRejectedValueOnce(new Error('SERVFAIL'))
      .mockRejectedValueOnce(new Error('SERVFAIL'));

    let caught;
    try {
      await resolveDNSWithFallback('broken.supabase.co');
    } catch (e) {
      caught = e;
    }

    expect(caught).toBeDefined();
    // Hostname preserved in message
    expect(caught.message).toMatch(/DNS resolution failed for broken\.supabase\.co/);
    // Smith F4: error breadcrumbs for each source
    expect(caught.message).toMatch(/system:/);
    expect(caught.message).toMatch(/Google:/);
    expect(caught.message).toMatch(/Cloudflare:/);

    expect(mockLookup).toHaveBeenCalledTimes(1);
    expect(mockResolve4).toHaveBeenCalledTimes(2);
    // Both fallback resolvers canceled
    expect(mockCancel).toHaveBeenCalledTimes(2);
  });

  // Smith F6: empty array from resolve4 should skip to next fallback
  test('5. primary fails + Google returns empty array → Cloudflare succeeds', async () => {
    mockLookup.mockRejectedValueOnce(new Error('ENOTFOUND'));
    mockResolve4
      .mockResolvedValueOnce([])                  // Google NODATA
      .mockResolvedValueOnce(['192.0.2.55']);     // Cloudflare success

    const ip = await resolveDNSWithFallback('empty.supabase.co');

    expect(ip).toBe('192.0.2.55');
    expect(mockResolve4).toHaveBeenCalledTimes(2);
  });

  // Smith F5: defensive check for undefined address from lookup
  test('6. primary lookup returns undefined address → fallback triggered', async () => {
    mockLookup.mockResolvedValueOnce({ address: undefined, family: 4 });
    mockResolve4.mockResolvedValueOnce(['198.51.100.77']);

    const ip = await resolveDNSWithFallback('nullish.supabase.co');

    expect(ip).toBe('198.51.100.77');
    expect(mockResolve4).toHaveBeenCalledTimes(1);
  });

  // Smith F4: error message should include specific error codes/messages, not just generic text
  test('7. breadcrumbs include error codes when available', async () => {
    mockLookup.mockRejectedValueOnce(Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' }));
    mockResolve4
      .mockRejectedValueOnce(Object.assign(new Error('serv fail'), { code: 'ESERVFAIL' }))
      .mockRejectedValueOnce(Object.assign(new Error('refused'), { code: 'ECONNREFUSED' }));

    let caught;
    try {
      await resolveDNSWithFallback('traceable.supabase.co');
    } catch (e) {
      caught = e;
    }

    expect(caught.message).toMatch(/ENOTFOUND/);
    expect(caught.message).toMatch(/ESERVFAIL/);
    expect(caught.message).toMatch(/ECONNREFUSED/);
  });
});

// Smith F1: Integration test — fetchJSON options construction
describe('fetchJSON (via validateToken) — options construction', () => {
  let requestSpy;

  beforeEach(() => {
    mockLookup.mockReset();
    mockResolve4.mockReset();
    mockSetServers.mockReset();
    mockCancel.mockReset();

    // Mock https.request to capture options and return a fake successful response
    requestSpy = jest.spyOn(https, 'request').mockImplementation((options, callback) => {
      const req = new EventEmitter();
      req.write = jest.fn();
      req.destroy = jest.fn();
      req.end = jest.fn(() => {
        // Simulate async response
        setImmediate(() => {
          const res = new EventEmitter();
          callback(res);
          const responseBody = JSON.stringify({
            valid: true,
            user: 'test-user',
            plan: 'premium',
            expires_at: '2099-12-31T00:00:00.000Z',
          });
          res.emit('data', Buffer.from(responseBody));
          res.emit('end');
        });
      });
      return req;
    });
  });

  afterEach(() => {
    requestSpy.mockRestore();
  });

  test('F1a: fetchJSON uses resolved IP as hostname (not original DNS name)', async () => {
    mockLookup.mockResolvedValueOnce({ address: '203.0.113.42', family: 4 });

    await validateToken('MTX-ABCD-EFGH-IJKL-MNOP', { projectName: 'test-project' });

    expect(requestSpy).toHaveBeenCalled();
    const [options] = requestSpy.mock.calls[0];
    expect(options.hostname).toBe('203.0.113.42');
  });

  test('F1b: fetchJSON sets servername for TLS SNI (matches original hostname, not IP)', async () => {
    mockLookup.mockResolvedValueOnce({ address: '203.0.113.42', family: 4 });

    await validateToken('MTX-ABCD-EFGH-IJKL-MNOP', { projectName: 'test-project' });

    const [options] = requestSpy.mock.calls[0];
    // servername must match cert CN, not the IP
    expect(options.servername).toBe('qaomekspdjfbdeixxjky.supabase.co');
    // And NOT the resolved IP
    expect(options.servername).not.toBe('203.0.113.42');
  });

  test('F1c: fetchJSON preserves Host header with original hostname (for vhost routing)', async () => {
    mockLookup.mockResolvedValueOnce({ address: '203.0.113.42', family: 4 });

    await validateToken('MTX-ABCD-EFGH-IJKL-MNOP', { projectName: 'test-project' });

    const [options] = requestSpy.mock.calls[0];
    expect(options.headers.Host).toBe('qaomekspdjfbdeixxjky.supabase.co');
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  test('F1d: fetchJSON uses POST method', async () => {
    mockLookup.mockResolvedValueOnce({ address: '203.0.113.42', family: 4 });

    await validateToken('MTX-ABCD-EFGH-IJKL-MNOP', { projectName: 'test-project' });

    const [options] = requestSpy.mock.calls[0];
    expect(options.method).toBe('POST');
  });

  test('F1e: fetchJSON falls back to Google DNS when primary fails, still uses IP for connection', async () => {
    mockLookup.mockRejectedValueOnce(new Error('ENOTFOUND'));
    mockResolve4.mockResolvedValueOnce(['198.51.100.88']);

    await validateToken('MTX-ABCD-EFGH-IJKL-MNOP', { projectName: 'test-project' });

    const [options] = requestSpy.mock.calls[0];
    // Used the Google fallback IP
    expect(options.hostname).toBe('198.51.100.88');
    // But SNI still points to original hostname
    expect(options.servername).toBe('qaomekspdjfbdeixxjky.supabase.co');
    expect(options.headers.Host).toBe('qaomekspdjfbdeixxjky.supabase.co');
  });
});
