import { ConfirmedPatientStatus, ConfirmedTimeSlot } from "@prisma/client";

export const TIME_SLOT_INFO: Record<
  ConfirmedTimeSlot,
  { label: string; startTime: string; endTime: string; hours: string }
> = {
  SIANG_SORE: {
    label: "Siang/Sore",
    startTime: "14:30",
    endTime: "17:30",
    hours: "14.30 - 17.30 WIB",
  },
  MALAM: {
    label: "Malam",
    startTime: "19:30",
    endTime: "21:30",
    hours: "19.30 - 21.30 WIB",
  },
};

export const TIME_SLOT_ORDER: ConfirmedTimeSlot[] = ["SIANG_SORE", "MALAM"];

// 1-hour appointment windows within a slot, e.g. SIANG_SORE (14:30-17:30) ->
// ["14:00", "15:00", "16:00", "17:00"]. Approximate on purpose — the nurse
// picks a round hour as a rough window, not an exact-to-the-minute booking.
export function getAppointmentHourOptions(slot: ConfirmedTimeSlot): string[] {
  const { startTime, endTime } = TIME_SLOT_INFO[slot];
  const startHour = Number(startTime.split(":")[0]);
  const endHour = Number(endTime.split(":")[0]);
  const hours: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    hours.push(`${String(h).padStart(2, "0")}:00`);
  }
  return hours;
}

export function isValidAppointmentHour(slot: ConfirmedTimeSlot, appointmentTime: string) {
  return getAppointmentHourOptions(slot).includes(appointmentTime);
}

// "16:00" -> "16.00 - 16.59 WIB" (compact, for dropdowns/badges)
export function formatAppointmentWindow(appointmentTime: string): string {
  const hour = Number(appointmentTime.split(":")[0]);
  const start = `${String(hour).padStart(2, "0")}.00`;
  const end = `${String(hour).padStart(2, "0")}.59`;
  return `${start} - ${end} WIB`;
}

// "16:00" -> "Tindakan akan dilakukan sekitar rentang waktu 16.00 sampai 16.59."
export function formatAppointmentSentence(appointmentTime: string): string {
  const hour = Number(appointmentTime.split(":")[0]);
  const start = `${String(hour).padStart(2, "0")}.00`;
  const end = `${String(hour).padStart(2, "0")}.59`;
  return `Tindakan akan dilakukan sekitar rentang waktu ${start} sampai ${end}.`;
}

export const CONFIRMED_STATUS_LABEL: Record<ConfirmedPatientStatus, string> = {
  TERKONFIRMASI: "Terkonfirmasi",
  SELESAI: "Selesai",
  BATAL: "Batal",
  TIDAK_DATANG: "Tidak Datang",
};

export const CONFIRMED_STATUS_BADGE_CLASS: Record<ConfirmedPatientStatus, string> = {
  TERKONFIRMASI: "bg-secondary text-secondary-foreground",
  SELESAI: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  BATAL: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  TIDAK_DATANG:
    "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

export const CONFIRMED_STATUS_ORDER: ConfirmedPatientStatus[] = [
  "TERKONFIRMASI",
  "SELESAI",
  "BATAL",
  "TIDAK_DATANG",
];

// Statuses that still count as "expected to show up" for public display.
export const CONFIRMED_VISIBLE_STATUSES: ConfirmedPatientStatus[] = [
  "TERKONFIRMASI",
  "SELESAI",
];
