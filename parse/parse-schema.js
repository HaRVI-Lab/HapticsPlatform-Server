import { objectType, undefType } from "../constant/types.js";

export function validateConfig(schemaTree, configData) {
    return validateHelper(schemaTree.root, configData);
}

function validateHelper(schemaNode, configNode) {
    const schemaData = schemaNode.data;
    const schemaType = schemaData.type;

    if(!schemaNode.ignore) {
        console.log(1);
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
        
        console.log(2);
        if(Array.isArray(configNode)) {
            return false;
        }

        console.log(3);
        if(typeof configNode !== schemaType) {
            return false;
        }
    }

    console.log(4);
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