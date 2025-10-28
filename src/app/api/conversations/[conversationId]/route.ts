import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const renameSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(80),
});

async function ensureConversation(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });

  if (!conversation) {
    return null;
  }

  const latestMessage = await prisma.message.findFirst({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
  });

  return {
    id: conversation.id,
    title: conversation.title,
    updatedAt: conversation.updatedAt.toISOString(),
    lastMessage: latestMessage?.content ?? null,
  };
}

export async function PATCH(
  request: Request,
  context: { params: { conversationId: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversationId = context.params.conversationId;
  const existing = await ensureConversation(conversationId, userId);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let title: string;
  try {
    const body = await request.json();
    ({ title } = renameSchema.parse(body));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message ?? "Invalid title." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }

  const updated = await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      title,
      updatedAt: new Date(),
    },
  });

  const latestMessage = await prisma.message.findFirst({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    updatedAt: updated.updatedAt.toISOString(),
    lastMessage: latestMessage?.content ?? null,
  });
}

export async function DELETE(
  _request: Request,
  context: { params: { conversationId: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversationId = context.params.conversationId;

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.conversation.delete({
    where: { id: conversationId },
  });

  return NextResponse.json({ success: true });
}
