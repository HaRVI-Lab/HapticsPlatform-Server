import { schemaNode } from "./schema-node.js";
import { stringType, undefType } from "../constant/types.js";

export class schemaTree {
    constructor(data) {
        this.id = "";
        this.root = schemaNode.getDummyNode();

        if(typeof data.schema_id !== stringType) {
            return;
        }
        this.id = data.schema_id;

        let nameSet = new Set();
        for(const child of data.schema_body) {
            let node = new schemaNode(child);
            if(node.isEmpty() || nameSet.has(node.data.name)) {
                this.root.data.children = [];
                return;
            }
            nameSet.add(node.data.name);
            this.root.data.children.push(node);
        }
    }

    isEmpty() {
        return this.root.data.children.length === 0;
    }
}

