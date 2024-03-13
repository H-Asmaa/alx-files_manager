import { expect } from 'chai';
import sinon from 'sinon';
import AppController from '../controllers/AppController';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/* eslint-disable */
describe('testing AppController...', () => {
  let redisStub;
  let dbStub;
  let dbUsersStub;
  let dbFilesStub;

  before(() => {
    redisStub = sinon.stub(redisClient, 'isAlive').resolves(true);
    dbStub = sinon.stub(dbClient, 'isAlive').resolves(true);
    dbUsersStub = sinon.stub(dbClient, 'nbUsers').resolves(10);
    dbFilesStub = sinon.stub(dbClient, 'nbFiles').resolves(20);
  });

  after(() => {
	redisStub.restore();
	dbStub.restore();
	dbUsersStub.restore();
	dbFilesStub.restore();
  });

  describe('testing getStatus', () => {
    it('should return status of Redis and DB', async () => {
      const req = {};
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      await AppController.getStatus(req, res);
      expect(redisStub.calledOnce).to.be.true;
      expect(dbStub.calledOnce).to.be.true;
      expect(res.status.calledOnceWith(200)).to.be.true;
      expect(res.json.calledOnceWith({ redis: true, db: true })).to.be.true;
    });
  });

  describe('testing getStats', () => {
    it('should return user and file stats', async () => {
      const req = {};
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      await AppController.getStats(req, res);
      expect(dbUsersStub.calledOnce).to.be.true;
      expect(dbFilesStub.calledOnce).to.be.true;
      expect(res.status.calledOnceWith(200)).to.be.true;
      expect(res.json.calledOnceWith({ users: 10, files: 20 })).to.be.true;
    });
  });
});
