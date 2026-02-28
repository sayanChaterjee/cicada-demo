import { NextRequest, NextResponse } from "next/server";

import GameModel from "@/app/_model/game.model";
import StageModel from "@/app/_model/stage.model";
import TeamModel from "@/app/_model/team.model";
import { StatusCode } from "@/app/_utils/types";
import databaseConnect from "@/app/api/database";

export async function GET(
  req: NextRequest,
  { params }: { params: { stageId: string } },
) {
  try {
    await databaseConnect();
    const stageId = params.stageId;
    const stage = await StageModel.findById(stageId).select([
      "question",
      "_id",
      "stageId",
      "image",
      "hint",
    ]);
    if (!stage) {
      return NextResponse.json(
        {
          message: "stage not found",
        },
        {
          status: StatusCode.NOT_FOUND,
          statusText: "not found",
        },
      );
    }

    const payload = req.headers.get("Set-user");
    let team = null;
    if (payload) {
      const parsedPayload = JSON.parse(payload);
      const teamId = parsedPayload.payload.teamId;
      team = await TeamModel.findOne({ teamId });
    }

    let prevStageId = null;
    let nextStageId = null;

    if (team) {
      const gameDetails = await GameModel.findOne({ stages: stage._id });
      if (gameDetails) {
        const currentStageIndex = gameDetails.stages.findIndex((_stage: any) =>
          _stage.equals(stage._id),
        );

        if (currentStageIndex > 0) {
          prevStageId = gameDetails.stages[currentStageIndex - 1];
        }

        if (currentStageIndex < gameDetails.stages.length - 1) {
          nextStageId = gameDetails.stages[currentStageIndex + 1];
        }
      }
    }

    return NextResponse.json({
      stage,
      prevStageId,
      nextStageId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "An error occurred while processing your request.",
        description: JSON.stringify(error),
      },
      {
        status: StatusCode.INTERNAL_SERVER_ERROR,
        statusText: "server error",
      },
    );
  }
}
