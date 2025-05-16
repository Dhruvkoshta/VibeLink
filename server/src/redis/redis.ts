import {Redis} from "ioredis"
import { getEnv } from "../lib/getEnv"
let redis:Redis

if(getEnv("NODE_ENV") === "production") {
    if (getEnv("REDIS_URL")) {
        redis = new Redis(getEnv("REDIS_URL"))
    } else {
        throw new Error("REDIS_URL is not defined in production environment")
    }
}
else {
    redis = new Redis({
        host: "localhost",
        port: 6379
    })
}

export default redis
