require('dotenv').config();

module.exports = {
  schema: 'public',
  driver: 'pg',
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  dir: 'migrations',
};
