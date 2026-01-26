const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'taxifun_db',
  user: 'admin',
  password: 'Mambou2025',
});

client.connect()
  .then(() => {
    console.log('Connected successfully!');
    return client.query('SELECT 1 as test');
  })
  .then(res => {
    console.log('Query result:', res.rows);
    client.end();
  })
  .catch(err => {
    console.error('Connection error:', err.message);
    process.exit(1);
  });
