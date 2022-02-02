// const express = require('express');
// const fetch = require('node-fetch');
// const redis = require('redis');

import express from "express";
import * as fetch from "node-fetch";
import redis from "redis";
import { setConfigDAL, getConfigDAL } from "./dal.js";



const PORT = process.env.PORT || 5000;
// const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient({
    url: "redis://:p301824da061453386cd783a736ed5284d7a5d793523606dfafbd7b57c54bdcd9@ec2-50-19-244-202.compute-1.amazonaws.com:17849"
});
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

async function setConfig(req, res, next) {
    const { config_id, config_body } = req.body;

    try {
        let wrapper = await setConfigDAL(client, config_id, config_body);
        console.log(wrapper);
        res.status(200);
        res.send("OK");
    } catch(err) {
        console.log(err);
        throw err;
    }
}

async function getConfig(req, res, next) {
    const { config_id } = req.body;

    try {
        let reply = await getConfigDAL(client, config_id);
        console.log(reply);
        res.status(200);
        res.send(reply);
    } catch(err) {
        console.log(err);
        throw err;
    }
}

app.post('/config/setConfig', setConfig);
app.get('/config/getConfig', getConfig);

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
