import OpenAISDK from "openai";
import { env } from "~/env";

export const OpenAI = new OpenAISDK({
  organization: env.OPENAI_ORG,
  project: env.OPENAI_PROJECT_ID,
  apiKey: env.OPENAI_API_KEY,
});
