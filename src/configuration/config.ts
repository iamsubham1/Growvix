import * as dotenv from 'dotenv';
dotenv.config();

export const jwtPayload = {
    userId: process.env.JWT_PAYLOAD_USER_ID || '_id',
    email: process.env.JWT_PAYLOAD_USER_EMAIL || 'email',
    role: process.env.JWT_PAYLOAD_USER_ROLE || 'role',
};

export const jwtSignIN = {
    secret: process.env.JWT_SECRET || 'MornE+gQro7CCL15zvtpeUN/MoO5JP5KU/',
    expiresIn: process.env.JWT_EXPIRE || '30d',
};
