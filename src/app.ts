import { container } from 'tsyringe';
import type { Application } from 'express';
import { ServerBuilder } from './serverBuilder';

function getApp(): Application {
  const app = container.resolve(ServerBuilder).build();
  return app;
}

export { getApp };
