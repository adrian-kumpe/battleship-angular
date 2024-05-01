import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export const enum gameModes {
  '8x8' = 0,
}

interface shipData {
  name: string;
  size: number;
}

interface shipOnGrid {
  ship: shipData;
  shipId: number;
  orientation?: '↔️' | '↕️';
  x: number;
  y: number;
}

export type ShipsOnGrid = shipOnGrid[];

export class GameSetup extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameOverText: Phaser.GameObjects.Text;

  gridSize: number;
  playersShipsOnGrid: ShipsOnGrid;
  opponentsShipsOnGrid: ShipsOnGrid;
  private numberOfShipsAvailable: number[];
  private availableShips: shipData[] = [
    { name: 'aircraft-carrier', size: 5 },
    { name: 'battleship', size: 4 },
    { name: 'cruiser', size: 3 },
    { name: 'destroyer', size: 2 },
    { name: 'escort', size: 1 },
  ];
  private baseShipId = 1000;

  constructor() {
    super('GameSetup');
  }

  create(data: { gameMode: gameModes }) {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xff4500);

    this.background = this.add.image(512, 384, 'background');
    this.background.setAlpha(0.5);

    switch (data.gameMode) {
      default:
      case gameModes['8x8']:
        this.gridSize = 8;
        this.numberOfShipsAvailable = [1, 1, 1, 1, 1];
        break;
    }

    this.playersShipsOnGrid = this.placeShipsOnGridRandomly();
    this.opponentsShipsOnGrid = this.placeShipsOnGridRandomly();

    EventBus.emit('current-scene-ready', this);
  }

  changeScene() {
    this.scene.start('Game', {
      player: this.playersShipsOnGrid,
      opponent: this.opponentsShipsOnGrid,
      gridSize: this.gridSize,
    });
  }

  private getShipId(): number {
    return this.baseShipId++;
  }

  private placeShipsOnGridRandomly(): ShipsOnGrid {
    return [
      { ship: this.availableShips[0], shipId: this.getShipId(), orientation: '↕️', x: 0, y: 0 },
      { ship: this.availableShips[2], shipId: this.getShipId(), orientation: '↔️', x: 2, y: 0 },
      { ship: this.availableShips[3], shipId: this.getShipId(), orientation: '↕️', x: 3, y: 3 },
    ];
    const shipsOnGrid: ShipsOnGrid = [];
    // const placementGrid: boolean[][] = [];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < this.numberOfShipsAvailable[i]; j++) {
        const orientation = Math.random() < 0.5 ? '↕️' : '↔️';
        // todo hier solange generieren, bis die verteilung passt
        const x = Math.floor(
          Math.random() * (this.gridSize - (orientation === '↔️' ? this.availableShips[i].size + 1 : 0)),
        );
        const y = Math.floor(
          Math.random() * (this.gridSize - (orientation === '↕️' ? this.availableShips[i].size + 1 : 0)),
        );
        shipsOnGrid.push({
          ship: this.availableShips[i],
          shipId: this.getShipId(),
          orientation: orientation,
          x: x,
          y: y,
        });
      }
    }
    return shipsOnGrid;
  }
}
