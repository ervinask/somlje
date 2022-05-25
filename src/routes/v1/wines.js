const express = require('express');
const mysql = require('mysql2/promise');

const { mysqlConfig } = require('../../config');
const isLoggedIn = require('../../middleware/auth');
const { winesValidator } = require('../../middleware/validation');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`SELECT * FROM wines`);

    await con.end();
    console.log(data);
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Server issue occured' });
  }
});

router.post('/', isLoggedIn, winesValidator, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
    INSERT INTO wines (title, region, year)
    VALUES (${mysql.escape(req.body.title)}, 
    ${mysql.escape(req.body.region)},
    ${mysql.escape(req.body.years)})`);

    if (!data.insertId || data.affectedRows !== 1) {
      await con.end();
      return res.status(500).send({ err: 'Server issue occured' });
    }

    await con.end();
    return res.send({ msg: `Wine was successfully added` });
  } catch (err) {
    return res.status(500).send({ err: 'Server issue occured' });
  }
});

module.exports = router;
