import { NextRequest, NextResponse } from "next/server";
import databaseConnect from "@/app/api/database";
import StageModel from "@/app/_model/stage.model";

export async function GET() {
    try {
        await databaseConnect();
        const stages = await StageModel.find().sort({ stageId: 1 });
        return NextResponse.json({ success: true, data: stages });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        await databaseConnect();

        const newStage = await StageModel.create({
            question: body.question,
            answer: body.answer,
            points: body.points,
            hint: body.hint,
            image: body.image,
            stageId: body.stageId,
        });

        return NextResponse.json({ success: true, data: newStage }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
