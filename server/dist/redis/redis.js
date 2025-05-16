"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = require("ioredis");
const getEnv_1 = require("../lib/getEnv");
let redis;
if ((0, getEnv_1.getEnv)("NODE_ENV") === "production") {
    if ((0, getEnv_1.getEnv)("REDIS_URL")) {
        redis = new ioredis_1.Redis((0, getEnv_1.getEnv)("REDIS_URL"));
    }
    else {
        throw new Error("REDIS_URL is not defined in production environment");
    }
}
else {
    redis = new ioredis_1.Redis({
        host: "localhost",
        port: 6379
    });
}
exports.default = redis;
