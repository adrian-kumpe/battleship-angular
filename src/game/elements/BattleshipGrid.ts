import { shipOnGrid } from '../scenes/Game';

export interface gridCell {
  shipId?: number; // cell is busy if shipId is present
  hit: boolean;
}

export class BattleshipGrid {
  public grid: gridCell[][];

  constructor(
    public name: string, // todo name als referenz nutzen zur grafischen darstellung
    private gridSize: number,
    /** array w/ information of ships to place on the grid */
    private shipsOnGrid: shipOnGrid[],
  ) {
    this.initializeGrid();
  }

  /**
   * grid is filled with empty cells and all ships from shipsOnGrid are placed into the grid
   */
  private initializeGrid() {
    const grid = new Array(this.gridSize).fill(null).map(() => {
      return new Array(this.gridSize).fill(null).map(() => ({ hit: false }) as gridCell);
    });
    this.shipsOnGrid.forEach((s) => {
      for (let i = 0; i < s.ship.size; i++) {
        const x = s.orientation === '↔️' ? s.x + i : s.x;
        const y = s.orientation === '↔️' ? s.y : s.y + i;
        grid[x][y].shipId = s.shipId;
      }
    });
    this.grid = grid;
  }

  /**
   * get all shipIds of not sunken ships of the given grid
   * @returns array of shipIds
   */
  public getRemainingShipIds(): number[] {
    return [
      ...new Set(
        this.grid
          .flat()
          .filter((s) => !s.hit && s.shipId !== undefined)
          .map(({ shipId }) => shipId as number),
      ),
    ];
  }

  /**
   * checks whether there are still intact ships
   * @returns whether all ships were sunken
   */
  public allShipsSunken(): boolean {
    return this.getRemainingShipIds().length === 0;
  }

  /**
   * checks whether a ship is still alive
   * @param shipId of the in question ship
   * @returns whether the ship was sunken
   */
  public getShipWasSunken(shipId: number): boolean {
    return !this.getRemainingShipIds().includes(shipId);
  }

  /**
   * move is evaluated
   * @param x coordinate
   * @param y coordinate
   * @returns whether the cell was already hit
   */
  public isValidMove(x: number, y: number): boolean {
    return x < this.gridSize && y < this.gridSize && !this.grid[x][y].hit;
  }

  /**
   * move is placed
   * @param x coordinate
   * @param y coordinate
   * @returns shipId (hit) or undefined (missed)
   */
  public placeMove(x: number, y: number): number | undefined {
    this.grid[x][y].hit = true;
    return this.grid[x][y].shipId;
  }
}
