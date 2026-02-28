import { NextRequest, NextResponse } from 'next/server';

import StageModel from '@/app/_model/stage.model';
import { StatusCode } from '@/app/_utils/types';
import databaseConnect from '@/app/api/database';

export async function GET(
  req: NextRequest,
  { params }: { params: { stageId: string } }
) {
  try {
    await databaseConnect();
    const stageId = params.stageId;
    const stage = await StageModel.findById(stageId).select([
      'question',
      '_id',
      'stageId',
      'image',
      'hint',
    ]);
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
    return NextResponse.json({
      stage,
    });
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
