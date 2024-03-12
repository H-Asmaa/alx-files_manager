import ObjectId from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FilesController = {
  async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const redisUserId = await redisClient.get(`auth_${token}`);
    if (!redisUserId) return res.status(401).send({ error: 'Unauthorized' });

    const { name } = req.body;
    if (!name) return res.status(400).send({ error: 'Missing name' });

    const { type } = req.body;
    const fileTypes = new Set(['file', 'folder', 'image']);
    if (!type || !fileTypes.has(type)) return res.status(400).send({ error: 'Missing type' });

    const { data } = req.body;
    if (!data && type !== 'folder') return res.status(400).send({ error: 'Missing data' });

    const parentId = req.body.parentId || 0;

    if (parentId) {
      const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
      if (!file) return res.status(400).send({ error: 'Parent not found' });
      if (file.type !== 'folder') return res.status(400).send({ error: 'Parent is not a folder' });
    }

    const isPublic = req.body.isPublic || false;

    const fileToStore = {
      userId: redisUserId,
      name,
      type,
      isPublic,
      parentId,
    };

    if (type === 'folder') {
      await dbClient.db.collection('files').insertOne(fileToStore);
      return res.status(201).send({
        id: fileToStore._id,
        userId: fileToStore.userId,
        name: fileToStore.name,
        type: fileToStore.type,
        isPublic: fileToStore.isPublic,
        parentId: fileToStore.parentId,
      });
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const filePath = `${folderPath}/${uuidv4()}`;

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true }, (error) => {
        if (!error) return true;
        return false;
      });
    }

    const fileData = Buffer.from(data, 'base64');

    fs.writeFile(filePath, fileData, (error) => {
      if (!error) return true;
      return false;
    });

    fileToStore.localPath = filePath;
    await dbClient.db.collection('files').insertOne(fileToStore);

    return res.status(201).send({
      id: fileToStore._id,
      userId: fileToStore.userId,
      name: fileToStore.name,
      type: fileToStore.type,
      isPublic: fileToStore.isPublic,
      parentId: fileToStore.parentId,
    });
  },
};

export default FilesController;
