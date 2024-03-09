#!/usr/bin/node
import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = (app) => {
  const route = express.Router();
  app.use(express.json());

  app.use('/', route);

  route.get('/', () => router);
  route.get('/status', (req, res) => AppController.getStatus(req, res));
  route.get('/stats', (req, res) => AppController.getStats(req, res));
  route.post('/users', (req, res) => UsersController.postUser(req, res));
};

export default router;
