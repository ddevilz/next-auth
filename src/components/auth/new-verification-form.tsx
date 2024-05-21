"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import CardWrapper from "./card-wrapper";
import { FormSuccess } from "../form-success";
import { FormError } from "../form-error";
import { CheckCircleIcon, LoaderCircle } from "lucide-react";

const NewVerificationForm = () => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = searchParams.get("token");

  const onSubmit = useCallback(async () => {
    try {
      const response = await axios.get("/api/auth/new-verification", {
        params: { token },
      });
      if (response.data.success) {
        setSuccess("Your email has been successfully verified.");
      } else {
        setError(
          response.data.error || "Verification failed. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonHref="/login"
      backButtonLabel="Back to login"
    >
      <div className="flex items-center w-full justify-center">
        {loading ? <LoaderCircle /> : <CheckCircleIcon />}
        <FormError message={error} />
        <FormSuccess message={success} />
      </div>
    </CardWrapper>
  );
};

export default NewVerificationForm;
