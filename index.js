// const express = require('express');
// const fetch = require('node-fetch');
// const redis = require('redis');

import express, { application } from "express";
import redis from "redis";
import { setConfig, getConfig, delConfig, updateConfig } from "./requests.js";

const PORT = process.env.PORT || 5000;

let config = {};
if(process.env.NODE_ENV != "development") {
    config["url"] = "redis://:p301824da061453386cd783a736ed5284d7a5d793523606dfafbd7b57c54bdcd9@ec2-50-19-244-202.compute-1.amazonaws.com:17849";
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

app.get('/config/getConfig', getHandle);

app.post('/config/setConfig', setHandle);
app.post('/config/delConfig', delHandle);
app.post('/config/updateConfig', updateHandle);

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});



async function setHandle(req, res, next) {
    setConfig(req, res, client);
}

async function getHandle(req, res, next) {
    getConfig(req, res, client);
}

async function delHandle(req, res, next) {
    delConfig(req, res, client);
}

async function updateHandle(req, res, next) {
    updateConfig(req, res, client);
}
