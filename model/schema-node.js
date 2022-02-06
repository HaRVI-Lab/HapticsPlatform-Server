import { allowedTypes, stringType, numberType, booleanType, objectType, undefType } from "../constant/types.js";

const requiredFields = {
    "name": nameCheck,
    "type": typeCheck,
};

const optionalFields = {
    "is_array": arrayCheck, 
    "optional": optionalCheck, 
};

const arrayFields = {
    "children": childrenCheck,
}

export class schemaNode {
    constructor(node) {
        let [success, res] = buildNode(node);
        this.data = success ? res : {};
        this.ignore = false;
    }

    isEmpty() {
        return Object.keys(this.data).length === 0;
    }

    static getDummyNode() {
        return {
            data: {
                children: [],
            },
            ignore: true,
        };
    }
}

function buildNode(node) {

    let res = {
        is_array: false,
        optional: false,
        children: [],
    };

    let errReturn  = [false, {}];

    for(const key of Object.keys(requiredFields)) {
        const val = node[key];
        let checkFunc = requiredFields[key];
        if(typeof val === undefType || !checkFunc(val)) {
            console.log(checkFunc.name + " failure.")
            return errReturn;
        }
        res[key] = val;
    }

    for(const key of Object.keys(optionalFields)) {
        const val = node[key];
        let checkFunc = optionalFields[key];
        if(typeof val !== undefType) {
            if(!checkFunc(val)) {
                console.log(checkFunc.name + " failure.")
                return errReturn;
            }
            res[key] = val;
        } 
    }

    for(const key of Object.keys(arrayFields)) {
        const val = node[key];
        let checkFunc = arrayFields[key];
        if(typeof val !== undefType) {
            if(!checkFunc(val)) {
                console.log(checkFunc.name + " failure.")
                return errReturn;
            }

            let nameSet = new Set();
            for(const child of val) {
                const [success, childNode] = buildNode(child);
                if(!success || nameSet.has(child.name)) {
                    return errReturn;
                }
                nameSet.add(child.name);
                res[key].push({
                    data: childNode,
                    ignore: false,
                });
            }
        }
    }

    if(res["type"] !== objectType) {
        res.children = [];
    }
    return [true, res];
}

function nameCheck(val) {
    return typeof val === stringType;
}

function typeCheck(val) {
    return (typeof val === stringType) && allowedTypes.has(val);
}

function arrayCheck(val) {
    return typeof val === booleanType;
}

function optionalCheck(val) {
    return typeof val === booleanType;
}

function childrenCheck(val) {
    return Array.isArray(val) ? true : false;
}