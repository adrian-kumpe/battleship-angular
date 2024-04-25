import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export interface availableShip {
  name: string;
  size: number;
}

export interface shipOnGrid {
  ship: availableShip;
  shipId: number;
  orientation?: '↔️' | '↕️';
  x: number;
  y: number;
}

interface gridCell {
  shipId?: number; // cell is busy if shipId is present
  hit: boolean;
}

type BattleshipGrid = {
  name: string; // name als referenz nutzen zur grafischen darstellung
  grid: gridCell[][];
};

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameText: Phaser.GameObjects.Text;

  // todo das global liegen haben, evtl maximal anzahl hier pflegen
  availableShips: availableShip[] = [
    { name: 'aircraft-carrier', size: 5 },
    { name: 'battleship', size: 4 },
    { name: 'cruiser', size: 3 },
    { name: 'destroyer', size: 2 },
    { name: 'escort', size: 1 },
  ];

  // todo größe des grids als input bekommen
  gridSize = 8;
  attackGrid: BattleshipGrid;
  defenseGrid: BattleshipGrid;

  constructor() {
    super('Game');
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x00ff00);

    this.background = this.add.image(512, 384, 'background');
    this.background.setAlpha(0.5);

    // todo das als input bekommen für gegner und spieler
    const shipsOnGrid: shipOnGrid[] = [
      { ship: this.availableShips[0], shipId: 1243, orientation: '↕️', x: 0, y: 0 },
      { ship: this.availableShips[2], shipId: 4313, orientation: '↔️', x: 2, y: 0 },
      { ship: this.availableShips[3], shipId: 2433, orientation: '↕️', x: 3, y: 3 },
    ];

    this.attackGrid = this.initializeGrid('attackGrid', shipsOnGrid);
    this.defenseGrid = this.initializeGrid('defenseGrid', shipsOnGrid.reverse()); // todo sinnvolle werte verwenden

    this.input.on('pointerdown', (pointer: any, object: any) => {
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
  checkGameOver(): void | false {
    if (this.getRemainingShipIds(this.attackGrid).length === 0) {
      // player has won the game
      alert('player has won the game');
      this.changeScene({ winner: 'player' });
    }
    if (this.getRemainingShipIds(this.defenseGrid).length === 0) {
      // the opponent has won the game
      alert('the opponent has won the game');
      this.changeScene({ winner: 'opponent' });
    }
    return false;
  }

  private playerMove(x: number, y: number) {
    if (this.attackCellOfBattleshipGrid(this.attackGrid, x, y)) {
      if (!this.checkGameOver()) {
        this.opponentMove();
      }
    }
  }

  private opponentMove() {
    while (
      this.attackCellOfBattleshipGrid(this.defenseGrid, Math.floor(Math.random() * 8), Math.floor(Math.random() * 8))
    );
    this.checkGameOver();
  }

  /**
   * given grid is filled with empty cells and all ships from shipsOnGrid are placed into the grid
   * @param shipsOnGrid array w/ information of ships to place on the grid
   * @returns grid used for attackGrid or defenseGrid
   */
  private initializeGrid(name: string, shipsOnGrid: shipOnGrid[]): BattleshipGrid {
    const grid = new Array(this.gridSize).fill(null).map(() => {
      return new Array(this.gridSize).fill(null).map(() => ({ hit: false }) as gridCell);
    });
    shipsOnGrid.forEach((s) => {
      for (let i = 0; i < s.ship.size; i++) {
        const x = s.orientation === '↔️' ? s.x + i : s.x;
        const y = s.orientation === '↔️' ? s.y : s.y + i;
        grid[x][y].shipId = s.shipId;
      }
    });
    return { name: name, grid: grid };
  }

  /**
   * a move is evaluated
   * @param grid the given BattleshipGrid
   * @param x coordinate
   * @param y coordinate
   * @returns whether a valid cell was hit
   */
  private attackCellOfBattleshipGrid(grid: BattleshipGrid, x: number, y: number): boolean {
    if (x > this.gridSize || y > this.gridSize || grid.grid[x][y].hit) {
      return false; // todo sinnvolle fehlerbehandlung
    }
    grid.grid[x][y].hit = true;
    const shipId = grid.grid[x][y].shipId;
    if (shipId !== undefined) {
      this.displayAttackedCell(grid, x, y, 'hit');
      if (this.getShipWasSunken(grid, shipId)) {
        this.displayShipWasSunken(shipId);
      }
    } else {
      this.displayAttackedCell(grid, x, y, 'missed');
    }
    return true;
  }

  /**
   * get all shipIds of not sunken ships of the given grid
   * @param grid the given BattleshipGrid
   * @returns array of shipIds
   */
  private getRemainingShipIds(grid: BattleshipGrid): number[] {
    console.log('Restliche Schiffe auf ' + grid.name + ':');
    console.log([
      ...new Set(
        grid.grid
          .flat()
          .filter((s) => !s.hit && s.shipId !== undefined)
          .map(({ shipId }) => shipId as number), // no undefined because busy
      ),
    ]);
    if (grid.name === 'defenseGrid') {
      console.log('Das Grid gegen das der Computer spielt:');
      console.log(grid);
    }
    return [
      ...new Set(
        grid.grid
          .flat()
          .filter((s) => !s.hit && s.shipId !== undefined)
          .map(({ shipId }) => shipId as number), // undefined not possible because busy
      ),
    ];
  }

  /**
   * checks whether a ship is still alive
   * @param grid the given BattleshipGrid
   * @param shipId of the in question ship
   * @returns whether the ship was sunken
   */
  private getShipWasSunken(grid: BattleshipGrid, shipId: number): boolean {
    return !this.getRemainingShipIds(grid).includes(shipId);
  }

  private displayAttackedCell(grid: BattleshipGrid, x: number, y: number, state: 'hit' | 'missed') {
    if (grid.name === 'defenseGrid') {
      return;
    }
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
