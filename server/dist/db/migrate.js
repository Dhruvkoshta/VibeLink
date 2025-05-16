"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const neon_http_1 = require("drizzle-orm/neon-http");
const migrator_1 = require("drizzle-orm/neon-http/migrator");
const serverless_1 = require("@neondatabase/serverless");
require("dotenv/config");
const getEnv_1 = require("../lib/getEnv");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = (0, serverless_1.neon)((0, getEnv_1.getEnv)("DATABASE_URL"));
        const db = (0, neon_http_1.drizzle)(sql);
        console.log('Running migrations...');
        yield (0, migrator_1.migrate)(db, { migrationsFolder: 'drizzle' });
        console.log('Migrations completed!');
        process.exit(0);
    });
}
main().catch((err) => {
    console.error('Migration failed!');
    console.error(err);
    process.exit(1);
});
