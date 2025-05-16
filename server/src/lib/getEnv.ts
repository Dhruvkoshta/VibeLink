export const getEnv = (key: string) => {
  const env = process.env[key]
  if (!env) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return env
}