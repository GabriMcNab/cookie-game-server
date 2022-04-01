import express from "express";
import { nanoid } from "nanoid";
import cloneDeep from "lodash.clonedeep";
import { Server } from "socket.io";
import { generateGameBoard } from "./services/gameBoard";
import { GameState } from "./types";

const games = new Map<string, GameState>();

const app = express();

app.post("/games/new", (_, res) => {
  const gameId = nanoid(6);
  const board = generateGameBoard(8);
  const game: GameState = {
    board,
    activePlayer: { id: "", number: 1 },
    players: [],
  };

  games.set(gameId, game);
  res.header("Access-Control-Allow-Origin", "*");
  res.json({
    gameId,
  });
});

app.get("/state", (_, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Content-Type", "application/json");

  const state: { [key: string]: GameState } = {};
  for (const [key, value] of games) {
    state[key] = value;
  }
  res.json(state);
});

const server = app.listen(5000, () => {
  console.log("Server running");
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  socket.on("joinGame", (gameId, callback) => {
    console.log(socket.id + " connecting to " + gameId);
    const game = cloneDeep(games.get(gameId));

    if (game && game.players.length < 2) {
      console.log(socket.id + " joined " + gameId);
      socket.join(gameId);

      game.players.push({
        id: socket.id,
        number: game.players.length > 0 ? 2 : 1,
      });
      game.activePlayer = game.players[0];

      games.set(gameId, game);
      callback({ status: "OK", gameState: games.get(gameId) });

      if (game.players.length === 2) {
        console.log("Game " + gameId + " is now ready!");
        io.to(gameId).emit("gameReady", true);
      }
    } else {
      callback({ status: "KO" });
    }
  });

  socket.on("disconnecting", () => {
    console.log(socket.id + " is disconnecting from " + [...socket.rooms][1]);
    const gameId = [...socket.rooms][1];
    const game = cloneDeep(games.get(gameId));

    if (game) {
      game.players = game.players.filter(({ id }) => id !== socket.id);
      console.log("The remaining players are " + game.players);

      if (game.players.length === 0) {
        const result = games.delete(gameId);
        if (result) console.log("Deleting game n° " + gameId);

        return;
      }

      games.set(gameId, game);
      io.to(gameId).emit("gameReady", false);
    }
  });
});
