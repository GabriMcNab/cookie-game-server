import { Coordinates, Player } from "@/types";

export type Border = "north" | "east" | "south" | "west";

export type GameBox = {
  position: Coordinates;
  selectedBorders: Array<Border>;
  externalBorders: Array<Border>;
  completedBy?: Player["number"];
};
