import { NextRequest, NextResponse } from "next/server";
import databaseConnect from "@/app/api/database";
import StageModel from "@/app/_model/stage.model";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await databaseConnect();
        const stage = await StageModel.findById(params.id);
        if (!stage) {
            return NextResponse.json({ success: false, message: 'Stage not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: stage });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        await databaseConnect();

        const updatedStage = await StageModel.findByIdAndUpdate(
            params.id,
            {
                question: body.question,
                answer: body.answer,
                points: body.points,
                hint: body.hint,
                image: body.image,
                stageId: body.stageId,
            },
            { new: true, runValidators: true }
        );

        if (!updatedStage) {
            return NextResponse.json({ success: false, message: 'Stage not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedStage });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await databaseConnect();
        const deletedStage = await StageModel.findByIdAndDelete(params.id);

        if (!deletedStage) {
            return NextResponse.json({ success: false, message: 'Stage not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: deletedStage });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
