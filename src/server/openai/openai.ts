import { createOpenAI } from "@ai-sdk/openai";
import { env } from "~/env";

export const OpenAI = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
  project: env.OPENAI_PROJECT_ID,
  organization: env.OPENAI_ORG,
});
