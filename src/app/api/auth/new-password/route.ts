import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";

const PasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 8 characters long"),
  token: z.string(),
});

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const reqBody = await request.json();
    const parsedBody = PasswordSchema.safeParse(reqBody);

    if (!parsedBody.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid input",
          details: parsedBody.error.errors,
        }),
        { status: 400 }
      );
    }

    const { password, token } = parsedBody.data;

    const passwordResetToken = await getPasswordResetTokenByToken(token);
    if (!passwordResetToken) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 400 }
      );
    }

    const hasExpired = new Date(passwordResetToken.expires) < new Date();
    if (hasExpired) {
      return new NextResponse(JSON.stringify({ error: "Token has expired" }), {
        status: 400,
      });
    }

    const user = await getUserByEmail(passwordResetToken.email);

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: user.email },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({
      where: { id: passwordResetToken.id },
    });

    return new NextResponse(
      JSON.stringify({
        message: "Password updated successfully",
        success: true,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating password:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
