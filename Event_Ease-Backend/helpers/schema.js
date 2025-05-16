const Joi = require("joi")

const paramsSchema = Joi.object({
  id: Joi.number().integer().min(0).required(),
})

module.exports = {
  paramsSchema,
}
