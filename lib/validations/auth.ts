import { z } from "zod";

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email({ error: "Please enter a valid email address" }),
  password: z.string().min(8, { error: "Password must be at least 8 characters" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Sign up
// ---------------------------------------------------------------------------

export const signupSchema = z
  .object({
    email: z.string().email({ error: "Please enter a valid email address" }),
    password: z.string().min(8, { error: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
