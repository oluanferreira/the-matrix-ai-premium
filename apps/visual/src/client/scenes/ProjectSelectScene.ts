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
 * Project selection screen — lists discovered LMAS projects.
 * After selecting a project, shows red/blue pills.
 * Red pill → enter Construct. Blue pill → back to project list.
 *
 * Story 5.4: Project Selector — "Escolha sua Realidade"
 */
export class ProjectSelectScene extends Phaser.Scene {
  // Code rain
  private columns: CodeRainColumn[] = [];

  // State
  private sceneState: SceneState = 'loading';
  private projects: ProjectInfo[] = [];
  private selectedProject: ProjectInfo | null = null;
  private selectedIndex = 0;

  // UI elements
  private titleText: Phaser.GameObjects.Text | null = null;
  private projectTexts: Phaser.GameObjects.Text[] = [];
  private infoText: Phaser.GameObjects.Text | null = null;
  private emptyText: Phaser.GameObjects.Text | null = null;
  private redPill: Phaser.GameObjects.Container | null = null;
  private bluePill: Phaser.GameObjects.Container | null = null;
  private redLabel: Phaser.GameObjects.Text | null = null;
  private blueLabel: Phaser.GameObjects.Text | null = null;
  private selectedProjectText: Phaser.GameObjects.Text | null = null;
  private cursorGraphic: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'ProjectSelectScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.cameras.main.setBackgroundColor(MATRIX_BG);
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Code rain background
    this.initCodeRain(width, height);

