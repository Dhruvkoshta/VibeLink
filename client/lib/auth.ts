import { db } from "@/db";
import { account, chatGroups, chatMessages, session, user, verification } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getEnv } from "./utils";
 
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: user,
      chatGroups:chatGroups,
      chatMessages: chatMessages,
      account: account,
      verification: verification,
      session: session,
    }
  }),
  
  socialProviders: {
    github: {
      clientId: getEnv("AUTH_GITHUB_ID"),
      clientSecret: getEnv("AUTH_GITHUB_SECRET")
    },
    google: { 
      prompt: "select_account", 
      clientId: getEnv("GOOGLE_CLIENT_ID"), 
      clientSecret: getEnv("GOOGLE_CLIENT_SECRET"), 
  }, 
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  plugins:[nextCookies()],
  baseURL: getEnv("BASE_URL") || "http://localhost:3000",
})