#!/usr/bin/node
import sha1 from 'sha1';
import dbClient from '../utils/db';

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
};

export default UsersController;