import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getEnv = (key: string) => {
  const env = process.env[key]
  if (!env) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return env
}