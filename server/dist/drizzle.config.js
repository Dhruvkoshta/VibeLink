"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const drizzle_kit_1 = require("drizzle-kit");
const getEnv_1 = require("./lib/getEnv");
exports.default = (0, drizzle_kit_1.defineConfig)({
    out: './drizzle',
    schema: './db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: (0, getEnv_1.getEnv)("DATABASE_URL"),
    },
});
