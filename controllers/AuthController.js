import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const AuthController = {
  async getConnect(req, res) {
    const basicAuth = req.headers.authorization;
    if (basicAuth && typeof basicAuth === 'string' && basicAuth.startsWith('Basic ')) {
      const extracter = basicAuth.split(' ')[1];
      const decode = Buffer.from(extracter, 'base64').toString('utf-8');
      const [email, password] = decode.split(':');
      const hash = sha1(password);

      const user = await dbClient.db.collection('users').findOne({ email, password: hash });
      if (!user) return res.status(401).send({ error: 'Unauthorized' });

      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, JSON.stringify(user), 864000);
      return res.status(200).send({ token });
    }
    return null;
  },

  async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    const user = await redisClient.get(`auth_${token}`);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });
    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  },
};

export default AuthController;
