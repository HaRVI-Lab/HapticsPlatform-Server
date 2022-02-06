import assert from 'assert';
import redis from "redis";
import sinon from "sinon";
import { mockRequest, mockResponse } from 'mock-req-res';
import { setConfigDAL, getConfigDAL, delConfigDAL, existConfigDAL } from "../dal/configDAL.js";
import { setSchemaDAL, getSchemaDAL, delSchemaDAL, existSchemaDAL } from "../dal/schemaDAL.js";
import { setConfig, getConfig, delConfig, updateConfig } from "../requests/configRequests.js";
import { schemaNode } from "../model/schema-node.js";
import { schemaTree } from "../model/schema-tree.js";
import { validateConfig } from "../parse/parse-schema.js";

let db = new Map();
let client = redis.createClient();
let req = mockRequest();
let res = mockResponse();
let setMock = sinon.stub(client, "set").callsFake(fakeSet);
let getMock = sinon.stub(client, "get").callsFake(fakeGet);
let delMock = sinon.stub(client, "del").callsFake(fakeDel);
let existMock = sinon.stub(client, "exists").callsFake(fakeExist);


function fakeSet(config_id, data) {
    db.set(config_id, data);
}

function fakeGet(config_id) {
    let success = db.has(config_id);
    let reply = null;
    if(success) {
        reply = db.get(config_id);
    }
    return success, reply;
}

function fakeDel(config_id) {
    db.delete(config_id);
}

function fakeExist(config_id) {
    return db.has(config_id) ? 1 : 0;
}

