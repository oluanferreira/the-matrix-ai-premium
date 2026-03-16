const fs = require('fs');
const path = require('path');
const http = require('http');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('Story 1.2: Express Server & SSE', () => {
  describe('file structure', () => {
    const requiredFiles = [
      'src/server/index.ts',
      'src/server/app.ts',
      'src/server/routes/sse.ts',
      'src/server/routes/api.ts',
      'src/server/services/SSEBroadcaster.ts',
      'src/client/systems/SSEClient.ts',
    ];

    test.each(requiredFiles)('%s exists', (file) => {
      expect(fs.existsSync(path.join(VISUAL_DIR, file))).toBe(true);
    });
  });

  describe('SSEBroadcaster (AC: 3, 4, 5)', () => {
    let broadcasterSource;

    beforeAll(() => {
      broadcasterSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/services/SSEBroadcaster.ts'),
        'utf8',
      );
    });

    test('has addClient method with MAX_CONNECTIONS limit', () => {
      expect(broadcasterSource).toContain('addClient');
      expect(broadcasterSource).toContain('MAX_CONNECTIONS');
    });

    test('sets SSE headers (Content-Type: text/event-stream)', () => {
      expect(broadcasterSource).toContain('text/event-stream');
    });

    test('has heartbeat at 30s interval', () => {
      expect(broadcasterSource).toContain('30_000');
      expect(broadcasterSource).toContain('sendHeartbeat');
    });

    test('has mock event at 5s interval', () => {
      expect(broadcasterSource).toContain('5_000');
      expect(broadcasterSource).toContain('startMockEvents');
    });

    test('has broadcast method', () => {
      expect(broadcasterSource).toContain('broadcast(event');
    });

    test('has shutdown method for cleanup', () => {
      expect(broadcasterSource).toContain('shutdown');
    });

    test('rate limits to max 10 connections', () => {
      expect(broadcasterSource).toContain('MAX_CONNECTIONS = 10');
    });
  });

  describe('SSE route (AC: 3)', () => {
    let sseRouteSource;

    beforeAll(() => {
      sseRouteSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/routes/sse.ts'),
        'utf8',
      );
    });

    test('exposes GET /events/stream endpoint', () => {
      expect(sseRouteSource).toContain('/events/stream');
      expect(sseRouteSource).toContain('router.get');
    });

    test('returns 503 when too many connections', () => {
      expect(sseRouteSource).toContain('503');
      expect(sseRouteSource).toContain('Too many SSE connections');
    });
  });

  describe('API routes', () => {
    let apiRouteSource;

    beforeAll(() => {
      apiRouteSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/routes/api.ts'),
        'utf8',
      );
    });

    test('exposes GET /agents endpoint', () => {
      expect(apiRouteSource).toContain('/agents');
    });

    test('exposes GET /status endpoint', () => {
      expect(apiRouteSource).toContain('/status');
    });
  });

  describe('Express app (AC: 2, 7, 8)', () => {
    let appSource;

    beforeAll(() => {
      appSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/app.ts'),
        'utf8',
      );
    });

    test('serves static files from dist/client', () => {
      expect(appSource).toContain('dist/client');
      expect(appSource).toContain('express.static');
    });

    test('sets X-Content-Type-Options: nosniff (AC: 8)', () => {
      expect(appSource).toContain('X-Content-Type-Options');
      expect(appSource).toContain('nosniff');
    });

    test('sets X-Frame-Options: DENY (AC: 8)', () => {
      expect(appSource).toContain('X-Frame-Options');
      expect(appSource).toContain('DENY');
    });

    test('configures CORS for localhost:3000 (AC: 7)', () => {
      expect(appSource).toContain('localhost:3000');
      expect(appSource).toContain('Access-Control-Allow-Origin');
    });

    test('does NOT use helmet (ADR-6)', () => {
      expect(appSource).not.toContain('helmet');
    });
  });

  describe('SSE client (AC: 6)', () => {
    let clientSource;

    beforeAll(() => {
      clientSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/client/systems/SSEClient.ts'),
        'utf8',
      );
    });

    test('uses EventSource for SSE connection', () => {
      expect(clientSource).toContain('EventSource');
    });

    test('connects to /api/events/stream', () => {
      expect(clientSource).toContain('/api/events/stream');
    });

    test('has auto-reconnect with exponential backoff', () => {
      expect(clientSource).toContain('reconnectDelay');
      expect(clientSource).toContain('maxReconnectDelay');
    });

    test('handles agent-status events', () => {
      expect(clientSource).toContain('agent-status');
    });

    test('handles heartbeat events', () => {
      expect(clientSource).toContain('heartbeat');
    });

    test('has disconnect method', () => {
      expect(clientSource).toContain('disconnect');
    });
  });

  describe('server entry point', () => {
    let indexSource;

    beforeAll(() => {
      indexSource = fs.readFileSync(
        path.join(VISUAL_DIR, 'src/server/index.ts'),
        'utf8',
      );
    });

    test('listens on port 3001', () => {
      expect(indexSource).toContain('3001');
    });

    test('starts heartbeat', () => {
      expect(indexSource).toContain('startHeartbeat');
    });

    test('starts mock events', () => {
      expect(indexSource).toContain('startMockEvents');
    });

    test('handles graceful shutdown', () => {
      expect(indexSource).toContain('SIGTERM');
      expect(indexSource).toContain('SIGINT');
      expect(indexSource).toContain('shutdown');
    });
  });

  describe('package.json scripts', () => {
    let pkg;

    beforeAll(() => {
      pkg = JSON.parse(fs.readFileSync(path.join(VISUAL_DIR, 'package.json'), 'utf8'));
    });

    test('dev runs client + server concurrently', () => {
      expect(pkg.scripts.dev).toContain('concurrently');
      expect(pkg.scripts.dev).toContain('vite');
      expect(pkg.scripts.dev).toContain('tsx');
    });

    test('has separate dev:server script', () => {
      expect(pkg.scripts['dev:server']).toContain('tsx watch');
    });

    test('has express dependency', () => {
      expect(pkg.dependencies.express).toBeDefined();
    });

    test('has tsx dev dependency', () => {
      expect(pkg.devDependencies.tsx).toBeDefined();
    });

    test('has concurrently dev dependency', () => {
      expect(pkg.devDependencies.concurrently).toBeDefined();
    });
  });
});
