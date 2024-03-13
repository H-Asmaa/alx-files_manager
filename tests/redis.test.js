import { expect } from 'chai';
import sinon from 'sinon';
import redisClient from '../utils/redis';

/* eslint-disable */
describe('testing the RedisClient...', () => {
	let clientStub;

	before(() => {
	  clientStub = sinon.stub(redisClient, 'client').value({
		connected: true,
		on: sinon.stub(),
	  });
	});

	after(() => {
	  clientStub.restore();
	});

	describe('testing isAlive', () => {
	  it('should return true if the connection is alive', () => {
		expect(redisClient.isAlive()).to.be.true;
	  });
	});

	describe('testing get', () => {
	  it('should return the value of the key from Redis', async () => {
		const key = 'myKey';
		const value = 'myVal';
		const getAsyncStub = sinon.stub().resolves(value);
		sinon.stub(redisClient, 'getAsync').get(() => getAsyncStub);
		const result = await redisClient.get(key);
		expect(result).to.equal(value);
		expect(getAsyncStub.calledOnceWith(key)).to.be.true;
	  });

	  it('should return null if getting value fails', async () => {
		const key = 'myKey';
		const getAsyncStub = sinon.stub().rejects(new Error('Failed to get value'));
		sinon.stub(redisClient, 'getAsync').get(() => getAsyncStub);
		const result = await redisClient.get(key);
		expect(result).to.be.null;
		expect(getAsyncStub.calledOnceWith(key)).to.be.true;
	  });
	});

	describe('testing set', () => {
	  it('should set the value for the key in Redis', async () => {
		const key = 'myKey';
		const value = 'myVal';
		const duration = 60;
		const setExAsyncStub = sinon.stub().resolves('OK');
		sinon.stub(redisClient, 'setExAsync').get(() => setExAsyncStub);
		await redisClient.set(key, value, duration);
		expect(setExAsyncStub.calledOnceWith(key, duration, value)).to.be.true;
	  });
	});

	describe('testing del', () => {
	  it('should delete the value for the key in Redis', async () => {
		const key = 'myKey';
		const delAsyncStub = sinon.stub().resolves(1);
		sinon.stub(redisClient, 'delAsync').get(() => delAsyncStub);
		await redisClient.del(key);
		expect(delAsyncStub.calledOnceWith(key)).to.be.true;
	  });
	});
  });
