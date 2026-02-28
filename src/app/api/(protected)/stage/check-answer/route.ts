import { NextRequest, NextResponse } from 'next/server';

import StageModel from '@/app/_model/stage.model';
import TeamModel from '@/app/_model/team.model';
import { StatusCode } from '@/app/_utils/types';
import { CheckAnswerSchema } from '@/app/_validation_schema/api/stage/stageValidation';
import databaseConnect from '@/app/api/database';
import GameModel from '../../../../_model/game.model';

export async function POST(req: NextRequest) {
  try {
    await databaseConnect();
    const body = await req.json();
    const { success } = CheckAnswerSchema.safeParse(body);
    if (!success) {
      return NextResponse.json(
        {
          message: 'Invalid input',
          description: 'Invalid input',
        },
        {
          status: StatusCode.BAD_REQUEST,
          statusText: 'bad request',
        }
      );
    }
    const stage = await StageModel.findById(body.id);
    if (!stage) {
      return NextResponse.json(
        {
          message: 'stage not found',
        },
        {
          status: StatusCode.NOT_FOUND,
          statusText: 'not found',
        }
      );
    }

    const payload = req.headers.get('Set-user');
    if (!payload) {
      return NextResponse.json(
        {
          message: 'Unauthorized',
        },
        {
          status: StatusCode.UNAUTHORIZED,
          statusText: 'unauthorized',
        }
      );
    }
    const parsedPayload = JSON.parse(payload);
    const teamId = parsedPayload.payload.teamId;
    const team = await TeamModel.findOne({ teamId });
    if (!team) {
      return NextResponse.json(
        {
          message: 'Team not found',
        },
        {
          status: StatusCode.NOT_FOUND,
          statusText: 'not found',
        }
      );
    }

    /**
    checking if the answer is correct
    */
    const providedAnswer =
      typeof body.answer === 'string' ? body.answer.toLowerCase() : body.answer;
    const correctAnswer =
      typeof stage.answer === 'string'
        ? stage.answer.toLowerCase()
        : stage.answer;

    if (providedAnswer !== correctAnswer) {
      if (team.totalTokens <= 0) {
        return NextResponse.json(
          {
            message: 'Incorrect answer',
            description: 'No tokens left',
            totalTokens: team.totalTokens,
            success: false,
            game: false,
          },
          {
            status: StatusCode.BAD_REQUEST,
            statusText: 'bad request',
          }
        );
      }

      team.totalTokens = team.totalTokens - 1;
      await team.save();

      return NextResponse.json(
        {
          message: 'Incorrect answer',
          totalTokens: team.totalTokens,
          success: false,
          game: true,
        },
        {
          status: StatusCode.BAD_REQUEST,
          statusText: 'bad request',
        }
      );
    }

    // if not wrong answer

    // it will prevent the player from submitting the same stage again to score points
    const attemptedStages =
      team.stages.filter((_stage) => `${_stage.stageId}` === `${stage._id}`) ??
      [];

    if (attemptedStages.length === 0) {
      team.totalPointScored = team.totalPointScored + stage.points;
      team.noOfStagesAttempted = team.noOfStagesAttempted + 1;
      team.stages.push({
        timeStamp: new Date(),
        stageId: stage._id,
      });
      team.lastCompletedStage = stage._id;

      await team.save();
    }

    const gameDetails = await GameModel.findOne({ stages: stage._id });
    // this should never happen
    if (!gameDetails) {
      return NextResponse.json(
        {
          message: 'No game found',
          description: 'No game found',
          totalTokens: team.totalTokens,
          success: true,
          nextStageId: -1,
          nextStage: null,
          game: false,
        },
        {
          status: StatusCode.OK,
          statusText: 'ok',
        }
      );
    }

    const currentStageIndex = gameDetails.stages.findIndex(_stage => _stage.equals(stage._id))

    const hasNextStage = currentStageIndex < gameDetails.stages.length - 1;


    if (!hasNextStage) {
      return NextResponse.json(
        {
          message: 'Correct answer',
          description: 'Points added to your team',
          totalTokens: team.totalTokens,
          success: true,
          nextStageId: -1,
          nextStage: null,
          game: false,
        },
        {
          status: StatusCode.OK,
          statusText: 'ok',
        }
      );
    }

    return NextResponse.json(
      {
        message: 'Correct answer',
        description: 'Points added to your team',
        totalTokens: team.totalTokens,
        success: true,
        nextStageId: gameDetails.stages[currentStageIndex + 1],
        nextStage: gameDetails.stages[currentStageIndex + 1],
        game: true,
      },
      {
        status: StatusCode.OK,
        statusText: 'ok',
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'An error occurred while processing your request.',
        description: JSON.stringify(error),
      },
      {
        status: StatusCode.INTERNAL_SERVER_ERROR,
        statusText: 'server error',
      }
    );
  }
}
