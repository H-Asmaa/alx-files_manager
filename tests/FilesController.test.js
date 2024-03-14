import { expect } from 'chai';
import sinon from 'sinon';
import { ObjectId } from 'mongodb';
import FilesController from '../controllers/FilesController';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/* eslint-disable */
describe('FilesController', () => {
  describe('postUpload', () => {
    it.skip('should upload a file and return status 201', async () => {
      const parentId = new ObjectId().toString();
      const req = {
        headers: { 'x-token': 'valid-token' },
        body: {
          name: 'test_file.txt',
          type: 'file',
          data: 'encodeddata',
          parentId: parentId,
          isPublic: false,
        },
      };
      const res = { status: sinon.stub().returnsThis(), send: sinon.stub() };
      sinon.stub(redisClient, 'get').resolves('user-id');
      sinon.stub(dbClient.db.collection('files'), 'findOne').resolves(null);
      sinon
        .stub(dbClient.db.collection('files'), 'insertOne')
        .resolves({ insertedId: 'inserted-id' });
      sinon.stub(dbClient.db, 'collection').withArgs('files').returnsThis();
      sinon.stub(dbClient, 'db').returnsThis();
      await FilesController.postUpload(req, res);
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(
        res.send.calledWith({
          id: 'inserted-id',
          userId: 'user-id',
          name: 'test_file.txt',
          type: 'file',
          isPublic: false,
          parentId: 'parent-id',
        })
      ).to.be.true;
    });
  });
});
