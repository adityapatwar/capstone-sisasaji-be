require('dotenv').config();

module.exports = {
  schema: 'public',
  driver: 'pg',
  connectionString: process.env.DATABASE_URL || null,
  host: process.env.DATABASE_URL ? null : process.env.PGHOST,
  port: process.env.DATABASE_URL ? null : process.env.PGPORT,
  database: process.env.DATABASE_URL ? null : process.env.PGDATABASE,
  user: process.env.DATABASE_URL ? null : process.env.PGUSER,
  password: process.env.DATABASE_URL ? null : process.env.PGPASSWORD,
  dir: 'migrations',
};
