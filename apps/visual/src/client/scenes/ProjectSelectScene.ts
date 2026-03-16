import Phaser from 'phaser';

const CODE_RAIN_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
const MATRIX_GREEN = '#00FF41';
const MATRIX_BG = '#0D0208';
const MATRIX_DIM = '#005500';

interface ProjectInfo {
  name: string;
  path: string;
  lastActivity: number;
  storyCount: number;
  agentCount: number;
}

interface CodeRainColumn {
  x: number;
  chars: { y: number; char: string; alpha: number }[];
  speed: number;
  nextSpawnY: number;
}

type SceneState = 'loading' | 'list' | 'pills' | 'empty' | 'entering';

/**
 * Project selection screen — DOM overlay for crisp text + Phaser code rain background.
 * Always shows project list + "Começar novo projeto" button.
 * Never auto-selects — user always sees the list first.
 *
 * Story 5.4: Project Selector — "Escolha sua Realidade"
 */
export class ProjectSelectScene extends Phaser.Scene {
  // Code rain (Phaser background)
  private columns: CodeRainColumn[] = [];

  // DOM overlay
  private overlay: HTMLDivElement | null = null;
  private contentEl: HTMLDivElement | null = null;

  // State
  private sceneState: SceneState = 'loading';
  private projects: ProjectInfo[] = [];
  private selectedProject: ProjectInfo | null = null;
  private selectedIndex = 0;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    super({ key: 'ProjectSelectScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(MATRIX_BG);

    this.initCodeRain(width, height);
    this.createOverlay();

    this.keyHandler = (e: KeyboardEvent) => this.handleKeyboard(e);
    document.addEventListener('keydown', this.keyHandler);

    this.fetchProjects();
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.id = 'project-select-overlay';
    Object.assign(this.overlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
      backgroundColor: 'rgba(13, 2, 8, 0.85)',
      color: MATRIX_GREEN, fontFamily: '"Courier New", monospace', fontSize: '16px',
      zIndex: '500', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto',
    });

    this.contentEl = document.createElement('div');
    this.contentEl.id = 'project-select-content';
    Object.assign(this.contentEl.style, {
      maxWidth: '600px', width: '90%', textAlign: 'center',
    });
    this.overlay.appendChild(this.contentEl);
    document.body.appendChild(this.overlay);

    this.contentEl.innerHTML = `
      <div style="font-size: 22px; letter-spacing: 3px; margin-bottom: 24px;">
        &gt; Selecione sua realidade_
      </div>
      <div style="color: ${MATRIX_DIM}; font-size: 14px;">Escaneando projetos LMAS...</div>
    `;
  }

