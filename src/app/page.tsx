"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export default function Page() {
  const utils = api.useUtils();

  const [topic, setTopic] = useState("");

  const jokes = api.jokes.getAll.useQuery();

  const createJoke = api.jokes.create.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      setTopic("");
    },
  });

  const deleteJoke = api.jokes.delete.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  return (
    <div className="container flex max-w-2xl flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-4xl font-bold">Jokes App</h1>
      <div className="flex w-full gap-2">
        <input
          className="w-full border border-white bg-gray-800 p-2"
          type="text"
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button
          className="border border-white bg-green-800 p-2 hover:bg-green-600"
          onClick={() => createJoke.mutate({ topic: topic })}
        >
          Generate joke
        </button>
      </div>
      <h2 className="text-2xl">All jokes</h2>
      {jokes.isPending && <p>Loading jokes...</p>}
      {jokes.isError && <p>Error loading jokes: {jokes.error.message}</p>}
      {jokes.data?.length === 0 && (
        <p>No jokes found. Let&apos;s generate some!</p>
      )}
      {jokes.data?.map((joke) => (
        <div
          key={joke.id}
          className="flex w-full flex-col border border-black p-2"
        >
          <div className="flex w-full justify-between gap-2">
            <h2 className="text-2xl font-bold">{joke.topic}</h2>
            <button
              className="border border-white bg-red-800 p-2 hover:bg-red-600"
              onClick={() => deleteJoke.mutate({ id: joke.id })}
            >
              Delete
            </button>
          </div>
          <p className="text-lg">
            <strong>Joke:</strong> {joke.joke}
          </p>
          <p className="text-lg">
            <strong>Funny because:</strong>
            {joke.whyFunny}
          </p>
        </div>
      ))}
    </div>
  );
}
