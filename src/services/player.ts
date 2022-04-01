import { Player } from "@/types";

/**
 * Creates a new player object to be added to the game
 * @param id Socket id of the new player
 * @param players Array of current players in the game
 * @returns New player object
 */
export function createNewPlayer(id: string, players: Player[]): Player {
  const player: Player = { id, number: 1 };

  if (players.length > 2) {
    throw new Error("The players number must be 2 or less");
  }

  console.log(players.length);
  if (players.length > 0) {
    const currentPlayerNumber = players[0].number;
    console.log("current player number" + currentPlayerNumber);
    player.number = currentPlayerNumber === 1 ? 2 : 1;
  }

  console.log("Created player " + player.id + " " + player.number);
  return player;
}
