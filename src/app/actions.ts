"use server";

import { revalidatePath } from "next/cache";
import { Prisma, RegistrationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { registrationSchema, normalizePhone } from "@/lib/validation";
import { todayAsDate, isWithinTimeWindow, hasTimeWindowStarted } from "@/lib/date";

const INACTIVE_STATUSES: RegistrationStatus[] = ["BATAL", "TIDAK_DATANG"];

export type RegisterState = {
  status: "idle" | "success" | "error";
  message?: string;
  queueNumber?: number;
  registrationId?: string;
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registrationSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    complaint: formData.get("complaint"),
    consent: formData.get("consent"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Data tidak valid",
    };
  }

  const phone = normalizePhone(parsed.data.phone);
  const today = todayAsDate();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Single round-trip: fetch the session plus just the `status` column of
      // every registration (cheap, quota caps this at 500 rows) so both the
      // total and active counts can be derived in-process without a 2nd/3rd query.
      const session = await tx.dailySession.findFirst({
        where: { date: today, isOpen: true },
        select: {
          id: true,
          quota: true,
          startTime: true,
          endTime: true,
          registrations: { select: { status: true } },
        },
      });

      if (!session) {
        throw new Error("CLOSED");
      }

      if (!hasTimeWindowStarted(session.startTime)) {
        throw new Error("NOT_STARTED");
      }

      if (!isWithinTimeWindow(session.startTime, session.endTime)) {
        throw new Error("ENDED");
      }

      const totalCount = session.registrations.length;
      const activeCount = session.registrations.filter(
        (r) => !INACTIVE_STATUSES.includes(r.status)
      ).length;

      if (activeCount >= session.quota) {
        throw new Error("FULL");
      }

      const queueNumber = totalCount + 1;

      const registration = await tx.registration.create({
        data: {
          sessionId: session.id,
          queueNumber,
          name: parsed.data.name,
          phone,
          complaint: parsed.data.complaint || null,
        },
      });

      return registration;
    });

    revalidatePath("/");

    return {
      status: "success",
      queueNumber: result.queueNumber,
      registrationId: result.id,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        status: "error",
        message: "Nomor HP ini sudah terdaftar untuk hari ini",
      };
    }

    if (error instanceof Error && error.message === "CLOSED") {
      return {
        status: "error",
        message: "Pendaftaran hari ini sudah ditutup",
      };
    }

    if (error instanceof Error && error.message === "NOT_STARTED") {
      return {
        status: "error",
        message: "Pendaftaran belum dibuka, silakan coba lagi nanti",
      };
    }

    if (error instanceof Error && error.message === "ENDED") {
      return {
        status: "error",
        message: "Jam pendaftaran hari ini sudah berakhir",
      };
    }

    if (error instanceof Error && error.message === "FULL") {
      return {
        status: "error",
        message: "Kuota hari ini sudah penuh",
      };
    }

    return {
      status: "error",
      message: "Terjadi kesalahan, silakan coba lagi",
    };
  }
}
