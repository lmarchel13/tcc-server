const app = require('./src/app');
const { PORT } = require('./src/config');
const { logger } = require('./src/utils');

const log = logger('Application');

app.listen(PORT, () => {
  log.info(`Listening to port ${PORT}`);
});
