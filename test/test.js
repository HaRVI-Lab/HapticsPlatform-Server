import assert from 'assert';
import { config } from 'process';
import redis from "redis";
import sinon from "sinon";
import { setConfigDAL, getConfigDAL, delConfigDAL, existConfigDAL } from "../dal.js";

let db = new Map();
let client = redis.createClient();
let setMock = sinon.stub(client, "set").callsFake(fakeSet);
let getMock = sinon.stub(client, "get").callsFake(fakeGet);
let delMock = sinon.stub(client, "del").callsFake(fakeDel);
let existMock = sinon.stub(client, "exists").callsFake(fakeExist);


function fakeSet(config_id, data) {
    db.set(config_id, data);
}

function fakeGet(config_id) {
    return db.get(config_id);
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
    });
  });