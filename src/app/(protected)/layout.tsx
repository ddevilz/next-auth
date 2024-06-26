import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import Navbar from "./_component/navbar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout = async ({ children }: ProtectedLayoutProps) => {
  const session = await auth();
  return (
    <div className="h-full w-full flex flex-col gap-y-10 items-center justify-center">
      <SessionProvider session={session}>
        <Navbar />
        {children}
      </SessionProvider>
    </div>
  );
};
