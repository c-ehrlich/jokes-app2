import { generateObject } from "ai";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { OpenAI } from "~/server/openai/openai";

function getJokePrompt(topic: string) {
  return `Please write a joke about the following person or topic: ${topic}.
Use your knowledge of ${topic} and the world to make the joke relevant and funny.

Respond in the following format, which should be json parseable:
{
  "joke": "<the joke>",
  "whyFunny": "<why the joke is funny>"
}`;
}

const jokeSchema = z.object({
  joke: z.string(),
  whyFunny: z.string(),
});

export const jokesRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ topic: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const res = await generateObject({
        model: OpenAI("gpt-4o-2024-08-06"),
        prompt: getJokePrompt(input.topic),
        schema: jokeSchema,
      });

      await ctx.db.joke.create({
        data: {
          topic: input.topic,
          ...res.object,
        },
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const jokes = await ctx.db.joke.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return jokes;
  }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.joke.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
