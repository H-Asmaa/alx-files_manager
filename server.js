import express from 'express';
import router from './routes/index';

const server = express();
const port = process.env.PORT || 5000;

router(server);

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
