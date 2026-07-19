import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';

// Make sure both of your route files are imported
import uploadRoute from './routes/upload.js';
import authRoute from './routes/auth.js'; 

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

// This is the corrected section. 
// It tells Express that any URL starting with '/api/upload' should be handled by your uploadRoute file.
// And any URL starting with '/api/auth' should be handled by your authRoute file.
app.use('/api/upload', uploadRoute); 
app.use('/api/auth', authRoute);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
