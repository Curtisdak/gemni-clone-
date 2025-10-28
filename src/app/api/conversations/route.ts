import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json({
    conversations: conversations.map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      lastMessage: conversation.messages[0]?.content ?? null,
      updatedAt: conversation.updatedAt.toISOString(),
    })),
  });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversation = await prisma.conversation.create({
    data: {
      userId,
      title: "New chat",
    },
  });

  return NextResponse.json({
    id: conversation.id,
    title: conversation.title,
    lastMessage: null,
    updatedAt: conversation.updatedAt.toISOString(),
  });
}
