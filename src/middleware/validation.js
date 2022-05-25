const {
  registrationSchema,
  loginSchema,
  changepasswordSchema,
  winesSchema,
  collectionSchema,
} = require('../schemas/schemas');

const validator = async (req, res, next, schema) => {
  try {
    req.body = await schema.validateAsync(req.body);
    return next();
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err: 'Incorrect data sent ' });
  }
};

module.exports = {
  registrationValidator: (req, res, next) => validator(req, res, next, registrationSchema),
  loginValidator: (req, res, next) => validator(req, res, next, loginSchema),
  changepasswordValidator: (req, res, next) => validator(req, res, next, changepasswordSchema),
  winesValidator: (req, res, next) => validator(req, res, next, winesSchema),
  collectionValidator: (req, res, next) => validator(req, res, next, collectionSchema),
};
