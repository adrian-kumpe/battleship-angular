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
    this.camera.setBackgroundColor(0x00ff00);

    this.background = this.add.image(512, 384, 'background');
    this.background.setAlpha(0.5);

    this.attackGrid = new BattleshipGrid('attack', data.gridSize, data.opponent);
    this.defenseGrid = new BattleshipGrid('defense', data.gridSize, data.player);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, object: any) => {
      // todo hier müsste es echte koordinaten geben
      const x = Math.floor((pointer.x / 1024) * 8);
      const y = Math.floor((pointer.y / 768) * 8);
      this.playerMove(x, y);
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
        this.displayAttackedCell('attack', x, y, 'hit');
        if (this.attackGrid.getShipWasSunken(move)) {
          this.displayShipWasSunken(move);
        }
      } else {
        this.displayAttackedCell('attack', x, y, 'missed');
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
    this.defenseGrid.placeMove(x, y);
    // todo einen sinnvollen weg finden für die Ausgabe
    this.checkGameOver();
    this.test();
  }

  test() {
    const b = [];
    for (let x = 0; x < 8; x++) {
      const a = [];
      for (let y = 0; y < 8; y++) {
        a.push(this.defenseGrid.isValidMove(x, y) ? ' ' : 'X');
      }
      b.push(a);
    }
    console.table(b);
    console.log(
      b
        .flat()
        .filter((v) => v !== ' ')
        .join('').length,
    );
  }

  private displayAttackedCell(grid: string, x: number, y: number, state: 'hit' | 'missed') {
    console.log('AUSGABE ' + x * 1024 + 30 + ' / ' + y * 768 + 30);
    this.add
      .text((x * 1024) / 8 + 30, (y * 768) / 8 + 30, state, {
        fontFamily: 'Arial Black',
        fontSize: 30,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100);
  }

  private displayShipWasSunken(shipId: number) {
    alert('Schiff ' + shipId + ' wurde versenkt!');
  }
}
