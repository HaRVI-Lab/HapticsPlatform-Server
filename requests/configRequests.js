import { setConfigDAL, getConfigDAL, delConfigDAL, existConfigDAL } from "../dal/configDAL.js";
import { checkSchema } from "../parse/parse-schema.js";
import { stringType, booleanType, objectType } from "../constant/types.js";
import { sendResponse } from "../util/response.js";

export async function setConfig(req, res, client, logs) {
    const { config_body, require_schema, schema_id } = req.body;
    // if(typeof config_id !== stringType) {
    //     sendResponse(res, 200, "Config ID must be string.");
    //     return;
    // }
    const upper = 100000;
    let config_id = "";
    while(true) {
        let id_num = Math.floor(Math.random() * upper);
        config_id = id_num + "";
        let reply = await existConfigDAL(client, config_id);
        if(!reply) {
            break;
        }   
    }

    logs.push(config_id);

    if(typeof config_body !== objectType) {
        sendResponse(res, 200, "Config body not a valid JSON.");
        return;
    }

    try {
        // let reply = await existConfigDAL(client, config_id);
        // if(reply) {
        //     sendResponse(res, 200, "Configuration already set.");
        //     return;
        // }

        if(typeof require_schema === booleanType && require_schema)  {
            if(typeof schema_id !== stringType) {
                sendResponse(res, 200, "Schema ID must be string.");
                return;
            }

            const reply = await checkSchema(client, schema_id, config_body);
            if(!reply) {
                sendResponse(res, 200, "Configuration not obeying schema.");
                return;
            }
        }
        
        let success = await setConfigDAL(client, config_id, config_body);
        if(success) {
            sendResponse(res, 200, config_id);
        } else {
            sendResponse(res, 500, "Internal server error.");
        }
    } catch(err) {
        console.log(err);
    }
}

export async function updateConfig(req, res, client) {
    const { config_id, config_body, require_schema, schema_id } = req.body;
    if(typeof config_id !== stringType) {
        sendResponse(res, 200, "Config ID must be string.");
        return;
    }
    if(typeof config_body !== objectType) {
        sendResponse(res, 200, "Config body not a valid JSON.");
        return;
    }

    try {
        let reply = await existConfigDAL(client, config_id);
        if(!reply) {
            sendResponse(res, 200, "Configuration with that id does not exist.");
            return;
        }

        if(typeof require_schema === booleanType && require_schema)  {
            if(typeof schema_id !== stringType) {
                sendResponse(res, 200, "Schema ID must be string.");
                return;
            }

            const reply = await checkSchema(client, schema_id, config_body);
            if(!reply) {
                sendResponse(res, 200, "Configuration not obeying schema.");
                return;
            }
        }
        
        let success = await setConfigDAL(client, config_id, config_body);
        if(success) {
            sendResponse(res, 200, "Configuration successfully updated.");
        } else {
            sendResponse(res, 500, "Internal server error.");
        }
    } catch(err) {
        console.log(err);
    }
}

export async function getConfig(req, res, client, logs) {
    const { config_id } = req.body;
    if(typeof config_id !== stringType) {
        sendResponse(res, 200, "Config ID must be string.");
        return;
    }
    let msg = JSON.stringify({});
    try {
        let { success, reply } = await getConfigDAL(client, config_id);
        if(success) {
            msg = reply;
        }
        logs.push(msg);
        sendResponse(res, 200, msg);
    } catch(err) {
        console.log(err);
    }
}

export async function delConfig(req, res, client) {
    const { config_id } = req.body;
    if(typeof config_id !== stringType) {
        sendResponse(res, 200, "Config ID must be string.");
        return;
    }
    try{
        let success = await delConfigDAL(client, config_id);
        if(success) { 
            sendResponse(res, 200, "Configuration successfully deleted.");
        } else {
            sendResponse(res, 200, "Unable to delete - configuration with that id does not exist.");
        }
    } catch(err) {
        console.log(err);
    }
}