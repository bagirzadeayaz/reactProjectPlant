import { createServer } from 'node:http';
import { createApplication } from './bootstrap.js';
import { loadConfig } from './config.js';

const config = loadConfig(process.env);
const server = createServer(createApplication(config));
server.listen(config.port, () => console.log('Planto API listening on port', config.port));

const shutdown = () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
