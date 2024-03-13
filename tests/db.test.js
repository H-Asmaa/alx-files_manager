import { expect } from 'chai';
import { MongoClient } from 'mongodb';
import sinon from 'sinon';
import dbClient from '../utils/db';

/* eslint-disable */
describe('testing the DBClient...', () => {
  let clientStub;

  before(() => {
    clientStub = sinon.stub(MongoClient, 'connect');
  });

  after(() => {
    clientStub.restore();
  });

  describe('testing isAlive', () => {
    it('should return true if the connection is alive', () => {
      sinon.stub(dbClient.client.topology, 'isConnected').returns(true);
      const alive = dbClient.isAlive();
      expect(alive).to.be.true;
    });
  });

  describe('testing nbUsers', () => {
    it('should return the number of users in the collection', async () => {
      const countDocumentsStub = sinon.stub().resolves(1);
      sinon
        .stub(dbClient.db.collection('users'), 'countDocuments')
        .callsFake(countDocumentsStub);
      const count = await dbClient.nbUsers();
      expect(count).to.equal(1);
    });
  });

  describe('testing nbFiles', () => {
    it('should return the number of files in the collection', async () => {
      const countDocumentsStub = sinon.stub().resolves(2);
      sinon
        .stub(dbClient.db.collection('files'), 'countDocuments')
        .callsFake(countDocumentsStub);
      const count = await dbClient.nbFiles();
      expect(count).to.equal(2);
    });
  });
});
