import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Bitte Namen angeben").max(100),
  email: z.string().email("Gültige E-Mail bitte"),
  phone: z.string().min(5, "Bitte Telefon angeben").max(40),
  address: z.string().min(5, "Bitte Adresse angeben").max(300),
  subject: z.string().min(3, "Bitte Betreff angeben").max(200),
  message: z.string().min(10, "Bitte etwas ausführlicher").max(5000),
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
