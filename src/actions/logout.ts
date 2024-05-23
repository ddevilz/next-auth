"use server";

import { signOut } from "@/auth";

export const logout = async () => {
  // can do some cleaning here
  await signOut();
};
