"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, ConfirmedPatientStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  confirmedPatientTimeSlotSchema,
  confirmedPatientManualSchema,
  normalizePhone,
} from "@/lib/validation";
import { parseDateParam } from "@/lib/date";
import { isValidAppointmentHour } from "@/lib/confirmed-patient";

export type ConfirmedPatientFormState = {
  error?: string;
};

async function requireOperator() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function addConfirmedPatientAction(
  dateParam: string,
  _prevState: ConfirmedPatientFormState,
  formData: FormData
): Promise<ConfirmedPatientFormState> {
  const operator = await requireOperator();
  const date = parseDateParam(dateParam);

  const slotParsed = confirmedPatientTimeSlotSchema.safeParse({
    timeSlot: formData.get("timeSlot"),
    appointmentTime: formData.get("appointmentTime"),
  });
  if (!slotParsed.success) {
    return { error: slotParsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  if (!isValidAppointmentHour(slotParsed.data.timeSlot, slotParsed.data.appointmentTime)) {
    return { error: "Jam tindakan tidak sesuai dengan sesi waktu yang dipilih" };
  }

  const sourceRegistrationId = formData.get("sourceRegistrationId");
  let name: string;
  let phone: string;
  let complaint: string | null;

  if (typeof sourceRegistrationId === "string" && sourceRegistrationId !== "") {
    const registration = await prisma.registration.findUnique({
      where: { id: sourceRegistrationId },
    });

    if (!registration) {
      return { error: "Pasien yang dipilih tidak ditemukan" };
    }

    name = registration.name;
    phone = registration.phone;
    complaint = registration.complaint;
  } else {
    const manualParsed = confirmedPatientManualSchema.safeParse({
      name: formData.get("name"),
      phone: formData.get("phone"),
      complaint: formData.get("complaint"),
    });

    if (!manualParsed.success) {
      return { error: manualParsed.error.issues[0]?.message ?? "Data tidak valid" };
    }

    name = manualParsed.data.name;
    phone = normalizePhone(manualParsed.data.phone);
    complaint = manualParsed.data.complaint || null;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const count = await tx.confirmedPatient.count({
        where: { operatorId: operator.operatorId, date },
      });

      await tx.confirmedPatient.create({
        data: {
          operatorId: operator.operatorId,
          date,
          promoLabel: `Pasien Promo ${count + 1}`,
          timeSlot: slotParsed.data.timeSlot,
          appointmentTime: slotParsed.data.appointmentTime,
          name,
          phone,
          complaint,
          sourceRegistrationId:
            typeof sourceRegistrationId === "string" && sourceRegistrationId !== ""
              ? sourceRegistrationId
              : null,
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Pasien ini sudah dijadwalkan sebelumnya" };
    }
    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath("/");
  return {};
}

export async function updateConfirmedPatientStatusAction(
  id: string,
  status: ConfirmedPatientStatus
) {
  await requireOperator();

  await prisma.confirmedPatient.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/dashboard");
  revalidatePath("/");
}
