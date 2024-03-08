#!/usr/bin/node
import express from 'express';
import routes from './routes/index';

const server = express();
const port = process.env.PORT || 5000;

routes(server);

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
