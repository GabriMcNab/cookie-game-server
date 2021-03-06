import express from "express";
import { nanoid } from "nanoid";
import cloneDeep from "lodash.clonedeep";
import { Server } from "socket.io";
import {
  generateGameBoard,
  getAdjacentGameBoxPosition,
} from "@/services/gameBoard";
import { updateGameBox, getOppositeBorder } from "@/services/gameBox";
import { createNewPlayer, getPlayerScore } from "@/services/player";
import { Border, Coordinates, GameState } from "@/types";

const games = new Map<string, GameState>();

const app = express();

app.post("/games/new", (_, res) => {
  const gameId = nanoid(6);
  const board = generateGameBoard(4);
  const game: GameState = {
    board,
    players: [],
    gameReady: false,
    gameOver: false,
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

    if (game && !game.gameOver && game.players.length < 2) {
      console.log(socket.id + " joined " + gameId);
      socket.join(gameId);

      game.players.push(createNewPlayer(socket.id, game.players));
      game.activePlayer = game.activePlayer ?? game.players[0].number;

      if (game.players.length === 2) {
        console.log("Game " + gameId + " is now ready!");
        game.gameReady = true;
      }

      games.set(gameId, game);
      callback({ status: "OK" });
      io.to(gameId).emit("playerJoined", games.get(gameId));
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
        if (result) console.log("Deleting game n?? " + gameId);

        return;
      }

      game.gameReady = false;
      games.set(gameId, game);
      io.to(gameId).emit("gameUpdated", games.get(gameId));
    }
  });

  socket.on(
    "playerMove",
    (playerMove: { border: Border; position: Coordinates }, callback) => {
      const gameId = [...socket.rooms][1];
      const game = cloneDeep(games.get(gameId));
      const playerIndex = game?.players.findIndex((p) => p.id === socket.id);

      if (
        game &&
        playerIndex !== undefined &&
        playerIndex !== -1 &&
        game.players[playerIndex].number === game.activePlayer
      ) {
        const { border, position } = playerMove;
        const targetBox = game.board[position.toString()];
        const updatedBox = updateGameBox(targetBox, border, game.activePlayer);

        const adjBoxPosition = getAdjacentGameBoxPosition(position, border);
        const adjBorder = getOppositeBorder(border);
        const adjBox = game.board[adjBoxPosition.toString()];
        const updatedAdjBox = updateGameBox(
          adjBox,
          adjBorder,
          game.activePlayer
        );

        if (!updatedBox.completedBy && !updatedAdjBox.completedBy) {
          game.activePlayer = game.activePlayer === 1 ? 2 : 1;
        } else {
          game.players[playerIndex].score = getPlayerScore(
            game.activePlayer,
            game.board
          );
        }

        game.board[position.toString()] = updatedBox;
        game.board[adjBoxPosition.toString()] = updatedAdjBox;

        if (Object.values(game.board).every((box) => box.completedBy)) {
          game.gameOver = true;
        }

        games.set(gameId, game);
        callback({ status: "OK" });

        io.to(gameId).emit("gameUpdated", games.get(gameId));
      } else {
        callback({ status: "KO" });
      }
    }
  );
});
