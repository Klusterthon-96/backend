export const PORT = process.env.PORT;
export const HTTP = process.env.HTTP_PORT;
export const MONGO_URL = process.env.MONGODB_URI;
export const MONGODB_URI_DEV = process.env.MONGODB_URI_DEV;
export const BCRYPT_SALT = process.env.BCRYPT_SALT;
export const APP_NAME = "klusterthon-96";
export const JWT_SECRET = process.env.JWT_SECRET;

export const ROLE = {
    ADMIN: ["admin"],
    USER: ["user", "admin"]
};

export const URL = {
    CLIENT_URL: process.env.CLIENT_URL,
    ML_URL: process.env.ML_URL
};
export const MAILER = {
    USER: process.env.MAILER_USER,
    PORT: process.env.MAILER_PORT,
    SECURE: process.env.MAILER_SECURE,
    PASSWORD: process.env.MAILER_PASSWORD,
    HOST: process.env.MAILER_HOST
};

export const CLOUDINARY = {
    APIKEY: process.env.CLOUDINARY_APIKEY,
    SECRET: process.env.CLOUDINARY_SECRET,
    NAME: process.env.CLOUDINARY_NAME
};
