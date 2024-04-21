import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameText: Phaser.GameObjects.Text;

  constructor() {
    super('Game');
  }

  create() {
    this.camera = this.cameras.main;
    this.drawGrid();

    EventBus.emit('current-scene-ready', this);
  }

  drawGrid() {
    const gridSize = 8;
    const cellSize = 50;
    const offsetY = 170;
    let offsetX = 50;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = offsetX + col * cellSize;
        const y = offsetY + row * cellSize;
        this.add.rectangle(x, y, cellSize, cellSize, 0xffffff).setStrokeStyle(3, 0x000000).setOrigin(0).strokeColor;
      }
    }

    this.gameText = this.add.text(offsetX + 15, offsetY - 35, 'A    B    C    D    E    F    G    H', {
      fontFamily: 'Arial Black',
      fontSize: 24,
      color: '#000000',
    });

    this.gameText = this.add.text(offsetX - 25, offsetY + 5, '1 \n\n2 \n\n3 \n\n4 \n\n5 \n\n6 \n\n7 \n\n8', {
      fontFamily: 'Arial Black',
      fontSize: 23,
      color: '#000000',
    });

    offsetX = 550;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = offsetX + col * cellSize;
        const y = offsetY + row * cellSize;
        this.add.rectangle(x, y, cellSize, cellSize, 0xffffff).setStrokeStyle(3, 0x000000).setOrigin(0).strokeColor;
      }
    }

    this.gameText = this.add.text(offsetX + 15, offsetY - 35, 'A    B    C    D    E    F    G    H', {
      fontFamily: 'Arial Black',
      fontSize: 24,
      color: '#000000',
    });

    this.gameText = this.add.text(offsetX - 25, offsetY + 5, '1 \n\n2 \n\n3 \n\n4 \n\n5 \n\n6 \n\n7 \n\n8', {
      fontFamily: 'Arial Black',
      fontSize: 23,
      color: '#000000',
    });
  }
}
