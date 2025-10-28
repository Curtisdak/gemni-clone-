import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(60),
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
      .max(72, "Le mot de passe est trop long."),
  })
  .strict();

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { name, email, password } = registerSchema.parse(json);

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 400 },
      );
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message ?? "Données invalides." },
        { status: 400 },
      );
    }

    console.error("Registration error", error);
    return NextResponse.json(
      { error: "Impossible de créer le compte. Réessayez plus tard." },
      { status: 500 },
    );
  }
}
