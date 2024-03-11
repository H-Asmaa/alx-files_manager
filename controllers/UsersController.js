import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const UsersController = {
  async postUser(req, res) {
    const { email, password } = req.body;
    if (!email) return res.status(400).send({ error: 'Missing email' });
    if (!password) return res.status(400).send({ error: 'Missing password' });

    const usersCollection = await dbClient.db.collection('users');

    const retreivedUser = await usersCollection.findOne({ email });
    if (retreivedUser) return res.status(400).send({ error: 'Already exist' });

    const hashedPassword = sha1(password);
    const insertedUser = await usersCollection.insertOne({
      email,
      password: hashedPassword,
    });
    return res.status(201).send({ id: insertedUser.insertedId, email });
  },

  async getMe(request, response) {
    const token = request.header('x-token');
    if (!token) return response.status(401).send({ error: 'Unauthorized' });

    const redisUserId = await redisClient.get(`auth_${token}`);
    if (!redisUserId) return response.status(401).send({ error: 'Unauthorized' });

    const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(redisUserId) });
    return response.status(200).send({ id: user._id, email: user.email });
  },
};

export default UsersController;
