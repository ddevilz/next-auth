"use client";
import React, { useState } from "react";
// import { Formik, Field, Form, FormikHelpers } from "formik";
import { zodResolver } from "@hookform/resolvers/zod";
import CardWrapper from "./card-wrapper";
import { RegisterSchema, RegisterSchemaType } from "@/schemas";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { validate } from "@/utils/validation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import axios from "axios";

export const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  // const initialValues: LoginSchemaType = {
  //   email: "",
  //   password: "",
  // };

  // const handleSubmit = (
  //   values: LoginSchemaType,
  //   { setSubmitting }: FormikHelpers<LoginSchemaType>
  // ) => {
  //   console.log(values);
  //   setSubmitting(false);
  // };

  const form = useForm<RegisterSchemaType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterSchemaType) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/api/auth/register", values);
      setSuccess("Email sent");
      return response.data;
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardWrapper
      headerLabel="Create an account"
      backButtonLabel="Already have a account?"
      backButtonHref="/login"
      showSocial
    >
      {/* <Formik
        initialValues={initialValues}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form>
            <div>
              <Field as={Input} name="email" placeholder="Email" />
              {errors.email && touched.email && <div>{errors.email}</div>}
            </div>

            <div>
              <Field
                as={Input}
                name="password"
                type="password"
                placeholder="Password"
              />
              {errors.password && touched.password && (
                <div>{errors.password}</div>
              )}
            </div>

            <Button type="submit">Submit</Button>
          </Form>
        )}
      </Formik> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="Devashish Jadhav"
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="example@gmail.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={loading}
                      placeholder="*******"
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
            Sign up
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
