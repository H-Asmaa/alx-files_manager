import { expect } from 'chai';
import { ObjectId } from 'mongodb';
import sinon from 'sinon';
import UsersController from '../controllers/UsersController';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/* eslint-disable */
describe('testing UsersController...', () => {
  describe('testing postNew', () => {
    it.skip('should create a new user and return status 201', async () => {
		const req = {
		  body: {
			email: 'asmaehadar32@gmail.com',
			password: 'si-Yksjhqé21',
		  },
		};
		const res = {
		  status: sinon.stub().returnsThis(),
		  send: sinon.stub(),
		};

		const mockInsertedUser = { insertedId: ObjectId(), email: req.body.email };
		sinon.stub(dbClient.db.collection('users'), 'findOne').resolves(null);
		sinon.stub(dbClient.db.collection('users'), 'insertOne').resolves(mockInsertedUser);
		sinon.stub(redisClient, 'get').resolves('1234567890');
		await UsersController.postNew(req, res);
		expect(res.status.calledWith(200)).to.be.true;
		expect(res.send.calledWith({ id: mockInsertedUser.insertedId, email: req.body.email })).to.be.true;
	  });

    it('should return error if email already exists', async () => {
      const req = {
        body: {
          email: 'asmaehadar32@gmail.com',
          password: 'si-Yksjhqé21',
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };
      sinon.stub(dbClient.db.collection('users'), 'findOne').resolves({ email: req.body.email });
      await UsersController.postNew(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.calledWith({ error: 'Already exist' })).to.be.true;
    });
  });

  describe('testing getMe', () => {
    it('should return error if no authentication token is provided', async () => {
      const req = {
        header: () => undefined,
      };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub(),
      };
      await UsersController.getMe(req, res);
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.send.calledWith({ error: 'Unauthorized' })).to.be.true;
    });
  });
});
