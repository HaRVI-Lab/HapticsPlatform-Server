import { setSchemaDAL, getSchemaDAL, delSchemaDAL, existSchemaDAL } from "../dal/schemaDAL.js";
import { schemaTree } from "../model/schema-tree.js";

export async function setSchema(req, res, client) {
    const { schema_id, schema_body } = req.body;
    try {
        let status = 200;
        let msg = "";

        let reply = await existSchemaDAL(client, schema_id);
        if(reply) {
            msg = "Schema already set."
            res.status(status);
            res.send(msg);
            return;
        }

        const tree = new schemaTree({
            "schema_id": schema_id,
            "schema_body": schema_body,
        });

        if(tree.isEmpty()) {
            msg = "Invalid schema format."
            res.status(status);
            res.send(msg);
            return;
        }
        
        let success = await setSchemaDAL(client, schema_id, JSON.stringify(tree));
        if(success) {
            msg = "Schema successfully set.";
        } else {
            console.log("setSchema error: setSchemaDal failed.");
        }
        res.status(status);
        res.send(msg);
    } catch(err) {
        console.log(err);
    }
}

export async function updateSchema(req, res, client) {
    const { schema_id, schema_body } = req.body;
    try {
        let status = 200;
        let msg = "";
        
        let reply = await existSchemaDAL(client, config_id);
        if(!reply) {
            msg = "Schema with that id does not exist."
            res.status(status);
            res.send(msg);
            return;
        }
        
        const tree = new schemaTree({
            "schema_id": schema_id,
            "schema_body": schema_body,
        });

        if(tree.isEmpty()) {
            msg = "Invalid schema format."
            res.status(status);
            res.send(msg);
            return;
        }

        let success = await setSchemaDAL(client, schema_id, JSON.stringify(tree));
        if(success) {
            msg = "Schema successfully updated.";
        } else {
            console.log("setSchema error: updateSchemaDal failed.");
        }
        res.status(status);
        res.send(msg);
    } catch(err) {
        console.log(err);
    }
}

export async function getSchema(req, res, client, logs) {
    const { schema_id } = req.body;
    try {
        let status = 200;
        let msg = JSON.stringify({});
        let { success, reply } = await getSchemaDAL(client, schema_id);
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

export async function delSchema(req, res, client) {
    const { schema_id } = req.body;
    try{
        let status = 200;
        let msg = "";
        let success = await delSchemaDAL(client, schema_id);
        if(success) { 
            msg = "Schema successfully deleted.";
        } else {
            msg = "Unable to delete - schema with that id does not exist.";
        }
        res.status(status);
        res.send(msg);
    } catch(err) {
        console.log(err);
    }
}