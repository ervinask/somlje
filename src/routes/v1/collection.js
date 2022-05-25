const express = require('express');
const mysql = require('mysql2/promise');

const { mysqlConfig } = require('../../config');
const { collectionValidator } = require('../../middleware/validation');
const isLoggedIn = require('../../middleware/auth');

const router = express.Router();

// router.get('/', async (req, res) => {
//   try {
//   } catch (err) {
//     return res.status(500).send({ err: 'Server issue occured' });
//   }
// });

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
    SELECT * FROM collections
    WHERE user_id=${req.user.accountId}
    `);

    if (data.length === 0) {
      await con.end();
      res.status(500).send({ err: "You don't have any wines in your collection" });
    }

    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Server issue occured' });
  }
});

router.post('/', isLoggedIn, collectionValidator, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      SELECT quantity FROM collections
      WHERE wine_id = ${mysql.escape(req.body.wine_id)} and user_id=${req.user.accountId} LIMIT 1`);

    if (data.length === 0) {
      const [data2] = await con.execute(`
      INSERT INTO collections 
      (wine_id, user_id, quantity)
      VALUES (${mysql.escape(req.body.wine_id)},
      ${req.user.accountId},
      ${mysql.escape(req.body.quantity)});      
      `);
      await con.end();
      return res.send({ msg: 'Wine has been successfully added to your list' });
    }

    const updatedQuantity = req.body.quantity + data[0].quantity;

    if (updatedQuantity < 1) {
      const [data3] = await con.execute(`
      DELETE FROM collections
      WHERE wine_id = ${mysql.escape(req.body.wine_id)} and
      user_id=${req.user.accountId} 
      `);
      await con.end();
      return res.send({ msg: 'Wine quantity successfully changed' });
    }

    const [data4] = await con.execute(`
      UPDATE collections SET 
      quantity=${updatedQuantity} WHERE 
      wine_id = ${mysql.escape(req.body.wine_id)} and 
      user_id=${req.user.accountId} LIMIT 1
      `);
    await con.end();
    return res.send({ msg: 'Wine quantity successfully changed' });
  } catch (err) {
    return res.status(500).send({ err: 'Server issue occured' });
  }
});

module.exports = router;
