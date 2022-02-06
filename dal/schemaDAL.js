export async function setSchemaDAL(client, schema_id, data) {
    try {
        let reply = await client.set(schema_id, JSON.stringify(data));
        return reply === "OK" ? true : false;
    } catch(err) {
        throw err;
    }
}

export async function getSchemaDAL(client, schema_id) {
    try {
        let reply = await client.get(schema_id);
        let success = reply !== null ? true : false;
        return { success, reply };
    } catch(err) {
        throw err;
    }
}

export async function delSchemaDAL(client, schema_id) {
    try {
        let reply = await client.del(schema_id);
        return reply === 1 ? true : false;;
    } catch(err) {
        throw err;
    }
}

export async function existSchemaDAL(client, schema_id) {
    try {
        let reply = await client.exists(schema_id);
        return reply === 1 ? true : false;
    } catch(err) {
        throw err;
    }
}