describe('Server Unit Tests', function() {
    this.beforeEach(() => {
        db = new Map();
    });

    describe('DAL Functions', async () => {
        it('setConfigDAL', async () => {
            let config_id = "mock_id1";
            let data = {
                f1: "foo",
                f2: "bar",
            };
            await setConfigDAL(client, config_id, data);
            assert.equal(db.get(config_id), JSON.stringify(data));
        });

        it('getConfigDAL', async () => {
            let config_id = "mock_id1";
            let dataStr = JSON.stringify({
                f1: "foo",
                f2: "bar",
            });
            db.set(config_id, dataStr);

            let { _, reply } = await getConfigDAL(client, config_id);
            assert.equal(reply, dataStr);
        });

        it('delConfigDAL', async () => {
            let config_id = "mock_id1";
            let data = {
                f1: "foo",
                f2: "bar",
            };
            db.set(config_id, JSON.stringify(data));

            await delConfigDAL(client, config_id);
            assert.equal(db.size, 0);
        });

        it('existConfigDAL', async () => {
            let config_id = "mock_id1";
            let dataStr = JSON.stringify({
                f1: "foo",
                f2: "bar",
            });
            db.set(config_id, dataStr);
            let reply = await existConfigDAL(client, config_id);
            assert.equal(reply, true);
        });

        
        let schemaDALTestData = {
            "name": "f1",
            "type": "object",
            "optional": true,
            "is_array": false,
            "children": [
                {
                    "name": "f1",
                    "type": "object",
                    "children": [{
                        "name": "f1",
                        "type": "object",
                    }],
                },
                {
                    "name": "f2",
                    "type": "number",
                }
            ]
        };

        it('setSchemaDAL', async () => {
            let schema_id = "mock_id1";
            await setSchemaDAL(client, schema_id, schemaDALTestData);
            assert.equal(db.get(schema_id), JSON.stringify(schemaDALTestData));
        });

        it('getSchemaDAL', async () => {
            let schema_id = "mock_id1";
            let dataStr = JSON.stringify(schemaDALTestData);
            db.set(schema_id, dataStr);
            let { _, reply } = await getSchemaDAL(client, schema_id);
            assert.equal(reply, dataStr);
        });

        it('delSchemaDAL', async () => {
            let schema_id = "mock_id1";
            let data = schemaDALTestData;
            db.set(schema_id, JSON.stringify(data));
            await delSchemaDAL(client, schema_id);
            assert.equal(db.size, 0);
        });

        it('existConfigDAL', async () => {
            let schema_id = "mock_id1";
            let dataStr = JSON.stringify(schemaDALTestData);
            db.set(schema_id, dataStr);
            let reply = await existSchemaDAL(client, schema_id);
            assert.equal(reply, true);
        });
    });

    describe('Requests', async () => {
        this.beforeEach(() => {
            req = mockRequest();
            res = mockResponse();
        });

        it('setConfig - success', async () => {
            let configID = "mock_id1";
            let configBody = {
                f1: "foo",
                f2: "bar",
            };

            req.body = {
                "config_id": configID,
                "config_body": configBody,
            };

            await setConfig(req, res, client);
            assert.equal(db.get(configID), JSON.stringify(configBody));
        });
        
        it('setConfig - fail', async () => {
            let configID = "mock_id1";
            let configBody = {
                f1: "foo",
                f2: "bar",
            };
            db.set(configID, JSON.stringify(configBody));

            req.body = {
                "config_id": configID,
                "config_body": {
                    f1: "fo",
                    f2: "ba",
                },
            };

            await setConfig(req, res, client);
            assert.equal(db.get(configID), JSON.stringify(configBody));
        });

        it('getConfig - valid', async () => {
            let configID = "mock_id1";
            let configBody = {
                f1: "foo",
                f2: "bar",
            };
            db.set(configID, JSON.stringify(configBody));

            req.body = {
                "config_id": configID,
            };

            let logs = [];
            await getConfig(req, res, client, logs);
            assert.equal(logs.length, 1);
            assert.equal(logs[0], JSON.stringify(configBody));
        });

        it('getConfig - empty', async () => {
            req.body = {
                "config_id": "mock_id1",
            };

            let logs = [];
            await getConfig(req, res, client, logs);
            assert.equal(logs.length, 1);
            assert.equal(logs[0], JSON.stringify({}));
        });

        it('delConfig - success', async () => {
            let configID = "mock_id1";
            let configBody = {
                f1: "foo",
                f2: "bar",
            };
            db.set(configID, JSON.stringify(configBody));

            req.body = {
                "config_id": configID,
            };

            await delConfig(req, res, client);
            assert.equal(db.size, 0);
        });

        it('delConfig - fail', async () => {
            let configID = "mock_id1";
            let configBody = {
                f1: "foo",
                f2: "bar",
            };
            db.set(configID, JSON.stringify(configBody));

            req.body = {
                "config_id": "mock_id2",
            };

            await delConfig(req, res, client);
            assert.equal(db.size, 1);
        });

        it('updateConfig - success', async () => {
            let configID = "mock_id1";
            db.set(configID, JSON.stringify({
                f1: "foo",
                f2: "bar",
            }));

            let updateBody = {
                f1: "fo",
                f2: "ba",
            }
            req.body = {
                "config_id": configID,
                "config_body": updateBody,
            };

            await updateConfig(req, res, client);
            assert.equal(db.get(configID), JSON.stringify(updateBody));
        });

        it('updateConfig - fail', async () => {
            let configID = "mock_id1";
            let configBody = {
                f1: "foo",
                f2: "bar",
            };
            db.set(configID, JSON.stringify(configBody));

            req.body = {
                "config_id": "mock_id2",
                "config_body": {
                    f1: "fo",
                    f2: "ba",
                },
            };

            await updateConfig(req, res, client);
            assert.equal(db.get(configID), JSON.stringify(configBody));
        });

        it('schema-node-test1', async () => {
            const nodeData = {
                "a": 1,
            }

            const node = new schemaNode(nodeData);
            assert.equal(node.isEmpty(), true);
        });

        it('schema-node-test2', async () => {
            const nodeData = {
                "name": "abc",
                "type": "object",
                "optional": true,
                "is_array": false,
                "ff": "as",
                "vv": 1,
                "c": false,
                "children": [
                    {
                        "name": "abc",
                        "type": "string",
                    },
                    {
                        "name": "ab",
                        "type": "string",
                    },
                ],
            }

            const node = new schemaNode(nodeData);
            console.log(node);
            assert.equal(node.isEmpty(), false);
        });

        it('schema-tree-test1', async () => {
            const nodeData = {
                "name": "abc",
                "type": "string",
                "optional": true,
                "is_array": false,
                "ff": "as",
                "vv": 1,
                "c": false,
                "children": [
                    {
                        "name": "abc",
                        "type": "string",
                    },
                    {
                        "name": "ab",
                        "type": "string",
                    },
                ],
            }
            
            const treeData = {
                "schema_id": "asd",
                "schema_body": [
                    {
                        "name": "abc",
                        "type": "string",
                    },
                    {
                        "name": "ab",
                        "type": "string",
                    }
                ],
            }

            const tree = new schemaTree(treeData);
            console.log(tree);
            assert.equal(tree.isEmpty(), false);
        });

        it('schema-validate-test1', async () => {
            const nodeData1 = {
                "name": "abc",
                "type": "object",
                "optional": true,
                "is_array": false,
                "children": [
                    {
                        "name": "abc",
                        "type": "string",
                    },
                    {
                        "name": "ab",
                        "type": "string",
                    },
                ],
            };

            const nodeData2 = {
                "name": "ab",
                "type": "object",
                "optional": false,
                "is_array": false,
                "children": [
                    {
                        "name": "abc",
                        "type": "string",
                    },
                    {
                        "name": "ab",
                        "type": "string",
                    },
                ],
            };

            const nodeData3 = {
                "name": "abe",
                "type": "string",
            };
            
            const treeData = {
                "schema_id": "asd",
                "schema_body": [
                    nodeData1,
                    nodeData2,
                    nodeData3,
                ],
            }

            const configData = {
                "abe": "bob",
                "ab": {
                    "abc": "def",
                    "ab": "fgh"
                },
                "abc": {
                    "abc": "def",
                    "ab": "fgh"
                }
            }

            const tree = new schemaTree(treeData);
            console.log(tree);
            console.log(validateConfig(tree, configData));
            assert.equal(tree.isEmpty(), false);
        });
    });
});