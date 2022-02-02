import { setConfigDAL, getConfigDAL } from "./dal.js";

export async function setConfig(req, res, client) {
    const { config_id, config_body } = req.body;
    try {
        let success = await setConfigDAL(client, config_id, config_body);
        if(!success) {
            console.log("setConfig error: setConfigDal failed.");
        }
        res.status(200);
        res.send("OK");
    } catch(err) {
        console.log(err);
    }
}

export async function getConfig(req, res, client) {
    const { config_id } = req.body;
    try {
        let { success, reply } = await getConfigDAL(client, config_id);
        if(!success) {
            console.log("getConfig error: getConfigDal failed.");
        }
        res.status(200);
        res.send(reply);
    } catch(err) {
        console.log(err);
    }
}