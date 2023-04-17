import express from "express";
import * as https from "https";
import * as mongoose from "mongoose";
import todoRoutes from "./modules/todo/routes/todo.routes";
import userRoutes from "./modules/user/routes/user.routes";
import {MONGO_URI} from "./config/config";
const fs = require('fs');

const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
};

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/todo', todoRoutes);
app.use('/user', userRoutes);

const start = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGO_URI, { dbName: 'todo' });
        mongoose.set('debug', true);

        https.createServer(options, app).listen(3080, () => {
            console.log("Server started on port 3080");
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

void start();