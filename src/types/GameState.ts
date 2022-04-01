import { GameBoard } from "./GameBoard";

export type GameState = {
  board: GameBoard;
  players: string[];
  activePlayer: string;
};
