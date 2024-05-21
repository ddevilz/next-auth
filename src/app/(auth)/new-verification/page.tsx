import NewVerificationForm from "@/components/auth/new-verification-form";
import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";

const NewVerification = () => {
  return (
    <Suspense fallback={<LoaderCircle />}>
      <NewVerificationForm />
    </Suspense>
  );
};

export default NewVerification;
