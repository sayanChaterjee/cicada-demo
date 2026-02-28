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

    let game;
    let nextStage = null;
    let finishedCurrentGame = false;

    if (team.lastCompletedStage) {
      // Find the game this team was playing
      game = await GameModel.findOne({ stages: team.lastCompletedStage });
      if (game) {
        const currentStageIndex = game.stages.findIndex((_stage: any) => _stage.equals(team.lastCompletedStage));
        if (currentStageIndex > -1 && currentStageIndex < game.stages.length - 1) {
          nextStage = game.stages[currentStageIndex + 1];
        } else if (currentStageIndex === game.stages.length - 1) {
          finishedCurrentGame = true;
        }
      }
    }

    // If no game found from progression or team hasn't played, find an active or the latest one
    if (!game) {
      // Look for a currently running game
      game = await GameModel.findOne({
        gameStartTime: { $lte: new Date() },
        gameEndTime: { $gte: new Date() }
      }).sort({ gameStartTime: -1 });

      if (!game) {
        // Fallback to the latest game created
        game = await GameModel.findOne().sort({ gameStartTime: -1 });
      }

      if (game && game.stages && game.stages.length > 0) {
        // No last completed stage in this game, start at the beginning
        nextStage = game.stages[0];
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
