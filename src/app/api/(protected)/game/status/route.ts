import { NextRequest, NextResponse } from "next/server";

import GameModel from "@/app/_model/game.model";
import { GameStatus, StatusCode } from "@/app/_utils/types";
import TeamModel from "../../../../_model/team.model";
import databaseConnect from "@/app/api/database";

export async function GET(req: NextRequest) {
  try {
    await databaseConnect();

    const payload = req.headers.get("Set-user");
    if (!payload) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: StatusCode.UNAUTHORIZED,
          statusText: "unauthorized",
        }
      );
    }
    const parsedPayload = JSON.parse(payload);
    const teamId = parsedPayload.payload.teamId;
    const team = await TeamModel.findOne({ teamId });

    if (!team) {
      return NextResponse.json(
        {
          message: "no team found",
          GameStatus: GameStatus.ENDED,
        },
        {
          status: StatusCode.UNAUTHORIZED,
          statusText: "unauthorized",
        }
      );
    }

    if (team.totalTokens <= 0) {
      return NextResponse.json(
        {
          message: "game ended",
          gameStatus: GameStatus.ENDED,
        },
        {
          status: StatusCode.BAD_REQUEST,
          statusText: "bad request",
        }
      );
    }

    let activeGames = await GameModel.find({
      gameStartTime: { $lte: new Date() },
      gameEndTime: { $gte: new Date() }
    }).sort({ gameStartTime: -1 });

    if (activeGames.length === 0) {
      activeGames = await GameModel.find().sort({ gameStartTime: -1 }).limit(1);
    }

    let game = null;
    let nextStage = null;
    let finishedCurrentGame = false;

    for (const g of activeGames) {
      if (!g.stages || g.stages.length === 0) continue;

      let maxCompletedIndex = -1;
      for (let i = 0; i < g.stages.length; i++) {
        const stageIdStr = g.stages[i].toString();
        const isCompleted = team.stages.some((s: any) => s.stageId.toString() === stageIdStr);
        if (isCompleted) {
          maxCompletedIndex = i;
        }
      }

      if (maxCompletedIndex < g.stages.length - 1) {
        // Found an active game that the user hasn't finished yet
        game = g;
        nextStage = g.stages[maxCompletedIndex + 1];
        finishedCurrentGame = false;
        break;
      } else {
        // The user finished this game, remember it in case we don't find any unfinished games
        game = g;
        finishedCurrentGame = true;
      }
    }

    if (!game) {
      return NextResponse.json(
        {
          message: "game not found",
        },
        {
          status: StatusCode.NOT_FOUND,
          statusText: "not found",
        }
      );
    }

    if (finishedCurrentGame) {
      return NextResponse.json(
        {
          message: "game ended",
          gameStatus: GameStatus.ENDED,
        },
        {
          status: StatusCode.BAD_REQUEST,
          statusText: "bad request",
        }
      );
    }

    if (game.gameStartTime > new Date()) {
      return NextResponse.json(
        {
          message: "game not started yet",
          gameStatus: GameStatus.NOT_STARTED,
        },
        {
          status: StatusCode.BAD_REQUEST,
          statusText: "bad request",
        }
      );
    } else if (game.gameEndTime < new Date()) {
      return NextResponse.json(
        {
          message: "game ended",
          gameStatus: GameStatus.ENDED,
        },
        {
          status: StatusCode.BAD_REQUEST,
          statusText: "bad request",
        }
      );
    } else {
      return NextResponse.json({
        message: "Game Started",
        gameStatus: GameStatus.STARTED,
        stage: nextStage,
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "An error occurred while processing your request.",
        description: JSON.stringify(error),
      },
      {
        status: StatusCode.INTERNAL_SERVER_ERROR,
        statusText: "server error",
      }
    );
  }
}
