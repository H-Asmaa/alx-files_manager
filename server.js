import express from 'express';
import router from './routes/index';

const server = express();
const port = parseInt(process.env.PORT, 10) || 5000;

server.use(express.json());
server.use(router);

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
