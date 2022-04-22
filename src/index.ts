import express from 'express';

import { initSequelizeClient } from './sequelize';
import { initUsersRouter, initPostsRouter } from './routers';
import { initErrorRequestHandler, initNotFoundRequestHandler } from './middleware';
require("dotenv").config();


const PORT = 8080;

async function main(): Promise<void> {
  const app = express();

  // TODO(roman): store these credentials in some external configs
  // so that they don't end up in the git repo
  const sequelizeClient = await initSequelizeClient({
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    // username: 'postgres',
    // password: '758427123',
    // database: 'bend-task',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
  });

  app.use(express.json());

  app.use('/api/v1/users', initUsersRouter(sequelizeClient));
  app.use('/api/v1/posts', initPostsRouter(sequelizeClient));

  app.use('/', initNotFoundRequestHandler());

  app.use(initErrorRequestHandler());

  return new Promise((resolve) => {
    app.listen(PORT, () => {
      console.info(`app listening on port: '${PORT}'`);

      resolve();
    });
  });
}

main().then(() => console.info('app started')).catch(console.error);