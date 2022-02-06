import { objectType, undefType } from "../constant/types.js";
import { getSchemaDAL } from "../dal/schemaDAL.js";

export async function checkSchema(client, schemaID, configData) {
    let { success, reply } = await getSchemaDAL(client, schemaID);
    if(!success) {
        return false;
    }
    return validateConfig(JSON.parse(JSON.parse(reply)), configData);
}

export function validateConfig(schemaTree, configData) {
    return validateHelper(schemaTree.root, configData);
}

function validateHelper(schemaNode, configNode) {
    const schemaData = schemaNode.data;
    const schemaType = schemaData.type;

    if(!schemaNode.ignore) {
        if(schemaData.is_array) {
            if(!Array.isArray(configNode)) {
                return false;
            }

            for(const val of configNode) {
                if(typeof val !== schemaType) {
                    return false;
                }
            }

            return true;
        } 
        
        if(Array.isArray(configNode)) {
            return false;
        }

        if(typeof configNode !== schemaType) {
            return false;
        }
    }

    let res = true;
    if(typeof configNode === objectType) {
        
        for(const child of schemaData.children) {

            const childSchema = child.data;
            const childConfig = configNode[childSchema.name];

            if(!childSchema.optional && typeof childConfig === undefType) {
                return false;
            }

            if(typeof childConfig !== undefType) {
                res = res && validateHelper(child, childConfig);
            }
        }
    }

    return res;
}