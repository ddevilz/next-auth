import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { generateVerificationToken, generateTwoFactorToken } from "@/lib/token";
import { getUserByEmail } from "@/data/user";
import {
  sendVerificationEmail,
  sendTwoFactorAuthenticationEmail,
} from "@/utils/resend";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import prisma from "@/lib/prisma";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const reqBody = await request.json();
  const { email, password, code } = reqBody;
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return new NextResponse(JSON.stringify({ error: "Login failed" }), {
      status: 500,
    });
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    return new NextResponse(
      JSON.stringify({ success: "Confirmation email sent!" }),
      { status: 200 }
    );
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return new NextResponse(
          JSON.stringify({ twoFactor: "Invalid code!" }),
          { status: 400 }
        );
      }

      if (twoFactorToken.token !== code) {
        return new NextResponse(
          JSON.stringify({ twoFactor: "Invalid code!" }),
          { status: 400 }
        );
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return new NextResponse(
          JSON.stringify({ twoFactor: "Code has been expired!" }),
          { status: 400 }
        );
      }

      await prisma.twoFactorToken.delete({
        where: {
          id: twoFactorToken.id,
        },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );

      if (existingConfirmation) {
        await prisma.twoFactorConfirmation.delete({
          where: {
            id: existingConfirmation.id,
          },
        });
      }

      await prisma.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorAuthenticationEmail(
        twoFactorToken.email,
        twoFactorToken.token
      );

      return new NextResponse(
        JSON.stringify({ twoFactor: "Two factor email sent!" }),
        { status: 200 }
      );
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return new NextResponse(
            JSON.stringify({ error: "Invalid credentials" })
          );
        default:
          return new NextResponse(
            JSON.stringify({ error: "Something went wrong" })
          );
      }
    }
  }

  return new NextResponse(
    JSON.stringify({ message: "Login successful!", success: true })
  );
}
