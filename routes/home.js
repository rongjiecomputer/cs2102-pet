const pool = require('../db');

module.exports = async (req, res) => {
  const client = await pool.connect();
  try {
    const pizzas = await client.query('SELECT * FROM Pizzas');
    res.send(JSON.stringify(pizzas));
  } finally {
    client.release();
  }
};
