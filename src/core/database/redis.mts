import { Redis } from "@upstash/redis"

import { redisToken, redisUrl } from "./config.mts"

export const redis = new Redis({
  url: redisUrl,
  token: redisToken
})

