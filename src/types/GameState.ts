import { GameBoard, Player } from "@/types";

export type GameState = {
  board: GameBoard;
  players: Player[];
  activePlayer?: Player["number"];
};
