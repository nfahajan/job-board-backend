/* eslint-disable no-console */
import app from './app';
import { Server } from 'http';
import config from './config';
import { seeder } from './seed';

process.on('uncaughtException', error => {
  console.log(error);
  process.exit(1);
});

let server: Server;
async function main() {
  try {
    server = app.listen(config.port, () => {
      console.log(`Application  listening on port ${config.port}`);
    });

    // seed the database
    await seeder();
    console.log(`🛢   Database is connected successfully`);
  } catch (error) {
    console.log('Failed to connect database', error);
  }
  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        console.log(error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main();

process.on('SIGTERM', () => {
  console.log('SIGTERM is received');
  if (server) {
    server.close();
  }
});
