import { cn } from "@/lib/utils";
import { poppins } from "@/utils/fonts";

interface HeaderProps {
  label: string;
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <h1 className={cn("text-4xl font-semibold", poppins.className)}>
        Next-Auth
      </h1>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
};
