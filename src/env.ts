import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    RESEND_KEY: z.string(),
    NOTIFICATION_EMAIL: z.email(),
  },
  runtimeEnv: {
    RESEND_KEY: process.env.RESEND_KEY,
    NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL,
  },
});
