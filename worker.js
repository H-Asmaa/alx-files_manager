import Queue from 'bull';
import { ObjectId } from 'mongodb';
import { generate } from 'image-thumbnail';
import fs from 'fs';
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue');

async function generateThumbnail(inputPath, width) {
  try {
    const thumbnail = await generate(inputPath, { width });
    const path = `${inputPath}_${width}`;
    fs.writeFileSync(path, thumbnail);
  } catch (error) {
    throw new Error('Trouble saving the thumbnail');
  }
}

fileQueue.process(async (job) => {
  try {
    const { fileId, userId } = job.data;
    if (!fileId) throw new Error('Missing fileId');
    if (!userId) throw new Error('Missing userId');

    const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
    if (!file) throw new Error('File not found');

    const inputPath = file.path;

    await generateThumbnail(inputPath, 500);
    await generateThumbnail(inputPath, 250);
    await generateThumbnail(inputPath, 100);
  } catch (error) {
    throw new Error(`Error processing job: ${error.message}`);
  }
});
