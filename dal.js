import redis from "redis";

export async function setConfigDAL(client, config_id, data) {
    try{
        let dataStr = JSON.stringify(data);
        let reply = await client.set(config_id, dataStr);
        
        let success = reply === "OK" ? true : false;
        return success;
    } catch(err) {
        throw err;
    }
}

export async function getConfigDAL(client, config_id) {
    try {
        let reply = await client.get(config_id);
        console.log(reply);

        let success = reply.length > 0 ? true : false;
        return { success, reply };
    } catch(err) {
        throw err;
    }
}

