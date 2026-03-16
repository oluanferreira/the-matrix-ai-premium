export interface SSEEventHandler {
  (data: Record<string, unknown>): void;
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private handlers: Map<string, SSEEventHandler[]> = new Map();
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private url: string;

  constructor(url: string = '/api/events/stream') {
    this.url = url;
  }

  connect(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(this.url);

    this.eventSource.addEventListener('connected', (event: MessageEvent) => {
      const data = JSON.parse(event.data) as Record<string, unknown>;
      console.log('[SSE] Connected:', data);
      this.reconnectDelay = 1000;
    });

    this.eventSource.addEventListener('agent-status', (event: MessageEvent) => {
      const data = JSON.parse(event.data) as Record<string, unknown>;
      this.emit('agent-status', data);
    });

    this.eventSource.addEventListener('heartbeat', (event: MessageEvent) => {
      const data = JSON.parse(event.data) as Record<string, unknown>;
      this.emit('heartbeat', data);
    });

    this.eventSource.addEventListener('agent-delivery', (event: MessageEvent) => {
      const data = JSON.parse(event.data) as Record<string, unknown>;
      this.emit('agent-delivery', data);
    });

    this.eventSource.addEventListener('smith-verdict', (event: MessageEvent) => {
      const data = JSON.parse(event.data) as Record<string, unknown>;
      this.emit('smith-verdict', data);
    });

    this.eventSource.addEventListener('workflow-update', (event: MessageEvent) => {
      const data = JSON.parse(event.data) as Record<string, unknown>;
      this.emit('workflow-update', data);
    });

    this.eventSource.onerror = () => {
      console.warn(`[SSE] Connection lost. Reconnecting in ${this.reconnectDelay}ms...`);
      this.eventSource?.close();
      this.eventSource = null;

      setTimeout(() => {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
        this.connect();
      }, this.reconnectDelay);
    };
  }

  on(event: string, handler: SSEEventHandler): void {
    const handlers = this.handlers.get(event) ?? [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
  }

  off(event: string, handler: SSEEventHandler): void {
    const handlers = this.handlers.get(event) ?? [];
    this.handlers.set(event, handlers.filter(h => h !== handler));
  }

  private emit(event: string, data: Record<string, unknown>): void {
    const handlers = this.handlers.get(event) ?? [];
    for (const handler of handlers) {
      handler(data);
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
