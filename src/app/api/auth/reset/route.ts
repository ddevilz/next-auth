import { getUserByEmail } from "@/data/user";
import { generatePasswordResetToken } from "@/lib/token";
import { ResetSchema, ResetSchemaType } from "@/schemas";
import { sendPasswordResetEmail } from "@/utils/resend";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

export async function POST(request: NextRequest) {
  const reqBody = await request.json();
  const { email }: ResetSchemaType = reqBody;
  const validatedFields = ResetSchema.safeParse({ email });

  if (!validatedFields.success) {
    return NextResponse.json({
      error: "Invalid fields",
      status: 400,
    });
  }

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return NextResponse.json({
      error: "User not found",
      status: 400,
    });
  }

  const passwordResetToken = await generatePasswordResetToken(email);

  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return NextResponse.json({
    success: "Reset email sent!",
    status: 200,
  });
}
