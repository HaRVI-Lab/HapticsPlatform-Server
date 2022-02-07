import assert from 'assert';
import redis from "redis";
import sinon from "sinon";
import { mockRequest, mockResponse } from 'mock-req-res';
import { setConfigDAL, getConfigDAL, delConfigDAL, existConfigDAL } from "../dal/configDAL.js";
import { setSchemaDAL, getSchemaDAL, delSchemaDAL, existSchemaDAL } from "../dal/schemaDAL.js";
import { setSurveyLinkDAL, getSurveyLinkDAL } from '../dal/surveyDAL.js';
import { setConfig, getConfig, delConfig, updateConfig } from "../requests/configRequests.js";
import { setSchema, getSchema, delSchema, updateSchema } from '../requests/schemaRequests.js';
import { setSurvey, getSurvey } from '../requests/surveyRequests.js';
import { schemaNode } from "../model/schema-node.js";
import { schemaTree } from "../model/schema-tree.js";
import { checkSchema, validateConfig } from "../parse/parse-schema.js";

let db = new Map();
let client = redis.createClient();
let req = mockRequest();
let res = mockResponse();
sinon.stub(client, "set").callsFake(fakeSet);
sinon.stub(client, "get").callsFake(fakeGet);
sinon.stub(client, "del").callsFake(fakeDel);
sinon.stub(client, "exists").callsFake(fakeExist);


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

    describe('Config DAL Functions', async () => {
        const config_id = "mock_id1";
        const configData = {
            f1: "foo",
            f2: "bar",
        };

        it('setConfigDAL', async () => {
            await setConfigDAL(client, config_id, configData);
            assert.equal(db.get(config_id), JSON.stringify(configData));
        });

        it('getConfigDAL', async () => {
            const dataStr = JSON.stringify(configData);
            db.set(config_id, dataStr);
            const { _, reply } = await getConfigDAL(client, config_id);
            assert.equal(reply, dataStr);
        });

        it('delConfigDAL', async () => {
            db.set(config_id, JSON.stringify(configData));
            await delConfigDAL(client, config_id);
            assert.equal(db.size, 0);
        });

        it('existConfigDAL', async () => {
            const dataStr = JSON.stringify(configData);
            db.set(config_id, dataStr);
            const reply = await existConfigDAL(client, config_id);
            assert.equal(reply, true);
        });
    });    
        
    describe('Schema DAL Functions', async () => {
        const schema_id = "mock_id1";
        const schemaDALTestData = {
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
            await setSchemaDAL(client, schema_id, schemaDALTestData);
            assert.equal(db.get(schema_id), JSON.stringify(schemaDALTestData));
        });

        it('getSchemaDAL', async () => {
            const dataStr = JSON.stringify(schemaDALTestData);
            db.set(schema_id, dataStr);
            const { _, reply } = await getSchemaDAL(client, schema_id);
            assert.equal(reply, dataStr);
        });

        it('delSchemaDAL', async () => {
            const data = schemaDALTestData;
            db.set(schema_id, JSON.stringify(data));
            await delSchemaDAL(client, schema_id);
            assert.equal(db.size, 0);
        });

        it('existConfigDAL', async () => {
            const dataStr = JSON.stringify(schemaDALTestData);
            db.set(schema_id, dataStr);
            const reply = await existSchemaDAL(client, schema_id);
            assert.equal(reply, true);
        });
    });

    describe('Survey DAL Functions', async () => {
        const survey_id = "mock_survey_1";
        const survey_link = "mock_link";

        it('setSurvelyLinkDAL', async() => {
            await setSurveyLinkDAL(client, survey_id, survey_link);
            assert.equal(db.get(survey_id), survey_link);
        });

        it('getSurvelyLinkDAL', async() => {
            db.set(survey_id, survey_link);
            const { _, reply } = await getSurveyLinkDAL(client, survey_id);
            assert.equal(reply, survey_link);
        });
    });

    describe('Config Requests', async () => {
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
    });

    describe("Schema Requests", async() => {
        const schema_id = "mock_id1";
        const reqBody = {
            "schema_id": schema_id,
            "schema_body": [
                {
                    "name": "s1",
                    "type": "string"
                }
            ],
        };
        const updateData = [
            {
                "name": "s1",
                "type": "string"
            }, 
            {
                "name": "s2",
                "type": "number"
            }
        ]
        const tree = new schemaTree(reqBody);

        it('setSchema - success', async () => {
            req.body = reqBody;
            await setSchema(req, res, client);
            assert.equal(db.get(schema_id), JSON.stringify(JSON.stringify(tree)));
        });
        
        it('setSchema - fail', async () => {
            db.set(schema_id, JSON.stringify(tree));
            req.body = reqBody;
            await setSchema(req, res, client);
            assert.equal(db.get(schema_id), JSON.stringify(tree));
        });

        it('getSchema - valid', async () => {
            db.set(schema_id, JSON.stringify(tree));
            req.body = {
                "schema_id": schema_id,
            };
            let logs = [];
            await getSchema(req, res, client, logs);
            assert.equal(logs.length, 1);
            assert.equal(logs[0], JSON.stringify(tree));
        });

        it('getSchema - empty', async () => {
            req.body = {
                "schema_id": "non-ex",
            };
            let logs = [];
            await getSchema(req, res, client, logs);
            assert.equal(logs.length, 1);
            assert.equal(logs[0], JSON.stringify({}));
        });

        it('delSchema - success', async () => {
            db.set(schema_id, JSON.stringify(reqBody));
            req.body = {
                "schema_id": schema_id,
            };
            await delSchema(req, res, client);
            assert.equal(db.size, 0);
        });

        it('delSchema - fail', async () => {
            db.set(schema_id, JSON.stringify(tree));
            req.body = {
                "schema_id": "non-ex",
            };
            await delSchema(req, res, client);
            assert.equal(db.size, 1);
        });

        it('updateSchema - success', async () => {
            db.set(schema_id, JSON.stringify(tree));
            req.body["schema_id"] = schema_id;
            req.body["schema_body"] = updateData;
            const tree2 = new schemaTree(req.body);
            await updateSchema(req, res, client);
            assert.equal(db.get(schema_id), JSON.stringify(JSON.stringify(tree2)));
        });

        it('updateConfig - fail', async () => {
            db.set(schema_id, JSON.stringify(tree));
            req.body["schema_id"] = "non-ex";
            req.body["schema_body"] = updateData;
            await updateSchema(req, res, client);
            assert.equal(db.get(schema_id), JSON.stringify(tree));
        });

    });

    describe('Survey Requests', async () => {
        this.beforeEach(() => {
            req = mockRequest();
            res = mockResponse();
        });

        const survey_id = "mock_survey_1";
        const survey_link = "mock_link";

        it("setSurvey", async () => {
            req.body = {
                "survey_id": survey_id,
                "survey_link": survey_link,
            }
            await setSurvey(req, res, client);
            assert.equal(db.get(survey_id), survey_link);
        });

        it("getSurvey - success", async () => {
            req.body = {
                "survey_id": survey_id,
            }
            db.set(survey_id, survey_link);

            let logs = [];
            await getSurvey(req, res, client, logs);
            assert.equal(logs.length, 1);
            assert.equal(logs[0], survey_link);
        });

        it("getSurvey - failure", async () => {
            req.body = {
                "survey_id": "false_id",
            }
            db.set(survey_id, survey_link);

            let logs = [];
            await getSurvey(req, res, client, logs);
            assert.equal(logs.length, 1);
            assert.equal(logs[0], "");
        });
    });

    describe("Schema Node", async () => {
        it("Valid Node - Single", async () => {
            const data = {
                "name": "foo",
                "type": "boolean",
                "is_array": true,
                "optional": false,
                "children": [],
            }
            const node = new schemaNode(data);
            assert.equal(node.isEmpty(), false);
        });

        it("Valid Node - Nested", async () => {
            const data = {
                "name": "foo",
                "type": "boolean",
                "is_array": true,
                "optional": false,
                "children": [
                    {
                        "name": "foo",
                        "type": "object",
                        "children": [
                            {
                                "name": "foo",
                                "type": "boolean",
                            },
                            {
                                "name": "bar",
                                "type": "string",
                            },
                        ],
                    },
                    {
                        "name": "bar",
                        "type": "number",
                        "optional": true,
                    },
                ],
            }
            const node = new schemaNode(data);
            assert.equal(node.isEmpty(), false);
        });

        it("Missing Required Fields", async () => {
            const data1 = {
                "name": "abc",
            };
            let node = new schemaNode(data1);
            assert.equal(node.isEmpty(), true);

            const data2 = {
                "type": "string",
            };
            node = new schemaNode(data2);
            assert.equal(node.isEmpty(), true);
        });

        it("Type Errors", async () => {
            const data1 = {
                "name": "abc",
                "type": 2,
            };
            let node = new schemaNode(data1);
            assert.equal(node.isEmpty(), true);

            const data2 = {
                "name": "abc",
                "type": "foo",
            };
            node = new schemaNode(data2);
            assert.equal(node.isEmpty(), true);

            const data3 = {
                "name": "abc",
                "type": "string",
                "optional": 2,
            };
            node = new schemaNode(data3);
            assert.equal(node.isEmpty(), true);

            const data4 = {
                "name": "abc",
                "type": "string",
                "optional": true,
                "is_array": "bar",
            };
            node = new schemaNode(data4);
            assert.equal(node.isEmpty(), true);
        });

        it("Unparsable Children", async () => {
            const data1 = {
                "name": "foo",
                "type": "object",
                "children": "abc",
            };
            let node = new schemaNode(data1);
            assert.equal(node.isEmpty(), true);

            const data2 = {
                "name": "foo",
                "type": "object",
                "children": [
                    {
                        "name": "foo",
                        "type": "not string",
                    }
                ],
            };
            node = new schemaNode(data2);
            assert.equal(node.isEmpty(), true);
        });
    });

    describe("Schema Tree", async () => {
        const validNode = {
            "name": "foo",
            "type": "string",
        };

        it("Valid Tree", async () => {
            const treeData = {
                "schema_id": "s1",
                "schema_body": [
                    validNode,
                ],
            };
            const tree = new schemaTree(treeData);
            assert.equal(tree.isEmpty(), false);
        });

        it("Missing Required Fields", async () => {
            const tree1 = {
                "schema_body": [
                    validNode,
                ],
            };
            let tree = new schemaTree(tree1);
            assert.equal(tree.isEmpty(), true);

            const tree2 = {
                "schema_id": "s1",
            };
            tree = new schemaTree(tree2);
            assert.equal(tree.isEmpty(), true);
        });

        it("Duplicate Children Node", async () => {
            const treeData = {
                "schema_body": [
                    validNode,
                    validNode,
                ],
            };
            const tree = new schemaTree(treeData);
            assert.equal(tree.isEmpty(), true);
        });

        it("Unparsable Node", async () => {
            const treeData = {
                "schema_id": "s1",
                "schema_body": [
                    {
                        "name": "foo",
                    },
                ],
            };
            const tree = new schemaTree(treeData);
            assert.equal(tree.isEmpty(), true);
        });
    });

    describe("Validate Config", async () => {
        const nodeData1 = {
            "name": "f1",
            "type": "object",
            "optional": true,
            "is_array": false,
            "children": [
                {
                    "name": "b1",
                    "type": "string",
                },
                {
                    "name": "b2",
                    "type": "boolean",
                    "optional": true,
                },
            ],
        };

        const nodeData2 = {
            "name": "f2",
            "type": "object",
            "optional": false,
            "is_array": false,
            "children": [
                {
                    "name": "b1",
                    "type": "string",
                },
                {
                    "name": "b2",
                    "type": "number",
                },
            ],
        };

        const nodeData3 = {
            "name": "f3",
            "type": "string",
        };
        
        const treeData = {
            "schema_id": "s1",
            "schema_body": [
                nodeData1,
                nodeData2,
                nodeData3,
            ],
        }

        const tree = new schemaTree(treeData);


        it("Valid - Missing Optionals", async () => {
            const configData1 = {
                "f3": "bob",
                "f2": {
                    "b1": "foo",
                    "b2": 5,
                },
            };
            assert.equal(validateConfig(tree, configData1), true);

            const configData2 = {
                "f3": "bob",
                "f2": {
                    "b1": "foo",
                    "b2": 5,
                },
                "f1": {
                    "b1": "foo",
                },
            };
            assert.equal(validateConfig(tree, configData2), true);
        });

        it("Invalid - Missing Non-optionals", async () => {
            const configData1 = {
                "f3": "bob",
                "f1": {
                    "b1": "foo",
                    "b2": true,
                },
            };
            assert.equal(validateConfig(tree, configData1), false);

            const configData2 = {
                "f3": "bob",
                "f2": {
                    "b1": "foo",
                    "b2": 3,
                },
                "f1": {
                    "b2": false,
                },
            };
            assert.equal(validateConfig(tree, configData2), false);
        });

        it("Valid - Following Schema", async () => {
            const configData = {
                "f3": "bob",
                "f2": {
                    "b1": "foo",
                    "b2": 3,
                },
                "f1": {
                    "b1": "bar",
                    "b2": false,
                },
            };
            assert.equal(validateConfig(tree, configData), true);
        });

        it("Invalid - Different From Schema", async () => {
            const configData = {
                "a": 3,
                "b": false,
                "c": {
                    "d": "foo",
                }
            };
            assert.equal(validateConfig(tree, configData), false);
        });
    });
});