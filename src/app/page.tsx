import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import LoginButton from "../components/auth/login-button";
import { poppins } from "@/utils/fonts";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      <div className="space-y-6 text-center">
        <h1
          className={cn(
            "text-6xl font-semibold text-white drop-shadow-md",
            poppins.className
          )}
        >
          Auth
        </h1>
        <div>
          <LoginButton>
            <Button variant={"secondary"} size={"lg"}>
              Sign in
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
