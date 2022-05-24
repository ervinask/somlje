const Joi = require('joi');

const registrationSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const changepasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
});

const winesSchema = Joi.object({
  title: Joi.string().required(),
  region: Joi.string().required(),
  years: Joi.number().required(),
});

module.exports = {
  registrationSchema,
  loginSchema,
  changepasswordSchema,
  winesSchema,
};
