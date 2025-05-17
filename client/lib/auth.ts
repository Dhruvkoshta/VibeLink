import { db } from "@/db";
import { account, chatGroups, chatMessages, session, user, verification } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
 
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
      clientId:   process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!
    },
    google: { 
      prompt: "select_account", 
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }, 
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  plugins:[nextCookies()],
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
})