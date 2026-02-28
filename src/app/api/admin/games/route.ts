import { NextRequest, NextResponse } from "next/server";
import databaseConnect from "@/app/api/database";
import GameModel from "@/app/_model/game.model";

export async function GET() {
    try {
        await databaseConnect();
        const games = await GameModel.find().populate("stages").sort({ gameStartTime: -1 });
        return NextResponse.json({ success: true, data: games });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        await databaseConnect();

        const newGame = await GameModel.create({
            totalPoints: body.totalPoints,
            gameStartTime: body.gameStartTime,
            gameEndTime: body.gameEndTime,
            stages: body.stages || [],
        });

        return NextResponse.json({ success: true, data: newGame }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