    // Title
    this.titleText = this.add.text(width / 2, 12, '> Selecione sua realidade_', {
      fontSize: '8px',
      color: MATRIX_GREEN,
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(10);

    // Loading text
    this.infoText = this.add.text(width / 2, height / 2, 'Escaneando projetos LMAS...', {
      fontSize: '6px',
      color: MATRIX_DIM,
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(10);

    // Keyboard navigation
    this.input.keyboard?.on('keydown-UP', () => this.navigateUp());
    this.input.keyboard?.on('keydown-DOWN', () => this.navigateDown());
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-ESC', () => this.handleEscape());

    // Fetch projects from server
    this.fetchProjects();
  }

  private async fetchProjects(): Promise<void> {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json() as { projects: ProjectInfo[]; count: number };
      this.projects = data.projects;

      if (this.projects.length === 0) {
        this.showEmptyState();
      } else if (this.projects.length === 1) {
        // Auto-select single project (AC: 10)
        this.selectedProject = this.projects[0];
        this.showPills();
      } else {
        this.showProjectList();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.showError(`Erro ao buscar projetos: ${message}`);
    }
  }

  private showProjectList(): void {
    this.sceneState = 'list';
    const { width, height } = this.cameras.main;

    // Clear loading text
    this.infoText?.setText('');

    const startY = 28;
    const lineHeight = 12;
    const maxVisible = Math.floor((height - 50) / lineHeight);
    const visibleProjects = this.projects.slice(0, maxVisible);

    // Cursor
    this.cursorGraphic = this.add.text(8, startY, '>', {
      fontSize: '7px',
      color: MATRIX_GREEN,
      fontFamily: 'monospace',
    }).setDepth(10);

    // Project entries
    for (let i = 0; i < visibleProjects.length; i++) {
      const project = visibleProjects[i];
      const y = startY + i * lineHeight;
      const timeAgo = this.formatTimeAgo(project.lastActivity);
      const label = `${project.name}  [${project.storyCount} stories, ${project.agentCount} agentes]  ${timeAgo}`;

      const text = this.add.text(16, y, label, {
        fontSize: '6px',
        color: i === 0 ? MATRIX_GREEN : MATRIX_DIM,
        fontFamily: 'monospace',
      }).setDepth(10).setInteractive();

      text.on('pointerover', () => {
        this.selectedIndex = i;
        this.updateListHighlight();
      });

      text.on('pointerdown', () => {
        this.selectedIndex = i;
        this.confirmSelection();
      });

      this.projectTexts.push(text);
    }

    // Footer hint
    this.infoText?.setText('↑↓ Navegar  |  ENTER Selecionar');
    this.infoText?.setPosition(width / 2, height - 8);

    this.updateListHighlight();
  }

  private showEmptyState(): void {
    this.sceneState = 'empty';
    const { width, height } = this.cameras.main;

    this.infoText?.setText('');

    this.emptyText = this.add.text(width / 2, height * 0.4, [
      'Nenhum projeto LMAS detectado.',
      '',
      'Execute em um diretório:',
      '  npx lmas-core install',
      '',
      'Ou defina LMAS_PROJECTS_PATH',
      'com os caminhos dos projetos.',
    ].join('\n'), {
      fontSize: '6px',
      color: MATRIX_DIM,
      fontFamily: 'monospace',
      align: 'center',
    }).setOrigin(0.5).setDepth(10);
  }

  private showPills(): void {
    this.sceneState = 'pills';
    const { width, height } = this.cameras.main;

    // Clear list elements
    this.clearListElements();
    this.infoText?.setText('');

    // Show selected project name
    const projectName = this.selectedProject?.name ?? 'Unknown';
    this.selectedProjectText = this.add.text(width / 2, 28, `> ${projectName}`, {
      fontSize: '8px',
      color: MATRIX_GREEN,
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(10);

    const pillY = height * 0.55;

    // Red pill — enter Construct
    this.redPill = this.createPill(width / 2 - 40, pillY, 0xFF0000);
    this.redPill.setInteractive(
      new Phaser.Geom.Rectangle(-16, -8, 32, 16),
      Phaser.Geom.Rectangle.Contains,
    );
    this.redPill.on('pointerdown', () => this.enterConstruct());
    this.redPill.on('pointerover', () => this.redPill?.setScale(1.2));
    this.redPill.on('pointerout', () => this.redPill?.setScale(1));

    // Blue pill — back to project list
    this.bluePill = this.createPill(width / 2 + 40, pillY, 0x0000FF);
    this.bluePill.setInteractive(
      new Phaser.Geom.Rectangle(-16, -8, 32, 16),
      Phaser.Geom.Rectangle.Contains,
    );
    this.bluePill.on('pointerdown', () => this.backToList());
    this.bluePill.on('pointerover', () => this.bluePill?.setScale(1.2));
    this.bluePill.on('pointerout', () => this.bluePill?.setScale(1));

    // Labels
    this.redLabel = this.add.text(width / 2 - 40, pillY + 14, 'Entrar', {
      fontSize: '6px', color: '#FF0000', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(10);

    this.blueLabel = this.add.text(width / 2 + 40, pillY + 14, 'Voltar', {
      fontSize: '6px', color: '#0000FF', fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(10);

    // Footer
    this.infoText?.setText('Escolha sua pílula.');
    this.infoText?.setPosition(width / 2, height - 8);
  }

  private createPill(x: number, y: number, color: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y).setDepth(10);

    // Pill shape (capsule = rounded rectangle)
    const pill = this.add.graphics();
    pill.fillStyle(color, 1);
    pill.fillRoundedRect(-12, -6, 24, 12, 6);
    pill.lineStyle(1, 0xFFFFFF, 0.5);
    pill.strokeRoundedRect(-12, -6, 24, 12, 6);
    container.add(pill);

    // Shine effect
    const shine = this.add.graphics();
    shine.fillStyle(0xFFFFFF, 0.3);
    shine.fillEllipse(-4, -2, 6, 3);
    container.add(shine);

    return container;
  }

  private async enterConstruct(): Promise<void> {
    if (this.sceneState === 'entering' || !this.selectedProject) return;
    this.sceneState = 'entering';

    // Select project on server (AC: 8)
    try {
      const response = await fetch('/api/project/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath: this.selectedProject.path }),
      });

      if (!response.ok) {
        const error = await response.json() as { error: string };
        throw new Error(error.error ?? `HTTP ${response.status}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.showError(`Falha ao selecionar projeto: ${message}`);
      this.sceneState = 'pills';
      return;
    }

    // Glitch transition effect (same as original LoginScene)
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(500, 0, 255, 65);

    this.time.delayedCall(600, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
    });

    this.time.delayedCall(1200, () => {
      this.scene.start('ConstructScene');
    });
  }

  private backToList(): void {
    if (this.projects.length <= 1) return;

    this.selectedProject = null;

    // Clear pill elements
    this.redPill?.destroy();
    this.bluePill?.destroy();
    this.redLabel?.destroy();
    this.blueLabel?.destroy();
    this.selectedProjectText?.destroy();
    this.redPill = null;
    this.bluePill = null;
    this.redLabel = null;
    this.blueLabel = null;
    this.selectedProjectText = null;

    this.showProjectList();
  }

  private navigateUp(): void {
    if (this.sceneState !== 'list' || this.projects.length === 0) return;
    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    this.updateListHighlight();
  }

  private navigateDown(): void {
    if (this.sceneState !== 'list' || this.projects.length === 0) return;
    this.selectedIndex = Math.min(this.projects.length - 1, this.selectedIndex + 1);
    this.updateListHighlight();
  }

  private confirmSelection(): void {
    if (this.sceneState === 'list' && this.projects[this.selectedIndex]) {
      this.selectedProject = this.projects[this.selectedIndex];
      this.showPills();
    }
  }

  private handleEscape(): void {
    if (this.sceneState === 'pills') {
      this.backToList();
    }
  }

  private updateListHighlight(): void {
    const startY = 28;
    const lineHeight = 12;

    for (let i = 0; i < this.projectTexts.length; i++) {
      this.projectTexts[i].setColor(i === this.selectedIndex ? MATRIX_GREEN : MATRIX_DIM);
    }

    // Update cursor position
    this.cursorGraphic?.setPosition(8, startY + this.selectedIndex * lineHeight);
  }

  private clearListElements(): void {
    for (const text of this.projectTexts) {
      text.destroy();
    }
    this.projectTexts = [];
    this.cursorGraphic?.destroy();
    this.cursorGraphic = null;
  }

  private showError(message: string): void {
    const { width, height } = this.cameras.main;
    this.infoText?.setText('');

    const errorText = this.add.text(width / 2, height * 0.7, message, {
      fontSize: '5px',
      color: '#FF4444',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setDepth(10);

    this.time.delayedCall(3000, () => errorText.destroy());
  }

  private formatTimeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  }

  // Code rain (same system as LoginScene)
  private initCodeRain(width: number, height: number): void {
    const colSpacing = 8;
    const numColumns = Math.ceil(width / colSpacing);

    for (let i = 0; i < numColumns; i++) {
      this.columns.push({
        x: i * colSpacing,
        chars: [],
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
        const charIndex = Math.floor(Math.random() * CODE_RAIN_CHARS.length);
        col.chars.push({
          y: col.nextSpawnY,
          char: CODE_RAIN_CHARS[charIndex],
          alpha: 1,
        });
        col.nextSpawnY = -8;
      }

      for (const ch of col.chars) {
        ch.y += col.speed;
        ch.alpha -= 0.005;
      }

      col.chars = col.chars.filter(ch => ch.y < height + 16 && ch.alpha > 0);
    }
  }
}
