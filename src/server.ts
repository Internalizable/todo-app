import express from "express";
import * as https from "https";
import * as mongoose from "mongoose";
import todoRoutes from "./modules/todo/routes/todo.routes";
const fs = require('fs');

const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
};


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/todo', todoRoutes);

const start = async (): Promise<void> => {
    try {
        await mongoose.connect(`mongodb://dataholic:Ooxg41uVTmoOcs4j@34.165.1.243:27017/?authMechanism=DEFAULT`, { dbName: 'todo' });
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