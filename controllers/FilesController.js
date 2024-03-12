import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FilesController = {
  async postUpload(req, res) {
    const token = req.headers['x-token'];
    // console.log('token: '+token);
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const redisUserId = await redisClient.get(`auth_${token}`);
    // console.log('userId '+redisUserId);
    if (!redisUserId) return res.status(401).send({ error: 'Unauthorized' });

    const { name } = req.body;
    // console.log('name: '+name);
    if (!name) return res.status(400).send({ error: 'Missing name' });

    const { type } = req.body;
    // console.log('type: '+type);
    const fileTypes = new Set(['file', 'folder', 'image']);
    if (!type || !fileTypes.has(type)) return res.status(400).send({ error: 'Missing type' });

    const { data } = req.body;
    // console.log('data: '+data);
    if (!data && type !== 'folder') return res.status(400).send({ error: 'Missing data' });

    const parentId = req.body.parentId || 0;
    // console.log('parentId: '+parentId);
    if (parentId) {
      const file = await dbClient.db
        .collection('files')
        .findOne({ _id: ObjectId(parentId) });
      // console.log('file: '+file);
      if (!file) return res.status(400).send({ error: 'Parent not found' });
      if (file.type !== 'folder') return res.status(400).send({ error: 'Parent is not a folder' });
    }

    const isPublic = req.body.isPublic || false;
    // console.log(isPublic);

    const fileToStore = {
      userId: redisUserId,
      name,
      type,
      isPublic,
      parentId,
    };
    // console.log('fileToStore: '+fileToStore);

    if (type === 'folder') {
      // console.log('type is folder.');
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
    // console.log('folderPath :'+folderPath);
    const filePath = `${folderPath}/${uuidv4()}`;
    // console.log('filePath: '+filePath);

    if (!fs.existsSync(folderPath)) {
      // console.log('About to create the directory.');
      await fs.mkdirSync(folderPath, { recursive: true }, (error) => {
        if (!error) return true;
        return false;
      });
    }

    const fileData = Buffer.from(data, 'base64');
    // console.log('fileData: '+fileData);

    await fs.writeFile(filePath, fileData, (error) => {
      if (!error) return true;
      return false;
    });

    fileToStore.localPath = filePath;
    // console.log('fileToStore: '+fileToStore);
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

  async getShow(req, res) {
    console.log('this is getShow');
    const token = req.headers['x-token'];
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).send({ error: 'Unauthorized' });

    const user = await dbClient.db
      .collection('users')
      .findOne({ _id: ObjectId(userId) });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const { parentId } = req.query;
    const file = await dbClient.db
      .collection('files')
      .findOne({ _id: ObjectId(parentId), userId: user._id });
    if (!file) return res.status(404).send({ error: 'Not found' });

    return res.send({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  },

  async getIndex(req, res) {
    console.log('this is getIndex');
    const token = req.headers['x-token'];
    console.log(token);
    if (!token) return res.status(401).send({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    console.log(userId);
    if (!userId) return res.status(401).send({ error: 'Unauthorized' });

    const user = await dbClient.db
      .collection('users')
      .findOne({ _id: ObjectId(userId) });
    console.log(user);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const { parentId = 0, page = 0 } = req.query;
    console.log(parentId);
    console.log(page);

    const fileCount = await dbClient.db
      .collection('files')
      .countDocuments({
        userId: ObjectId(userId),
        parentId,
      });
    console.log('fileCount: '+fileCount);
    if (!fileCount) return res.status(200).send([]);

    const maxPerPage = parseInt(page, 10) * 20;
    console.log('max: '+maxPerPage);

    const filesList = await dbClient.db.collection('files')
      .find({
        userId: ObjectId(userId),
        parentId,
      })
      .skip(maxPerPage)
      .limit(20)
      .toArray();
    console.log(filesList);
    return res.status(200).send(filesList);
  },
};

export default FilesController;
