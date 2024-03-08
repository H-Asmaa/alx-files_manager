#!/usr/bin/node
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const AppController = {
  async getStatus(req, res) {
    const redis = await redisClient.isAlive();
    const db = await dbClient.isAlive();
    res.status(200).json({ redis, db });
  },

  async getStats(req, res) {
    const dbUsers = await dbClient.nbUsers();
    const dbFilesCount = await dbClient.nbFiles();
    res.status(200).json({ users: dbUsers, files: dbFilesCount });
  },
};

export default AppController;