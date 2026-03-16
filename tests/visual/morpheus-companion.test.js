const fs = require('fs');
const path = require('path');

const VISUAL_DIR = path.join(__dirname, '../../apps/visual');

describe('MorpheusCompanion — NPC companheiro do player', () => {
  let companionSource;

  beforeAll(() => {
    companionSource = fs.readFileSync(
      path.join(VISUAL_DIR, 'src/client/objects/MorpheusCompanion.ts'),
      'utf8',
    );
  });

  test('arquivo MorpheusCompanion.ts existe', () => {
    expect(fs.existsSync(
      path.join(VISUAL_DIR, 'src/client/objects/MorpheusCompanion.ts'),
    )).toBe(true);
  });

  test('exporta classe MorpheusCompanion', () => {
    expect(companionSource).toContain('export class MorpheusCompanion');
  });

  test('importa tipo Agent', () => {
    expect(companionSource).toContain("from '@/client/objects/Agent'");
  });

  test('recebe morpheus e player no construtor', () => {
    expect(companionSource).toContain('morpheus: Agent');
    expect(companionSource).toContain('player: Agent');
  });

  test('constantes de distância de seguir', () => {
    expect(companionSource).toContain('FOLLOW_DISTANCE');
    expect(companionSource).toContain('FOLLOW_SPEED');
    expect(companionSource).toContain('IDLE_DISTANCE');
  });

  test('método update() para lógica por frame', () => {
    expect(companionSource).toContain('update()');
  });

  test('calcula distância entre player e morpheus', () => {
    expect(companionSource).toContain('Math.sqrt');
    expect(companionSource).toContain('this.player.x');
    expect(companionSource).toContain('this.morpheus.x');
  });

  test('fica idle quando está perto o suficiente', () => {
    expect(companionSource).toContain('IDLE_DISTANCE');
    expect(companionSource).toContain("setAnimationState('idle')");
  });

  test('caminha em direção ao player quando longe', () => {
    expect(companionSource).toContain('FOLLOW_DISTANCE');
    expect(companionSource).toContain('setPosition');
  });

  test('define animação de caminhada baseada na direção', () => {
    expect(companionSource).toContain("'walk-left'");
    expect(companionSource).toContain("'walk-right'");
    expect(companionSource).toContain("'walk-up'");
    expect(companionSource).toContain("'walk-down'");
  });

  test('getMorpheus retorna o agente Morpheus', () => {
    expect(companionSource).toContain('getMorpheus()');
  });

  test('getPlayer retorna o agente player', () => {
    expect(companionSource).toContain('getPlayer()');
  });

  test('pauseFollow para cutscenes', () => {
    expect(companionSource).toContain('pauseFollow()');
    expect(companionSource).toContain('isFollowing = false');
  });

  test('resumeFollow para retomar', () => {
    expect(companionSource).toContain('resumeFollow()');
    expect(companionSource).toContain('isFollowing = true');
  });

  test('isCurrentlyFollowing verifica estado', () => {
    expect(companionSource).toContain('isCurrentlyFollowing()');
  });

  test('destroy limpa estado', () => {
    expect(companionSource).toContain('destroy()');
  });
});

describe('ConstructScene — Player avatar + Morpheus companheiro', () => {
  let sceneSource;

  beforeAll(() => {
    sceneSource = fs.readFileSync(
      path.join(VISUAL_DIR, 'src/client/scenes/ConstructScene.ts'),
      'utf8',
    );
  });

  test('importa MorpheusCompanion', () => {
    expect(sceneSource).toContain("from '@/client/objects/MorpheusCompanion'");
  });

  test('importa Agent diretamente (para criar player)', () => {
    expect(sceneSource).toContain("import { Agent }");
  });

  test('propriedade playerAvatar separada', () => {
    expect(sceneSource).toContain('playerAvatar');
  });

  test('propriedade morpheusCompanion', () => {
    expect(sceneSource).toContain('morpheusCompanion');
  });

  test('cria player com agentId player (não morpheus)', () => {
    expect(sceneSource).toContain("agentId: 'player'");
  });

  test('player spawna no centro do mapa', () => {
    expect(sceneSource).toContain('level.pxWid / 2');
    expect(sceneSource).toContain('level.pxHei / 2');
  });

  test('player tem ícone de avatar', () => {
    expect(sceneSource).toContain("setIcon('👤')");
  });

  test('player tem depth maior que agentes', () => {
    expect(sceneSource).toContain('setDepth(5)');
  });

  test('PlayerController usa playerAvatar (não morpheus)', () => {
    expect(sceneSource).toContain('new PlayerController(this, this.playerAvatar');
  });

  test('MorpheusCompanion recebe morpheus e playerAvatar', () => {
    expect(sceneSource).toContain('new MorpheusCompanion(morpheus, this.playerAvatar)');
  });

  test('câmera segue o playerAvatar', () => {
    expect(sceneSource).toContain('followTarget: this.playerAvatar');
  });

  test('update() chama morpheusCompanion.update()', () => {
    expect(sceneSource).toContain('this.morpheusCompanion?.update()');
  });

  test('getPlayerAvatar() retorna avatar do player', () => {
    expect(sceneSource).toContain('getPlayerAvatar()');
  });

  test('getMorpheusCompanion() retorna o companheiro', () => {
    expect(sceneSource).toContain('getMorpheusCompanion()');
  });

  test('logs em PT-BR', () => {
    expect(sceneSource).toContain('agentes criados');
    expect(sceneSource).toContain('Mapa carregado');
  });
});
