import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = String(process.env.JWT_SECRET);
export const PORT = Number(process.env.PORT);
