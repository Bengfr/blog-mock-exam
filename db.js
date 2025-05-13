const sql = require('mssql/msnodesqlv8');
const config = {
  server: '.',
  database: 'blog',
  options: {
    trustedConnection: true, // Set to true if using Windows Authentication
    trustServerCertificate: true, // Set to true if using self-signed certificates
  },
  driver: "msnodesqlv8", // because i use Windows Authentication
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1); // Exit the process if the connection fails
  });

module.exports = {
  sql,
  poolPromise,
};