import * as Joi from '@hapi/joi';
import { msg } from '../helper/messages';

export const RegisterUserValidate: Joi.ObjectSchema = Joi.object().keys({
    name: Joi.string().min(3),
    email: Joi.string().email({ minDomainSegments: 2 }),
    phoneNumber: Joi.number().integer().min(1000000000).max(9999999999),
    password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')).message(msg.user.passwordError),
    businessName: Joi.string().min(3),
    businessCategory: Joi.string().min(3),
    instagramLink: Joi.string().uri(),
    facebookLink: Joi.string().uri(),
    youtubeLink: Joi.string().uri(),
    subscription: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    longitude: Joi.number().min(-180).max(180), // Add longitude validation
    latitude: Joi.number().min(-90).max(90), // Add latitude validation
});

export const RegisterEmailPassValidate: Joi.ObjectSchema = Joi.object().keys({
    name: Joi.string().min(3),
    email: Joi.string().email({ minDomainSegments: 2 }),
    password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$')),
    businessName: Joi.string().min(3),
    role: Joi.string().min(3).required(),
});

export const EmailPassValidate: Joi.ObjectSchema = Joi.object().keys({
    email: Joi.string().email({ minDomainSegments: 2 }),
    password: Joi.string(),
});

export const EmailorNumberPassValidate: Joi.ObjectSchema = Joi.object().keys({
    emailOrPhoneNumber: Joi.string().required(),
    password: Joi.string(),
});

export const UpdatePassValidate: Joi.ObjectSchema = Joi.object().keys({
    oldPassword: Joi.string(),
    newPassword: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z]).{8,}$')).message(msg.user.newPasswordError),
});