  private async fetchProjects(): Promise<void> {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as { projects: ProjectInfo[]; count: number };
      this.projects = data.projects;
      // Always show list (never auto-select)
      this.showProjectList();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown';
      this.showError(`Erro ao buscar projetos: ${message}`);
    }
  }

  private showProjectList(): void {
    this.sceneState = 'list';
    if (!this.contentEl) return;

    const rows = this.projects.map((project, i) => {
      const timeAgo = this.formatTimeAgo(project.lastActivity);
      const selected = i === this.selectedIndex;
      return `
        <div class="project-row" data-index="${i}" style="
          display: flex; align-items: center; gap: 12px; padding: 10px 16px;
          color: ${selected ? MATRIX_GREEN : MATRIX_DIM}; cursor: pointer;
          border: 1px solid ${selected ? MATRIX_GREEN : 'transparent'};
          background: ${selected ? 'rgba(0,255,65,0.05)' : 'transparent'};
          margin-bottom: 4px; transition: all 0.15s;
        ">
          <span style="width: 16px; font-size: 18px;">${selected ? '&gt;' : '&nbsp;'}</span>
          <span style="flex: 1; text-align: left; font-size: 16px;">${this.esc(project.name)}</span>
          <span style="font-size: 12px; color: ${MATRIX_DIM};">
            ${project.storyCount} stories &middot; ${project.agentCount} agentes &middot; ${timeAgo}
          </span>
        </div>
      `;
    }).join('');

    const emptyMsg = this.projects.length === 0
      ? `<div style="color: ${MATRIX_DIM}; font-size: 14px; padding: 16px;">Nenhum projeto LMAS detectado.</div>`
      : '';

    this.contentEl.innerHTML = `
      <div style="font-size: 22px; letter-spacing: 3px; margin-bottom: 24px;">
        &gt; Selecione sua realidade_
      </div>
      <div style="text-align: left; margin-bottom: 12px;">
        ${rows}
        ${emptyMsg}
      </div>
      <div style="margin-bottom: 20px;">
        <button id="new-project-btn" style="
          background: transparent; border: 1px solid ${MATRIX_GREEN}; color: ${MATRIX_GREEN};
          font-family: 'Courier New', monospace; font-size: 15px;
          padding: 10px 28px; cursor: pointer; letter-spacing: 1px;
          width: 100%; max-width: 400px;
        ">[ + Comecar novo projeto ]</button>
      </div>
      <div style="color: ${MATRIX_DIM}; font-size: 12px;">
        ${this.projects.length > 0 ? 'Setas: Navegar &nbsp;|&nbsp; ENTER: Selecionar' : 'Clique no botao acima para começar'}
      </div>
    `;

    this.bindListEvents();
  }

  private bindListEvents(): void {
    if (!this.contentEl) return;

    this.contentEl.querySelectorAll('.project-row').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt((el as HTMLElement).dataset.index ?? '0', 10);
        this.selectedIndex = idx;
        this.selectedProject = this.projects[idx];
        this.showPills();
      });
      el.addEventListener('mouseenter', () => {
        const idx = parseInt((el as HTMLElement).dataset.index ?? '0', 10);
        this.selectedIndex = idx;
        this.showProjectList();
      });
    });

    const newBtn = this.contentEl.querySelector('#new-project-btn');
    newBtn?.addEventListener('click', () => this.showNewProjectInstructions());
    newBtn?.addEventListener('mouseenter', () => (newBtn as HTMLElement).style.background = 'rgba(0,255,65,0.1)');
    newBtn?.addEventListener('mouseleave', () => (newBtn as HTMLElement).style.background = 'transparent');
  }

  private showNewProjectInstructions(): void {
    if (!this.contentEl) return;
    this.contentEl.innerHTML = `
      <div style="font-size: 22px; letter-spacing: 3px; margin-bottom: 24px;">
        &gt; Novo projeto_
      </div>
      <div style="text-align: left; color: ${MATRIX_DIM}; font-size: 15px; line-height: 2.2; max-width: 480px; margin: 0 auto;">
        <span style="color: ${MATRIX_GREEN};">1.</span> Abra um terminal<br>
        <span style="color: ${MATRIX_GREEN};">2.</span> Navegue ate o diretorio desejado<br>
        <span style="color: ${MATRIX_GREEN};">3.</span> Execute: <span style="color: ${MATRIX_GREEN};">npx lmas-core install</span><br>
        <span style="color: ${MATRIX_GREEN};">4.</span> Volte aqui e recarregue a pagina (F5)
      </div>
      <div style="margin-top: 24px;">
        <button id="back-btn" style="
          background: transparent; border: 1px solid ${MATRIX_DIM}; color: ${MATRIX_DIM};
          font-family: 'Courier New', monospace; font-size: 14px;
          padding: 8px 20px; cursor: pointer;
        ">[ Voltar ]</button>
      </div>
    `;
    this.contentEl.querySelector('#back-btn')?.addEventListener('click', () => this.showProjectList());
  }

  private showPills(): void {
    this.sceneState = 'pills';
    if (!this.contentEl || !this.selectedProject) return;

    this.contentEl.innerHTML = `
      <div style="font-size: 22px; letter-spacing: 3px; margin-bottom: 8px;">
        &gt; ${this.esc(this.selectedProject.name)}_
      </div>
      <div style="color: ${MATRIX_DIM}; font-size: 13px; margin-bottom: 36px;">
        ${this.selectedProject.storyCount} stories &middot; ${this.selectedProject.agentCount} agentes
      </div>
      <div style="display: flex; gap: 60px; justify-content: center; align-items: center;">
        <div style="text-align: center;">
          <div id="red-pill" style="
            width: 56px; height: 28px; border-radius: 14px;
            background: linear-gradient(135deg, #FF2222, #CC0000);
            border: 2px solid #FF4444; cursor: pointer; margin: 0 auto 10px;
            box-shadow: 0 0 16px rgba(255,0,0,0.5); transition: transform 0.15s;
          "></div>
          <div style="color: #FF4444; font-size: 15px;">Entrar</div>
        </div>
        <div style="text-align: center;">
          <div id="blue-pill" style="
            width: 56px; height: 28px; border-radius: 14px;
            background: linear-gradient(135deg, #2266FF, #0033CC);
            border: 2px solid #4488FF; cursor: pointer; margin: 0 auto 10px;
            box-shadow: 0 0 16px rgba(0,68,255,0.5); transition: transform 0.15s;
          "></div>
          <div style="color: #4488FF; font-size: 15px;">Voltar</div>
        </div>
      </div>
      <div style="color: ${MATRIX_DIM}; font-size: 13px; margin-top: 28px;">
        Escolha sua pilula.
      </div>
    `;

    const redPill = this.contentEl.querySelector('#red-pill');
    const bluePill = this.contentEl.querySelector('#blue-pill');

    redPill?.addEventListener('click', () => this.enterConstruct());
    redPill?.addEventListener('mouseenter', () => (redPill as HTMLElement).style.transform = 'scale(1.2)');
    redPill?.addEventListener('mouseleave', () => (redPill as HTMLElement).style.transform = 'scale(1)');

    bluePill?.addEventListener('click', () => this.backToList());
    bluePill?.addEventListener('mouseenter', () => (bluePill as HTMLElement).style.transform = 'scale(1.2)');
    bluePill?.addEventListener('mouseleave', () => (bluePill as HTMLElement).style.transform = 'scale(1)');
  }

  private async enterConstruct(): Promise<void> {
    if (this.sceneState === 'entering' || !this.selectedProject) return;
    this.sceneState = 'entering';

    try {
      const response = await fetch('/api/project/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath: this.selectedProject.path }),
      });
      if (!response.ok) {
        const err = await response.json() as { error: string };
        throw new Error(err.error ?? `HTTP ${response.status}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown';
      this.showError(`Falha ao selecionar projeto: ${message}`);
      this.sceneState = 'pills';
      return;
    }

    // Glitch transition
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(500, 0, 255, 65);

    setTimeout(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      if (this.overlay) this.overlay.style.opacity = '0';
    }, 600);

    setTimeout(() => {
      this.destroyOverlay();
      this.scene.start('ConstructScene');
    }, 1200);
  }

  private backToList(): void {
    this.selectedProject = null;
    this.showProjectList();
  }

  private handleKeyboard(e: KeyboardEvent): void {
    if (this.sceneState === 'list' && this.projects.length > 0) {
      if (e.key === 'ArrowUp') {
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        this.showProjectList();
      } else if (e.key === 'ArrowDown') {
        this.selectedIndex = Math.min(this.projects.length - 1, this.selectedIndex + 1);
        this.showProjectList();
      } else if (e.key === 'Enter') {
        this.selectedProject = this.projects[this.selectedIndex];
        this.showPills();
      }
    } else if (this.sceneState === 'pills') {
      if (e.key === 'Escape') this.backToList();
      else if (e.key === 'Enter') this.enterConstruct();
    }
  }

  private showError(message: string): void {
    const errorEl = document.createElement('div');
    Object.assign(errorEl.style, {
      position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
      background: MATRIX_BG, border: '1px solid #FF4444', color: '#FF4444',
      fontFamily: '"Courier New", monospace', fontSize: '14px',
      padding: '10px 20px', borderRadius: '4px', zIndex: '600',
    });
    errorEl.textContent = message;
    document.body.appendChild(errorEl);
    setTimeout(() => errorEl.remove(), 4000);
  }

  private formatTimeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}min atras`;
    if (hours < 24) return `${hours}h atras`;
    return `${days}d atras`;
  }

  private esc(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private destroyOverlay(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
    this.overlay?.remove();
    this.overlay = null;
    this.contentEl = null;
  }

  // Code rain background (Phaser)
  private initCodeRain(width: number, height: number): void {
    const colSpacing = 8;
    const numColumns = Math.ceil(width / colSpacing);
    for (let i = 0; i < numColumns; i++) {
      this.columns.push({
        x: i * colSpacing, chars: [],
        speed: 0.3 + Math.random() * 0.7,
        nextSpawnY: -Math.random() * height,
      });
    }
  }

  update(): void {
    this.updateCodeRain();
  }

  private updateCodeRain(): void {
    const { height } = this.cameras.main;
    for (const col of this.columns) {
      col.nextSpawnY += col.speed;
      if (col.nextSpawnY >= 0) {
        col.chars.push({ y: col.nextSpawnY, char: CODE_RAIN_CHARS[Math.floor(Math.random() * CODE_RAIN_CHARS.length)], alpha: 1 });
        col.nextSpawnY = -8;
      }
      for (const ch of col.chars) { ch.y += col.speed; ch.alpha -= 0.005; }
      col.chars = col.chars.filter(ch => ch.y < height + 16 && ch.alpha > 0);
    }
  }
}
