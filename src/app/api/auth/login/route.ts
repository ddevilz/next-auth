import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { generateVerificationToken } from "@/lib/token";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/utils/resend";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const reqBody = await request.json();
  const { email, password } = reqBody;
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
    JSON.stringify({ message: "Login successful", success: true })
  );
}
