import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { BattleshipGrid } from '../elements/BattleshipGrid';
import { ShipsOnGrid } from './GameSetup';

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameText: Phaser.GameObjects.Text;

  attackGrid: BattleshipGrid;
  defenseGrid: BattleshipGrid;

  constructor() {
    super('Game');
  }

  create(data: { player: ShipsOnGrid; opponent: ShipsOnGrid; gridSize: number }) {
    this.camera = this.cameras.main;
    this.drawGrid();
    this.camera.setBackgroundColor(0x00ff00);

    this.background = this.add.image(512, 384, 'background');
    this.background.setAlpha(0.5);

    this.attackGrid = new BattleshipGrid(
      data.gridSize,
      { gridOffsetX: 50, gridOffsetY: 170, cellSize: 50 },
      data.opponent,
    );
    this.defenseGrid = new BattleshipGrid(
      data.gridSize,
      { gridOffsetX: 550, gridOffsetY: 170, cellSize: 50 },
      data.player,
    );

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const x = pointer.x - this.attackGrid.getGridData().gridOffsetX;
      const y = pointer.y - this.attackGrid.getGridData().gridOffsetY;
      if (
        x > 0 &&
        y > 0 &&
        x < this.attackGrid.getGridData().cellSize * data.gridSize &&
        y < this.attackGrid.getGridData().cellSize * data.gridSize
      ) {
        this.playerMove(
          Math.floor(x / this.attackGrid.getGridData().cellSize),
          Math.floor(y / this.attackGrid.getGridData().cellSize),
        );
      }
    });
    // todo es müsste noch rechtsklick geben, mit dem man markieren kann, dass dort kein schiff ist

    EventBus.emit('current-scene-ready', this);
  }

  changeScene(data: { winner: string }) {
    this.scene.start('GameOver', data);
  }

  /**
   * checks whether the game is still in progress
   * @returns whether the game is over
   */
  checkGameOver(): boolean {
    if (this.attackGrid.allShipsSunken()) {
      // player has won the game
      alert('player has won the game');
      this.changeScene({ winner: 'player' });
      return true;
    }
    if (this.defenseGrid.allShipsSunken()) {
      // the opponent has won the game
      alert('the opponent has won the game');
      this.changeScene({ winner: 'opponent' });
      return true;
    }
    return false;
  }

  private playerMove(x: number, y: number) {
    if (this.attackGrid.isValidMove(x, y)) {
      const move = this.attackGrid.placeMove(x, y);
      if (move !== undefined) {
        this.drawMove(this.attackGrid.getGridData(), x, y, 'H');
        if (this.attackGrid.getShipWasSunken(move)) {
          this.displayShipWasSunken(move);
        }
      } else {
        this.drawMove(this.attackGrid.getGridData(), x, y, 'M');
      }
      if (!this.checkGameOver()) {
        this.opponentMove();
      }
    }
  }

  private opponentMove() {
    let x, y;
    do {
      x = Math.floor(Math.random() * 8);
      y = Math.floor(Math.random() * 8);
    } while (!this.defenseGrid.isValidMove(x, y));
    const move = this.defenseGrid.placeMove(x, y);
    if (move !== undefined) {
      this.drawMove(this.defenseGrid.getGridData(), x, y, 'H');
      if (this.defenseGrid.getShipWasSunken(move)) {
        this.displayShipWasSunken(move);
      }
    } else {
      this.drawMove(this.defenseGrid.getGridData(), x, y, 'M');
    }
    this.checkGameOver();
  }

  private displayShipWasSunken(shipId: number) {
    alert('Schiff ' + shipId + ' wurde versenkt!');
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

  private drawMove(
    gridData: { gridOffsetX: number; gridOffsetY: number; cellSize: number },
    x: number,
    y: number,
    char: string,
  ) {
    this.gameText = this.add.text(
      gridData.gridOffsetX + gridData.cellSize * x + 15,
      gridData.gridOffsetY + gridData.cellSize * y + 15,
      char,
      {
        fontFamily: 'Arial Black',
        fontSize: 24,
        color: '#000000',
      },
    );
  }
}
