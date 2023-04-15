import Joi from "joi";

export const createTodoSchema = Joi.object({
    message: Joi.string().required(),
});

export const updateTodoSchema = Joi.object({
    message: Joi.string(),
    completed: Joi.boolean()
});

