import * as z from "zod";
import { RegisterSchema, RegisterSchemaType } from "@/schemas";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/utils/resend";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { name, email, password }: RegisterSchemaType = reqBody;
    const validatedFields = RegisterSchema.safeParse({ name, email, password });
    console.log("hey", validatedFields);

    if (!validatedFields.success) {
      return NextResponse.json({
        error: "Register failed",
        status: 500,
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const existingEmail = await getUserByEmail(email);

    if (existingEmail) {
      return NextResponse.json({
        error: "Email exists!",
        status: 400,
      });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: encryptedPassword,
      },
    });

    const verificationToken = await generateVerificationToken(email);

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return NextResponse.json({
      message: "Confirmation email sent!",
      success: true,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Register failed",
      status: 500,
    });
  }
}
