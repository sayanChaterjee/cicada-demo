import mongoose, { model, Model, Schema, Types } from 'mongoose';

interface IGame {
  totalPoints: number;
  stages: Types.ObjectId[];
  gameStartTime: Date;
  gameEndTime: Date;
}
const gameSchema = new Schema<IGame>(
  {
    totalPoints: {
      type: Number,
      required: true,
    },
    gameStartTime: {
      type: Date,
      required: true,
    },
    gameEndTime: {
      type: Date,
      required: true,
    },
    stages: [
      {
        type: Types.ObjectId,
        ref: 'Stage',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const GameModel: Model<IGame> =
  mongoose.models.Game ?? model<IGame>('Game', gameSchema);
export default GameModel;
