import { z } from "zod";

const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

export const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama terlalu panjang"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Format nomor HP/WA tidak valid, contoh: 081234567890"),
  complaint: z
    .string()
    .trim()
    .max(500, "Keluhan terlalu panjang")
    .optional()
    .or(z.literal("")),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const sessionSettingsSchema = z
  .object({
    quota: z.coerce.number().int().min(1, "Kuota minimal 1").max(500, "Kuota maksimal 500"),
    startTime: z.string().regex(timeRegex, "Format jam mulai tidak valid"),
    endTime: z.string().regex(timeRegex, "Format jam selesai tidak valid"),
    promoText: z.string().trim().max(300, "Teks promo terlalu panjang").optional().or(z.literal("")),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Jam selesai harus lebih besar dari jam mulai",
    path: ["endTime"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export function normalizePhone(phone: string) {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+62")) return "0" + trimmed.slice(3);
  if (trimmed.startsWith("62")) return "0" + trimmed.slice(2);
  return trimmed;
}
