import { NextRequest, NextResponse } from "next/server";
import databaseConnect from "@/app/api/database";
import GameModel from "@/app/_model/game.model";
import "@/app/_model/stage.model";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await databaseConnect();
        const game = await GameModel.findById(params.id).populate("stages");
        if (!game) {
            return NextResponse.json({ success: false, message: 'Game not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: game });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        await databaseConnect();

        const updatedGame = await GameModel.findByIdAndUpdate(
            params.id,
            {
                totalPoints: body.totalPoints,
                gameStartTime: body.gameStartTime,
                gameEndTime: body.gameEndTime,
                stages: body.stages || [],
            },
            { new: true, runValidators: true }
        );

        if (!updatedGame) {
            return NextResponse.json({ success: false, message: 'Game not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedGame });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await databaseConnect();
        const deletedGame = await GameModel.findByIdAndDelete(params.id);

        if (!deletedGame) {
            return NextResponse.json({ success: false, message: 'Game not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: deletedGame });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
