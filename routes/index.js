#!/usr/bin/node
import express from 'express';
import AppController from '../controllers/AppController';

export default (app) => {
  const route = express.Router();
  app.use(express.json());
  app.use('/', route);

  route.get('/status', (req, res) => AppController.getStatus(req, res));
  route.get('/stats', (req, res) => AppController.getStats(req, res));
};
