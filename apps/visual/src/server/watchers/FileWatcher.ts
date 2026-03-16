import { watch } from 'chokidar';
import type { FSWatcher } from 'chokidar';
import { EventEmitter } from 'events';

const DEBOUNCE_MS = 500;

export interface FileChangeEvent {
  type: 'handoff' | 'story' | 'log';
  path: string;
}

/**
 * Watches LMAS filesystem directories for changes.
 * Emits debounced 'change' events.
 */
export class FileWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingEvents: FileChangeEvent[] = [];

  constructor(private projectRoot: string) {
    super();
  }

  start(): void {
    const watchPaths = [
      `${this.projectRoot}/.lmas/handoffs`,
      `${this.projectRoot}/.lmas/logs`,
      `${this.projectRoot}/docs/stories/active`,
    ];

    this.watcher = watch(watchPaths, {
      ignoreInitial: true,
      persistent: true,
      depth: 1,
    });

    this.watcher.on('add', (filePath: string) => this.handleChange(filePath));
    this.watcher.on('change', (filePath: string) => this.handleChange(filePath));
    this.watcher.on('unlink', (filePath: string) => this.handleChange(filePath));
  }

  private handleChange(filePath: string): void {
    const event = this.classifyEvent(filePath);
    if (!event) return;

    this.pendingEvents.push(event);

    // Debounce
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const events = [...this.pendingEvents];
      this.pendingEvents = [];
      this.emit('change', events);
    }, DEBOUNCE_MS);
  }

  private classifyEvent(filePath: string): FileChangeEvent | null {
    const normalized = filePath.replace(/\\/g, '/');

    if (normalized.includes('.lmas/handoffs')) {
      return { type: 'handoff', path: filePath };
    }
    if (normalized.includes('.lmas/logs')) {
      return { type: 'log', path: filePath };
    }
    if (normalized.includes('docs/stories')) {
      return { type: 'story', path: filePath };
    }
    return null;
  }

  stop(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    this.pendingEvents = [];
  }
}
