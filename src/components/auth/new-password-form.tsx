"use client";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import CardWrapper from "./card-wrapper";
import { FormSuccess } from "../form-success";
import { FormError } from "../form-error";
import { PasswordSchema, PasswordSchemaType } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = searchParams.get("token");

  const form = useForm<PasswordSchemaType>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data: PasswordSchemaType) => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const response = await axios.put(`/api/auth/new-password`, {
          password: data.password,
          token,
        });
        if (response.data.success) {
          setSuccess("Your password has been successfully reset.");
        } else {
          setError(response.data.error || "Reset failed. Please try again.");
        }
      } catch (error) {
        console.error(error);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return (
    <CardWrapper
      headerLabel="Reset your password"
      backButtonHref="/login"
      backButtonLabel="Back to login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="******"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" disabled={loading} className="w-full">
            Reset Password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default NewPasswordForm;
