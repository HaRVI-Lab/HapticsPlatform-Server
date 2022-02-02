import redis from "redis";

export async function setConfigDAL(client, config_id, data) {
    try{
        let dataStr = JSON.stringify(data);
        let wrapper = await client.set(config_id, dataStr);
        console.log(wrapper);
    } catch(err) {
        // console.log(err);
        throw err;
    }
}

export async function getConfigDAL(client, config_id) {
    try {
        let reply = await client.get(config_id);
        console.log(reply);
        return reply;
    } catch(err) {
        // console.log(err);
        throw err;
    }
}

