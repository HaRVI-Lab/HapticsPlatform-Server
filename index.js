import express from "express";
import redis from "redis";
import { setConfig, getConfig, delConfig, updateConfig } from "./requests/configRequests.js";
import { setSchema, getSchema, delSchema, updateSchema } from "./requests/schemaRequests.js";
import { setSurvey, getSurvey } from "./requests/surveyRequests.js";


const PORT = process.env.PORT || 5000;

let config = {};
if(process.env.NODE_ENV != "development") {
    config["url"] = "redis://:p301824da061453386cd783a736ed5284d7a5d793523606dfafbd7b57c54bdcd9@ec2-52-5-119-72.compute-1.amazonaws.com:30970";
} else {
    console.log("Dev mode running...");
}

const client = redis.createClient(config);
client.connect();
client.on("connect", () => {
    console.log("Connected to Redis...");
});

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

app.post('/config/getConfig', getConfigHandle);

app.post('/config/setConfig', setConfigHandle);
app.post('/config/delConfig', delConfigHandle);
app.post('/config/updateConfig', updateConfigHandle);

app.post('/schema/getSchema', getSchemaHandle);

app.post('/schema/setSchema', setSchemaHandle);
app.post('/schema/delSchema', delSchemaHandle);
app.post('/schema/updateSchema', updateSchemaHandle);

app.post('/survey/getSurvey', getSurveyHandle);

app.post('/survey/setSurvey', setSurveyHandle);

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});



async function setConfigHandle(req, res, next) {
    setConfig(req, res, client, []);
}

async function getConfigHandle(req, res, next) {
    getConfig(req, res, client, []);
}

async function delConfigHandle(req, res, next) {
    delConfig(req, res, client);
}

async function updateConfigHandle(req, res, next) {
    updateConfig(req, res, client);
}

async function setSchemaHandle(req, res, next) {
    setSchema(req, res, client);
}

async function getSchemaHandle(req, res, next) {
    getSchema(req, res, client, []);
}

async function delSchemaHandle(req, res, next) {
    delSchema(req, res, client);
}

async function updateSchemaHandle(req, res, next) {
    updateSchema(req, res, client);
}

async function setSurveyHandle(req, res, next) {
    setSurvey(req, res, client);
}

async function getSurveyHandle(req, res, next) {
    getSurvey(req, res, client, []);
}

