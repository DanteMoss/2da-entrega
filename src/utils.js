import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";
import { config } from "dotenv";

config();

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);
export const MONGO_URI = process.env.MONGO_URI;
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME;

export const PORT = 8080;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${__dirname}/public/img`);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
export const uploader = multer({ storage });