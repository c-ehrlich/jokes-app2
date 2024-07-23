import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { OpenAI } from "~/server/openai/openai";

function getJokePrompt(topic: string, makeJsonParseable: boolean) {
  return `please write a joke about the following person or topic: ${topic}. use your knowledge of ${topic} and the world to make the joke relevant and funny.
${
  makeJsonParseable
    ? `
respond in the following format, which should be json parseable:

\`\`\`json
{
  "joke": "<the joke>",
  "whyFunny": "<why the joke is funny>"
}
\`\`\``
    : ""
}
`;
}

const jokeSchema = z.object({
  joke: z.string(),
  whyFunny: z.string(),
});
type JokeSchema = z.infer<typeof jokeSchema>;

export const jokesRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ topic: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // TODO: use openai to generate a joke
      const completion = await OpenAI.chat.completions.create({
        model: "gpt-4o-mini-2024-07-18",
        messages: [
          {
            role: "user",
            content: getJokePrompt(input.topic, true),
          },
        ],
      });

      const res = completion.choices[0]?.message.content;

      if (!res) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "OpenAI API returned no response",
        });
      }

      let parsed: JokeSchema;
      try {
        const extractedJson =
          (res.match(/\{[\s\S]*\}/) ?? [])[0] ?? "undefined";
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const jsonParsed = JSON.parse(extractedJson);
        parsed = jokeSchema.parse(jsonParsed);
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "OpenAI API returned invalid response",
        });
      }

      await ctx.db.joke.create({
        data: {
          topic: input.topic,
          ...parsed,
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
