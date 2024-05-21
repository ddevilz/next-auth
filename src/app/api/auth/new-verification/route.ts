"use server";

import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  try {
    if (!token) {
      return NextResponse.json({
        error: "Token not found",
        status: 500,
      });
    }
    const expistingToken = await getVerificationTokenByToken(token);

    if (!expistingToken) {
      return NextResponse.json({
        error: "Token does not exist",
        status: 400,
      });
    }

    const hasExpired = new Date(expistingToken.expires) < new Date();

    if (hasExpired) {
      return NextResponse.json({
        error: "Token has been expired",
        status: 400,
      });
    }

    const existingUser = await getUserByEmail(expistingToken.email);

    if (!existingUser) {
      return NextResponse.json({
        error: "Email does not exist",
        status: 400,
      });
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
        email: existingUser.email,
      },
    });

    await prisma.verificationToken.delete({
      where: { id: expistingToken.id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Internal Server Error",
      status: 500,
    });
  }
}
