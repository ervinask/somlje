const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { mysqlConfig, jwtSecret } = require('../../config');
const { registrationValidator, loginValidator, changepasswordValidator } = require('../../middleware/validation');
const isLoggedIn = require('../../middleware/auth');

const router = express.Router();

router.post('/register', registrationValidator, async (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
    INSERT INTO user (name, email, password)
    VALUES (${mysql.escape(req.body.name)},
    ${mysql.escape(req.body.email)},
    '${hashedPassword}')
    `);

    await con.end();

    if (!data.insertId || data.affectedRows !== 1) {
      console.log(data);
      return res.status(500).send({ err: 'Server issue occured' });
    }

    return res.send({
      msg: 'Account was successfully created',
      accountId: data.insertId,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'Server issue occured' });
  }
});

router.post('/login', loginValidator, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      SELECT id, email, password
      FROM user 
      WHERE email = ${mysql.escape(req.body.email)} LIMIT 1`);
    await con.end();

    console.log(data);

    if (data.length === 0) {
      return res.status(404).send({ err: 'User not found' });
    }

    if (!bcrypt.compareSync(req.body.password, data[0].password)) {
      return res.status(404).send({ err: `Email or password is incorrect` });
    }

    const token = jwt.sign({ accountId: data[0].id }, jwtSecret);
    console.log('User token:', token);

    return res.send({
      msg: 'User successfully logged in',
      token: token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'A server issue occured' });
  }
});

router.post('/changepassword', isLoggedIn, changepasswordValidator, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
    SELECT id, email, password
    FROM user
    WHERE email = ${mysql.escape(req.body.email)} LIMIT 1`);

    const passwordCheck = bcrypt.compareSync(req.body.oldPassword, data[0].password);

    if (!passwordCheck) {
      await con.end();
      return res.status(404).send({ err: 'Incorrect password' });
    }

    const newPasswordHash = bcrypt.hashSync(req.body.newPassword, 10);

    const changePass = await con.execute(
      `UPDATE users SET password=${mysql.escape(newPasswordHash)} WHERE email = ${mysql.escape(req.body.email)}`
    );

    await con.end();
    return res.send({ msg: 'Password has been changed' });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'A server issue occured' });
  }
});

module.exports = router;
