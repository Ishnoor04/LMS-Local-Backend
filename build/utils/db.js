"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv").config();
const dbUrl = process.env.DB_URI || "";
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(dbUrl, { dbName: "Lms" }).then((data) => {
            console.log(`Database connected successfully to port ${process.env.PORT}`);
        });
    }
    catch (error) {
        console.log(error.message);
        setTimeout(exports.connectDB, 3000);
    }
};
exports.connectDB = connectDB;
