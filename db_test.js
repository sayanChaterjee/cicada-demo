import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    const db = mongoose.connection.db;
    
    console.log("Connected to MongoDB.");
    
    const games = await db.collection("games").find().toArray();
    console.log("Games:", JSON.stringify(games, null, 2));
    
    const teams = await db.collection("teams").find().toArray();
    console.log("Teams:", JSON.stringify(teams, null, 2));

    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
