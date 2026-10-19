import { z } from "zod";

export const evaluateSchema = z.object({
  roomId: z.string().min(1),
  topic: z.string().min(5).max(200),
  transcript: z.string().min(10).max(20000),
  userId: z.string().min(1)
});

export const summarySchema = z.object({
  topic: z.string().min(5).max(200),
  transcript: z.string().min(10).max(30000)
});

export const topicSchema = z.object({
  category: z.string().min(2).max(80).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional()
});

export const mentorSchema = z.object({
  message: z.string().min(1).max(3000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "model"]),
        text: z.string().max(3000)
      })
    )
    .max(10)
    .optional()
});
