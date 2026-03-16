import type { Response } from 'express';

interface SSEClient {
  id: string;
  res: Response;
  connectedAt: number;
}

interface SSEEvent {
  event: string;
  data: Record<string, unknown>;
}

const MAX_CONNECTIONS = 10;
const HEARTBEAT_INTERVAL_MS = 30_000;
const MOCK_EVENT_INTERVAL_MS = 5_000;

export class SSEBroadcaster {
  private clients: Map<string, SSEClient> = new Map();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private mockEventTimer: ReturnType<typeof setInterval> | null = null;
  private clientCounter = 0;

  get connectionCount(): number {
    return this.clients.size;
  }

  addClient(res: Response): string | null {
    if (this.clients.size >= MAX_CONNECTIONS) {
      return null;
    }

    const id = `client-${++this.clientCounter}`;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(`event: connected\ndata: ${JSON.stringify({ clientId: id })}\n\n`);

    this.clients.set(id, { id, res, connectedAt: Date.now() });

    res.on('close', () => {
      this.clients.delete(id);
    });

    return id;
  }

  broadcast(event: SSEEvent): void {
    const payload = `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`;

    for (const [id, client] of this.clients) {
      try {
        client.res.write(payload);
      } catch {
        this.clients.delete(id);
      }
    }
  }

  sendHeartbeat(): void {
    this.broadcast({
      event: 'heartbeat',
      data: { timestamp: Date.now() },
    });
  }

  startHeartbeat(): void {
    if (this.heartbeatTimer) return;
    this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), HEARTBEAT_INTERVAL_MS);
  }

  stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  startMockEvents(): void {
    if (this.mockEventTimer) return;

    const mockAgents = ['dev', 'qa', 'architect', 'pm', 'smith'];
    const mockStatuses = ['working', 'idle', 'waiting', 'blocked'] as const;
    const mockTasks = [
      'implement payment API',
      'review PR #42',
      'design system architecture',
      'refine user stories',
      'verify delivery quality',
    ];

    let index = 0;

    this.mockEventTimer = setInterval(() => {
      const agentIndex = index % mockAgents.length;
      this.broadcast({
        event: 'agent-status',
        data: {
          agentId: mockAgents[agentIndex],
          status: mockStatuses[agentIndex % mockStatuses.length],
          task: mockTasks[agentIndex],
          timestamp: Date.now(),
        },
      });
      index++;
    }, MOCK_EVENT_INTERVAL_MS);
  }

  stopMockEvents(): void {
    if (this.mockEventTimer) {
      clearInterval(this.mockEventTimer);
      this.mockEventTimer = null;
    }
  }

  removeClient(id: string): void {
    this.clients.delete(id);
  }

  shutdown(): void {
    this.stopHeartbeat();
    this.stopMockEvents();
    for (const [, client] of this.clients) {
      try {
        client.res.end();
      } catch {
        // Client already disconnected
      }
    }
    this.clients.clear();
  }
}
