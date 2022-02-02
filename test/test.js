import assert from 'assert';
import redis from "redis";
import sinon from "sinon";
import { setConfigDAL, getConfigDAL } from "../dal.js";

let db = {};
let client = redis.createClient();
let setMock = sinon.stub(client, "set").callsFake(fakeSet);

let getMock = sinon.stub(client, "get").callsFake(fakeGet);

function fakeSet(config_id, data) {
    db[config_id] = data;
}

function fakeGet(config_id) {
    return db[config_id];
}

describe('Server Unit Tests', function() {
    this.beforeEach(() => {
        db = {};
    });

    describe('DAL Functions', function() {
      it('setConfigDAL', function() {
        let config_id = "mock_id1";
        let data = {
            f1: "foo",
            f2: "bar",
        };
        setConfigDAL(client, config_id, data).then(() => {
            assert.equal(db[config_id] === JSON.stringify(data));
        });
      });

      it('getConfigDAL', function() {
        let config_id = "mock_id1";
        let data = {
            f1: "foo",
            f2: "bar",
        };
        db[config_id] = JSON.stringify(data);

        getConfigDAL(client, config_id).then(res => {
            assert.equal(res === JSON.stringify(data));
        });
      });
    });
  });