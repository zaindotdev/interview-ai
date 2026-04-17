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

export const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .email("Please enter a valid email")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"),
  subject: z.string().min(4, "Subject must be at least 4 characters").max(120, "Subject is too long"),
  message: z.string().min(20, "Message must be at least 20 characters").max(2000, "Message is too long"),
});

export type ContactSchemaType = z.infer<typeof ContactSchema>;