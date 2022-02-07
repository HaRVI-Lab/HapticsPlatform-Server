import { setSchemaDAL, getSchemaDAL, delSchemaDAL, existSchemaDAL } from "../dal/schemaDAL.js";
import { schemaTree } from "../model/schema-tree.js";
import { sendResponse } from "../util/response.js";

export async function setSchema(req, res, client) {
    const { schema_id, schema_body } = req.body;
    try {
        let reply = await existSchemaDAL(client, schema_id);
        if(reply) {
            sendResponse(res, 200, "Schema already set.");
            return;
        }

        const tree = new schemaTree({
            "schema_id": schema_id,
            "schema_body": schema_body,
        });

        if(tree.isEmpty()) {
            sendResponse(res, 200, "Invalid schema format.");
            return;
        }
        
        let success = await setSchemaDAL(client, schema_id, JSON.stringify(tree));
        if(success) {
            sendResponse(res, 200, "Schema successfully set.");
        } else {
            sendResponse(res, 500, "Internal server error.");
        }
    } catch(err) {
        console.log(err);
    }
}

export async function updateSchema(req, res, client) {
    const { schema_id, schema_body } = req.body;
    try {
        let reply = await existSchemaDAL(client, schema_id);
        if(!reply) {
            sendResponse(res, 200, "Schema with that id does not exist.");
            return;
        }
        
        const tree = new schemaTree({
            "schema_id": schema_id,
            "schema_body": schema_body,
        });

        if(tree.isEmpty()) {
            sendResponse(res, 200, "Invalid schema format.");
            return;
        }

        let success = await setSchemaDAL(client, schema_id, JSON.stringify(tree));
        if(success) {
            sendResponse(res, 200, "Schema successfully updated.");
        } else {
            sendResponse(res, 500, "Internal server error.");
        }
    } catch(err) {
        console.log(err);
    }
}

export async function getSchema(req, res, client, logs) {
    const { schema_id } = req.body;
    let msg = JSON.stringify({});
    try {
        let { success, reply } = await getSchemaDAL(client, schema_id);
        if(success) {
            msg = reply;
        }
        logs.push(msg);
        sendResponse(res, 200, JSON.parse(msg));
    } catch(err) {
        console.log(err);
    }
}

export async function delSchema(req, res, client) {
    const { schema_id } = req.body;
    try{
        let success = await delSchemaDAL(client, schema_id);
        if(success) { 
            sendResponse(res, 200, "Schema successfully deleted.");
        } else {
            sendResponse(res, 200, "Unable to delete - schema with that id does not exist.");
        }
    } catch(err) {
        console.log(err);
    }
}