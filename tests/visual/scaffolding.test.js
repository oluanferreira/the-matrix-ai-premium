const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('Story 1.1: apps/visual scaffolding', () => {
  describe('directory structure (AC: 1)', () => {
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'index.html',
      'src/client/main.ts',
      'src/client/config.ts',
      'src/client/scenes/BootScene.ts',
      'src/shared/types.ts',
      'src/shared/constants.ts',
      'src/shared/agent-ids.ts',
    ];

    test.each(requiredFiles)('%s exists', (file) => {
      const filePath = path.join(VISUAL_DIR, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe('package.json (AC: 1, 3, 7, 8)', () => {
    let pkg;

    beforeAll(() => {
      pkg = JSON.parse(fs.readFileSync(path.join(VISUAL_DIR, 'package.json'), 'utf8'));
    });

    test('has correct name', () => {
      expect(pkg.name).toBe('@the-matrix/visual');
    });

    test('uses ES modules', () => {
      expect(pkg.type).toBe('module');
    });

    test('has phaser ^3.90.0 dependency', () => {
      expect(pkg.dependencies.phaser).toMatch(/^\^3\.90/);
    });

    test('has vite dev dependency', () => {
      expect(pkg.devDependencies.vite).toBeDefined();
    });

    test('has typescript dev dependency', () => {
      expect(pkg.devDependencies.typescript).toBeDefined();
    });

    test('has dev script using vite', () => {
      expect(pkg.scripts.dev).toContain('vite');
    });

    test('has build script', () => {
      expect(pkg.scripts.build).toContain('vite build');
    });

    test('has typecheck script', () => {
      expect(pkg.scripts.typecheck).toBe('tsc --noEmit');
    });

    test('has lint script', () => {
      expect(pkg.scripts.lint).toBeDefined();
    });
  });

  describe('npm workspaces (AC: 2)', () => {
    test('root package.json includes apps/* workspace', () => {
      const rootPkg = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'),
      );
      expect(rootPkg.workspaces).toContain('apps/*');
    });
  });

  describe('tsconfig.json (AC: 9)', () => {
    let tsconfig;

    beforeAll(() => {
      tsconfig = JSON.parse(fs.readFileSync(path.join(VISUAL_DIR, 'tsconfig.json'), 'utf8'));
    });

    test('has strict mode enabled', () => {
      expect(tsconfig.compilerOptions.strict).toBe(true);
    });

    test('targets ES2022', () => {
      expect(tsconfig.compilerOptions.target).toBe('ES2022');
    });

    test('uses ESNext modules (for Vite)', () => {
      expect(tsconfig.compilerOptions.module).toBe('ESNext');
    });

    test('has @ path alias', () => {
      expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['src/*']);
    });
  });

  describe('vite.config.ts (AC: 4)', () => {
    let viteConfig;

    beforeAll(() => {
      viteConfig = fs.readFileSync(path.join(VISUAL_DIR, 'vite.config.ts'), 'utf8');
    });

    test('configures port 3000', () => {
      expect(viteConfig).toContain('port: 3000');
    });

    test('configures /api proxy to localhost:3001', () => {
      expect(viteConfig).toContain("'/api': 'http://localhost:3001'");
    });

    test('configures output directory', () => {
      expect(viteConfig).toContain("outDir: 'dist/client'");
    });
  });

  describe('Phaser config (AC: 5, 6)', () => {
    let mainTs;

    beforeAll(() => {
      mainTs = fs.readFileSync(path.join(VISUAL_DIR, 'src/client/main.ts'), 'utf8');
    });

    test('enables pixelArt mode (nearest-neighbor)', () => {
      expect(mainTs).toContain('pixelArt: true');
    });

    test('uses Scale.FIT', () => {
      expect(mainTs).toContain('Phaser.Scale.FIT');
    });

    test('uses CENTER_BOTH', () => {
      expect(mainTs).toContain('Phaser.Scale.CENTER_BOTH');
    });

    test('imports BootScene', () => {
      expect(mainTs).toContain('BootScene');
    });
  });

  describe('game config values (AC: 5)', () => {
    let configTs;

    beforeAll(() => {
      configTs = fs.readFileSync(path.join(VISUAL_DIR, 'src/client/config.ts'), 'utf8');
    });

    test('has 320x180 base resolution', () => {
      expect(configTs).toContain('WIDTH: 320');
      expect(configTs).toContain('HEIGHT: 180');
    });

    test('has 6x scale factor', () => {
      expect(configTs).toContain('SCALE: 6');
    });
  });

  describe('agent IDs (19 agents)', () => {
    let agentIds;

    beforeAll(() => {
      agentIds = fs.readFileSync(path.join(VISUAL_DIR, 'src/shared/agent-ids.ts'), 'utf8');
    });

    test('has all 19 agent definitions', () => {
      const expectedAgents = [
        'NEO', 'ORACLE', 'ARCHITECT', 'TRINITY', 'KEYMAKER',
        'NIOBE', 'LINK', 'TANK', 'SATI', 'OPERATOR',
        'LOCK', 'MOUSE', 'SPARKS', 'MEROVINGIAN', 'PERSEPHONE',
        'GHOST', 'SERAPH', 'SMITH', 'MORPHEUS',
      ];
      expectedAgents.forEach(agent => {
        expect(agentIds).toContain(agent);
      });
    });
  });
});
