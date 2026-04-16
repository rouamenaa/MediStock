const dotenv = require('dotenv');
dotenv.config();

const app = require('./app'); 
const sequelize = require('./config/database');
require('./models');

const port = Number(process.env.PORT || 8091);

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(port, () => {
      process.stdout.write(`Document Service running on port ${port}\n`);
    });
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}

start();