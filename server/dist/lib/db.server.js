"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serverless_1 = require("@neondatabase/serverless");
const neon_http_1 = require("drizzle-orm/neon-http");
const getEnv_1 = require("./getEnv");
const sql = (0, serverless_1.neon)((0, getEnv_1.getEnv)("DATABASE_URL"));
const db = (0, neon_http_1.drizzle)({ client: sql });
exports.default = db;
