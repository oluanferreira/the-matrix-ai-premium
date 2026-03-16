import Phaser from 'phaser';
import { BootScene } from '@/client/scenes/BootScene';
import { ConstructScene } from '@/client/scenes/ConstructScene';
import { GAME_CONFIG } from '@/client/config';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: '#0D0208',
  scene: [BootScene, ConstructScene],
};

new Phaser.Game(config);
