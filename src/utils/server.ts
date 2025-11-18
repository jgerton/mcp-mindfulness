import express, { Express } from 'express';
import routes from '../routes';

export const createServer = async (): Promise<Express> => {
  const app = express();
  app.use(express.json());
  app.use('/api', routes);
  return app;
}; 