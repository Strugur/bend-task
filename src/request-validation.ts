import Joi from "joi";

export const createUserValidationSchema = Joi.object({
    type: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

export const registerUserValidationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});



export const loginValidationSchema = Joi.object({
    // name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

export const createPostValidationSchema = Joi.object({
    title: Joi.string().max(50).required(), 
    content: Joi.string().required(),
    isHidden: Joi.boolean().required(),
    authorId: Joi.number().required()
});

export const togglePostStatusValidationSchema = Joi.object({
    postId: Joi.number().required(),
    isHidden: Joi.boolean().required()
});

export const updatePostValidationSchema = Joi.object({
    postId: Joi.number().required(),
    title: Joi.string().max(50).required(), 
    content: Joi.string().required(),
    isHidden: Joi.boolean().required()
});

export const removePostValidationSchema = Joi.object({
    postId: Joi.number().required(),
});

