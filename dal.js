export async function setConfigDAL(client, config_id, data) {
    try {
        let reply = await client.set(config_id, JSON.stringify(data));
        return reply === "OK" ? true : false;
    } catch(err) {
        throw err;
    }
}

export async function getConfigDAL(client, config_id) {
    try {
        let reply = await client.get(config_id);
        let success = reply !== null ? true : false;
        return { success, reply };
    } catch(err) {
        throw err;
    }
}

export async function delConfigDAL(client, config_id) {
    try {
        let reply = await client.del(config_id);
        return reply === 1 ? true : false;;
    } catch(err) {
        throw err;
    }
}

export async function existConfigDAL(client, config_id) {
    try {
        let reply = await client.exists(config_id);
        return reply === 1 ? true : false;
    } catch(err) {
        throw err;
    }
}
