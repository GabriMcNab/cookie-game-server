import { generateGameBox } from "@/services/gameBox";
import { Border, Coordinates, GameBoard } from "@/types";

/**
 * Generates a new game board
 * @param size Size of the game board. Must be an odd number
 * @returns GameBoard object
 */
export function generateGameBoard(size: number): GameBoard {
  const gameBoard: GameBoard = {};
  const midPoint = (size + 1) / 2;

  let elementsPerRow = 2;
  for (let y = 1; y <= size; y++) {
    const offset = (size - elementsPerRow) / 2;

    for (let x = 1; x <= elementsPerRow; x++) {
      const gameBox = generateGameBox(x, y, elementsPerRow, midPoint);
      const position: Coordinates = [x + offset, y];
      gameBoard[position.toString()] = { ...gameBox, position };
    }

    if (y < midPoint - 1) {
      elementsPerRow += 2;
    } else if (y > midPoint) {
      elementsPerRow -= 2;
    }
  }

  return gameBoard;
}

/**
 * Get the position of the GameBox adjacent to the border passed as parameter
 * @param position Position of current GameBox
 * @param side Border shared with adjacent target GameBox
 * @returns Coordinates of adjacent position
 */
export function getAdjacentGameBoxPosition(
  position: Coordinates,
  side: Border
): Coordinates {
  let adjacentPosition: Coordinates;
  switch (side) {
    case "east":
      adjacentPosition = [position[0] + 1, position[1]];
      break;
    case "south":
      adjacentPosition = [position[0], position[1] + 1];
      break;
    case "west":
      adjacentPosition = [position[0] - 1, position[1]];
      break;
    case "north":
      adjacentPosition = [position[0], position[1] - 1];
      break;
  }

  return adjacentPosition;
}
