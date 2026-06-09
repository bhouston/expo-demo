import { z } from "zod";

export const todoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  createdAt: z.number(),
});

export const todoListSchema = z.array(todoSchema);

export const todoFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer"),
});

export type Todo = z.infer<typeof todoSchema>;
export type TodoFormValues = z.infer<typeof todoFormSchema>;
