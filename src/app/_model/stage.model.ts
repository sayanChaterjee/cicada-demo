import mongoose, { model, Model, Schema } from 'mongoose';

interface IStage {
  question: string;
  answer: string | number;
  points: number;
  hint: string;
  stageId: number;
  image: string[];
}
const stageSchema = new Schema<IStage>(
  {
    question: {
      type: String,
      default: "",
    },
    answer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    hint: {
      type: String,
    },
    image: {
      type: [String],
      default: [],
    },
    stageId: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const StageModel: Model<IStage> =
  mongoose.models.Stage ?? model<IStage>('Stage', stageSchema);
export default StageModel;
