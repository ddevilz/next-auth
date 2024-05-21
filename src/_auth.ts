import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "./schemas";
import { getUserByEmail } from "./data/user";

import bcrypt from "bcryptjs";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await LoginSchema.parseAsync(credentials);

          const existingUser = await getUserByEmail(email);

          if (!existingUser) {
            throw new Error("Invalid credentials");
          }

          if (existingUser?.password) {
            const passwordMatch = bcrypt.compare(
              password,
              existingUser.password
            );
            if (!passwordMatch) {
              throw new Error("Invalid credentials");
            }
          } else {
            throw new Error("Invalid credentials");
          }

          return existingUser;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      return session;
    },
    async jwt({ token, user, session }) {
      console.log("token", token);
      console.log("user", user);
      console.log("session", session);
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
});
