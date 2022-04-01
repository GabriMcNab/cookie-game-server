import { Border, GameBox } from "../types";

/**
 * Generates a new GameBox. It sets the borders if the GameBox is one of the boxes on the edge of the GameBoard
 * @param col Horizontal position in the current row
 * @param row Current row number
 * @param elementsPerRow Number of GameBox elements that are present in the row
 * @param midPoint Reference to the midpoint of the current GameBoard
 * @returns New GameBox object with external borders already set
 */
export function generateGameBox(
  col: number,
  row: number,
  elementsPerRow: number,
  midPoint: number
): GameBox {
  const externalBorders: Border[] = [];

  if (col === 1 || col === elementsPerRow) {
    if (col === 1) externalBorders.push("west");
    if (col === elementsPerRow) externalBorders.push("east");
    if (row <= midPoint) externalBorders.push("north");
    if (row >= midPoint) externalBorders.push("south");
  }

  return {
    position: [0, 0],
    selectedBorders: [...externalBorders],
    externalBorders: [...externalBorders],
  };
}

/**
 * Get the border on the opposite side of the one passed as parameter
 * @param border
 * @returns Opposite border
 */
export function getOppositeBorder(border: Border): Border {
  const oppositeBorders: Record<Border, Border> = {
    east: "west",
    north: "south",
    west: "east",
    south: "north",
  };
  return oppositeBorders[border];
}

/**
 * Updates the GameBox by setting the selectedBorders and checking if it's completed
 * @param box GameBox to update
 * @param border Border clicked
 * @param player Current active player
 * @returns Updated GameBox
 */
export function updateGameBox(
  box: GameBox,
  border: Border,
  player: string
): GameBox {
  box.selectedBorders.push(border);

  if (box.selectedBorders.length === 4) {
    box.completedBy = player;
  }

  return box;
}
