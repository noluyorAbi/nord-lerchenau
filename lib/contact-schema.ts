import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Bitte Namen angeben").max(100),
  email: z.string().email("Gültige E-Mail bitte"),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, "Bitte etwas ausführlicher").max(5000),
  // Honeypot — must be empty; bots usually fill it.
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
