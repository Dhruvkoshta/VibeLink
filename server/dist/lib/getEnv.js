"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = void 0;
const getEnv = (key) => {
    const env = process.env[key];
    if (!env) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return env;
};
exports.getEnv = getEnv;
