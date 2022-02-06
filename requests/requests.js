import { setConfigDAL, getConfigDAL, delConfigDAL, existConfigDAL } from "../dal/configDAL.js";

export async function setConfig(req, res, client) {
    const { config_id, config_body } = req.body;
    try {
        let status = 200;
        let msg = "";
        
        let reply = await existConfigDAL(client, config_id);
        if(reply) {
            msg = "Configuration already set."
            res.status(status);
            res.send(msg);
            return;
        }
        
        let success = await setConfigDAL(client, config_id, config_body);
        if(success) {
            msg = "Configuration successfully set.";
        } else {
            console.log("setConfig error: setConfigDal failed.");
        }
        res.status(status);
        res.send(msg);
    } catch(err) {
        console.log(err);
    }
}

export async function updateConfig(req, res, client) {
    const { config_id, config_body } = req.body;
    try {
        let status = 200;
        let msg = "";
        
        let reply = await existConfigDAL(client, config_id);
        if(!reply) {
            msg = "Configuration with that id does not exist."
            res.status(status);
            res.send(msg);
            return;
        }
        
        let success = await setConfigDAL(client, config_id, config_body);
        if(success) {
            msg = "Configuration successfully updated.";
        } else {
            console.log("setConfig error: updateConfigDal failed.");
        }
        res.status(status);
        res.send(msg);
    } catch(err) {
        console.log(err);
    }
}

export async function getConfig(req, res, client, logs) {
    const { config_id } = req.body;
    try {
        let status = 200;
        let msg = JSON.stringify({});
        let { success, reply } = await getConfigDAL(client, config_id);
        if(success) {
            msg = reply;
        }
        logs.push(msg);
        res.status(status);
        res.send(msg);
    } catch(err) {
        console.log(err);
    }
}

export async function delConfig(req, res, client) {
    const { config_id } = req.body;
    try{
        let status = 200;
        let msg = "";
        let success = await delConfigDAL(client, config_id);
        if(success) { 
            msg = "Configuration successfully deleted.";
        } else {
            msg = "Unable to delete - configuration with that id does not exist.";
        }
        res.status(status);
        res.send(msg);
    } catch(err) {
        console.log(err);
    }
}