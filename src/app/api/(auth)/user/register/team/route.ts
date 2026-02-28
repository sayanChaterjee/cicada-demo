import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";

import TeamModel from "@/app/_model/team.model";
import { StatusCode } from "@/app/_utils/types";
import { CreateTeamSchema } from "@/app/_validation_schema/api/user/userValidation";
import databaseConnect from "@/app/api/database";

function generateUniqueString() {
  const generatedUUID = v4();
  const shortString = generatedUUID.substring(0, 6);
  return shortString;
}

export async function POST(req: NextRequest) {
  try {
    await databaseConnect();
    const body = await req.json();
    const { success } = CreateTeamSchema.safeParse(body);
    if (!success) {
      return NextResponse.json(
        {
          message: "invalid data",
        },
        {
          status: StatusCode.BAD_REQUEST,
          statusText: "invalid data",
        },
      );
    }

    // finding whether this team name already exists
    const teamExists = await TeamModel.findOne({ teamName: body.teamName });
    if (teamExists) {
      return NextResponse.json(
        {
          message: "team name already exists",
          teamId: -1,
        },
        {
          status: StatusCode.BAD_REQUEST,
          statusText: "team name already exists",
        },
      );
    }

    const generatedTeamId = generateUniqueString();
    const team = new TeamModel({
      teamName: body.teamName,
      teamId: generatedTeamId,
      members: body.members,
      totalTokens: 10,
    });
    await team.save();

    return NextResponse.json(
      {
        message: "team registered successfully",
        teamId: generatedTeamId,
      },
      {
        status: StatusCode.CREATED,
        statusText: "registered",
      },
    );
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
