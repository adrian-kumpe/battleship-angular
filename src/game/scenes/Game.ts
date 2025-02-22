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

    EventBus.emit('current-scene-ready', this);
  }

  changeScene(data: { winner: string }) {
    this.scene.start('GameOver', data);
  }

  /**
   * checks whether the game is still in progress
   * @returns whether the game is over
   */
  private checkGameOver(): boolean {
    if (this.attackGrid.getAllShipsSunken()) {
      // player has won the game
      alert('player has won the game');
      this.changeScene({ winner: 'player' });
      return true;
    }
    if (this.defenseGrid.getAllShipsSunken()) {
      // the opponent has won the game
      alert('the opponent has won the game');
      this.changeScene({ winner: 'opponent' });
      return true;
    }
    return false;
  }

  /**
   * performs a player move if x and y are valid
   * @param x coordinate
   * @param y coordinate
   */
  private playerMove(x: number, y: number) {
    if (this.attackGrid.isValidMove(x, y)) {
      const shipId = this.attackGrid.placeMove(x, y);
      const { xPx, yPx } = this.attackGrid.getGridCellToCoordinate(x, y);
      if (shipId !== undefined) {
        this.drawMove(xPx, yPx, 'H');
        if (this.attackGrid.getShipWasSunken(shipId)) {
          this.displayShipWasSunken(shipId);
        }
      } else {
        this.drawMove(xPx, yPx, 'M');
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
    const shipId = this.defenseGrid.placeMove(x, y);
    const { xPx, yPx } = this.defenseGrid.getGridCellToCoordinate(x, y);
    if (shipId !== undefined) {
      this.drawMove(xPx, yPx, 'H');
      if (this.defenseGrid.getShipWasSunken(shipId)) {
        this.displayShipWasSunken(shipId);
      }
    } else {
      this.drawMove(xPx, yPx, 'M');
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
        const rect = this.add.rectangle(x, y, cellSize, cellSize, 0xffffff);
        rect.setStrokeStyle(3, 0x000000).setOrigin(0).strokeColor;
        rect.setInteractive();
        rect.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (pointer.leftButtonDown()) {
            this.playerMove(col, row);
          }
          if (pointer.rightButtonDown()) {
            alert('rechtsklick');
            // todo es müsste noch rechtsklick geben, mit dem man markieren kann, dass dort kein schiff ist
          }
        });
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

    this.gameText = this.add.text(
      offsetX,
      offsetY + 435,
      'There are 3 ships to hit\n    aircraft-carrier with size: 5\n    cruiser with size: 3\n    destroyer with size: 2',
      {
        fontFamily: 'Arial Black',
        fontSize: 24,
        color: '#000000',
      },
    );

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

    this.gameText = this.add.text(offsetX, offsetY + 435, "The opponent tries to guess \nyour ships' positions.", {
      fontFamily: 'Arial Black',
      fontSize: 24,
      color: '#000000',
    });
  }

  private drawMove(xPx: number, yPx: number, char: string) {
    this.gameText = this.add.text(xPx + 15, yPx + 15, char, {
      fontFamily: 'Arial Black',
      fontSize: 24,
      color: '#000000',
    });
  }
}
