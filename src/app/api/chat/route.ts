import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

const payloadSchema = z.object({
  conversationId: z.string().min(1, "conversationId is required"),
  prompt: z.string().min(1, "prompt is required"),
  history: z
    .array(
      z.object({
        role: z.string(),
        content: z.string(),
      }),
    )
    .optional()
    .default([]),
});

async function streamGemini({
  conversationId,
  prompt,
  history,
  userId,
  enqueue,
  encoder,
}: {
  conversationId: string;
  prompt: string;
  history: { role: string; content: string }[];
  userId: string;
  enqueue: (chunk: Uint8Array) => Promise<void> | void;
  encoder: TextEncoder;
}) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  const contentHistory = history.map((entry) =>
    `${entry.role === "user" ? "user" : "assistant"}: ${entry.content}`,
  );

  const lastEntry = history.at(-1);
  if (!lastEntry || lastEntry.role !== "user" || lastEntry.content !== prompt) {
    contentHistory.push(`user: ${prompt}`);
  }

  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash-lite",
    contents: contentHistory,
  });

  let assistantText = "";
  for await (const chunk of stream) {
    const text = chunk.text ?? "";
    if (!text) continue;
    assistantText += text;
    await enqueue(encoder.encode(text));
  }

  await prisma.message.create({
    data: { conversationId, role: "assistant", content: assistantText },
  });

  await prisma.conversation.update({
    where: { id: conversationId, userId },
    data: {
      updatedAt: new Date(),
      ...(assistantText && assistantText.trim()
        ? { title: assistantText.slice(0, 60).trim() }
        : {}),
    },
  });
}

async function streamOpenAI({
  conversationId,
  prompt,
  history,
  userId,
  enqueue,
  encoder,
}: {
  conversationId: string;
  prompt: string;
  history: { role: string; content: string }[];
  userId: string;
  enqueue: (chunk: Uint8Array) => Promise<void> | void;
  encoder: TextEncoder;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({ apiKey });

  const response = openai.responses.stream({
    model: "gpt-4o-mini",
    input: [
      ...history.map((entry) => ({
        role: entry.role === "user" ? "user" : "assistant",
        content: entry.content,
      })),
      { role: "user", content: prompt },
    ],
  });

  let assistantText = "";

  for await (const event of response) {
    if (event.type === "response.output_text.delta") {
      const text = event.delta ?? "";
      if (!text) continue;
      assistantText += text;
      await enqueue(encoder.encode(text));
    }
  }

  await prisma.message.create({
    data: { conversationId, role: "assistant", content: assistantText },
  });

  await prisma.conversation.update({
    where: { id: conversationId, userId },
    data: {
      updatedAt: new Date(),
      ...(assistantText && assistantText.trim()
        ? { title: assistantText.slice(0, 60).trim() }
        : {}),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const parsed = payloadSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(parsed.error.errors[0]?.message ?? "Invalid payload", {
        status: 400,
      });
    }

    const { conversationId, prompt, history } = parsed.data;

    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      return new Response("Conversation not found.", { status: 404 });
    }

    await prisma.message.create({
      data: { conversationId, role: "user", content: prompt },
    });

    const encoder = new TextEncoder();
    let controller: ReadableStreamDefaultController<Uint8Array> | null = null;

    const readable = new ReadableStream<Uint8Array>({
      async start(ctrl) {
        controller = ctrl;
        const enqueue = (chunk: Uint8Array) => ctrl.enqueue(chunk);
        try {
          await streamGemini({
            conversationId,
            prompt,
            history,
            userId,
            enqueue,
            encoder,
          });
        } catch (geminiError) {
          console.error("Gemini failed, falling back to OpenAI:", geminiError);
          try {
            await streamOpenAI({
              conversationId,
              prompt,
              history,
              userId,
              enqueue,
              encoder,
            });
          } catch (openAiError) {
            console.error("OpenAI fallback failed:", openAiError);
            ctrl.error(openAiError);
            return;
          }
        }
        ctrl.close();
      },
      cancel() {
        controller = null;
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat generation error", error);
    return new Response("Failed to generate response.", { status: 500 });
  }
}
