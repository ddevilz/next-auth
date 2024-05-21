import NewPasswordForm from "@/components/auth/new-password-form";
import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";

const NewPassword = () => {
  return (
    <Suspense fallback={<LoaderCircle className="animate-spin" />}>
      <NewPasswordForm />
    </Suspense>
  );
};

export default NewPassword;
