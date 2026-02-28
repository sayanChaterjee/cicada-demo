import { NextResponse } from "next/server";

import TeamModel from "@/app/_model/team.model";
import { StatusCode } from "@/app/_utils/types";

import databaseConnect from "../database";

export const dynamic = "force-dynamic";

interface IStage {
  stageId: string;
  timeStamp: Date;
  _id: string;
}
interface TeamInterface {
  _id: string;
  teamName: string;
  totalPointScored: number;
  noOfStagesAttempted: number;
  stages: IStage[];
}
export async function GET() {
  try {
    await databaseConnect();
    const stages = [5, 4, 3, 2, 1];
    const sortedTeams = await TeamModel.find()
      .sort({ totalPointScored: -1 })
      .select([
        "totalPointScored",
        "teamName",
        "members.name",
        "noOfStagesAttempted",
        "stages",
      ]);
    let filteredGroup: any[] = [];
    stages.map((st) => {
      const a = sortedTeams.filter((t) => t.noOfStagesAttempted === st);
      if (a.length !== 0) filteredGroup.push(a);
    });
    const reducedGroup: any[] = [];

    filteredGroup.map((g) => {
      const currSorted = g.sort((a: any, b: any) => {
        const aLastStage = a.stages.slice(-1)[0];
        const bLastStage = b.stages.slice(-1)[0];
        return bLastStage.timeStamp - aLastStage.timeStamp;
      });
      reducedGroup.push(currSorted);
    });
    const flatTeams = reducedGroup.flat();
    const selectedTeams = flatTeams.map((t) => {
      return {
        _id: t._id,
        teamName: t.teamName,
        members: t.members,
        totalPointScored: t.totalPointScored,
        noOfStagesAttempted: t.noOfStagesAttempted,
      };
    });
    return NextResponse.json(
      {
        teams: selectedTeams,
      },
      {
        status: StatusCode.OK,
        statusText: "OK",
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
