import {z} from 'zod';

export const SignInSchema = z.object({
    email: z.string().email().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"),
    password: z.string(),
})

export type SignInSchemaType = z.infer<typeof SignInSchema>

export const SignUpSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    name:z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

export type SignUpSchemaType = z.infer<typeof SignUpSchema>


// File validation

export const analyzeResumeSchema = z.object({
  jobDescription: z.string().min(2, "Job description must be at least 2 characters"),
});