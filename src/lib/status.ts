import { RegistrationStatus } from "@prisma/client";

export const STATUS_LABEL: Record<RegistrationStatus, string> = {
  MENUNGGU: "Menunggu",
  DIHUBUNGI: "Dihubungi",
  DIKONFIRMASI: "Dikonfirmasi",
  SELESAI: "Selesai",
  BATAL: "Batal",
  TIDAK_DATANG: "Tidak Datang",
};

export const STATUS_BADGE_CLASS: Record<RegistrationStatus, string> = {
  MENUNGGU: "bg-muted text-muted-foreground",
  DIHUBUNGI: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  DIKONFIRMASI:
    "bg-secondary text-secondary-foreground",
  SELESAI:
    "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  BATAL: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  TIDAK_DATANG:
    "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

export const STATUS_ORDER: RegistrationStatus[] = [
  "MENUNGGU",
  "DIHUBUNGI",
  "DIKONFIRMASI",
  "SELESAI",
  "BATAL",
  "TIDAK_DATANG",
];
