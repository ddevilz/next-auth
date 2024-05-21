import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const PasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
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

    // Verify the token
    const verificationToken = await getVerificationTokenByToken(token);
    if (!verificationToken) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 400 }
      );
    }

    const hasExpired = new Date(verificationToken.expires) < new Date();
    if (hasExpired) {
      return new NextResponse(JSON.stringify({ error: "Token has expired" }), {
        status: 400,
      });
    }

    // Get the user associated with the token
    const user = await getUserByEmail(verificationToken.email);
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    await prisma.user.update({
      where: { email: user.email },
      data: { password: hashedPassword },
    });

    // Optionally, delete the token after use
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
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
