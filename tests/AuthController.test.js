import { expect } from 'chai';
import sinon from 'sinon';
import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import AuthController from '../controllers/AuthController';

/* eslint-disable */
describe('testing AuthController...', () => {
  describe('testing getConnect', () => {
    it.skip('should return token if authentication is successful', async () => {
      const req = {
        headers: {
          authorization: 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=',
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };
      const hash = sha1('toto1234');
      const user = { _id: '65f2387ffc4a02c29ef949e8' };
      sinon.stub(dbClient.db.collection('users'), 'findOne').resolves(user);
      const token = uuidv4();
      sinon.stub(redisClient, 'set').resolves();
      await AuthController.getConnect(req, res);
      expect(res.status.calledOnceWith(200)).to.be.true;
      expect(res.send.calledOnceWith({ token })).to.be.true;
      sinon.restore();
    });

    it('should return Unauthorized if no authentication header is provided', async () => {
      const req = { headers: {} };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };
      await AuthController.getConnect(req, res);
      expect(res.status.calledOnceWith(401)).to.be.true;
      expect(res.send.calledOnceWith({ error: 'Unauthorized' })).to.be.true;
    });
  });

  describe('testing getDisconnect', () => {
    it('should return 204 if disconnection is successful', async () => {
      const req = { headers: { 'x-token': 'token' } };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };
      sinon.stub(redisClient, 'get').resolves('userId');
      sinon.stub(redisClient, 'del').resolves();
      await AuthController.getDisconnect(req, res);
      expect(res.status.calledOnceWith(204)).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      sinon.restore();
    });

    it('should return Unauthorized if no token header is provided', async () => {
      const req = { headers: {} };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };
      await AuthController.getDisconnect(req, res);
      expect(res.status.calledOnceWith(401)).to.be.true;
      expect(res.send.calledOnceWith({ error: 'Unauthorized' })).to.be.true;
    });
  });
});
