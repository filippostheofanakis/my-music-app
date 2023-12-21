const { Pool } = require("pg");

// Create a new pool instance and pass in your PostgreSQL connection information.
const pool = new Pool({
  user: "postgres", // Your PostgreSQL username
  host: "localhost",
  database: "music_app_db", // Your PostgreSQL database name
  password: "201155556", // Your PostgreSQL password
  port: 5432, // The port where PostgreSQL is running
});

module.exports = pool;
