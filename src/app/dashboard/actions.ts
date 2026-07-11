"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, destroySession } from "@/lib/session";
import { sessionSettingsSchema } from "@/lib/validation";
import { parseDateParam } from "@/lib/date";
import { RegistrationStatus } from "@prisma/client";

export type SessionFormState = {
  error?: string;
};

async function requireOperator() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function openSessionForDateAction(
  dateParam: string,
  _prevState: SessionFormState,
  formData: FormData
): Promise<SessionFormState> {
  const operator = await requireOperator();
  const date = parseDateParam(dateParam);

  const parsed = sessionSettingsSchema.safeParse({
    quota: formData.get("quota"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    promoText: formData.get("promoText"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  await prisma.dailySession.upsert({
    where: {
      operatorId_date: {
        operatorId: operator.operatorId,
        date,
      },
    },
    update: {
      quota: parsed.data.quota,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      promoText: parsed.data.promoText || null,
      isOpen: true,
    },
    create: {
      operatorId: operator.operatorId,
      date,
      quota: parsed.data.quota,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      promoText: parsed.data.promoText || null,
      isOpen: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/");
  return {};
}

export async function updateSessionSettingsAction(
  sessionId: string,
  _prevState: SessionFormState,
  formData: FormData
): Promise<SessionFormState> {
  await requireOperator();

  const parsed = sessionSettingsSchema.safeParse({
    quota: formData.get("quota"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    promoText: formData.get("promoText"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  await prisma.dailySession.update({
    where: { id: sessionId },
    data: {
      quota: parsed.data.quota,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      promoText: parsed.data.promoText || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/");
  return {};
}

export async function toggleSessionOpenAction(
  sessionId: string,
  isOpen: boolean
) {
  await requireOperator();

  await prisma.dailySession.update({
    where: { id: sessionId },
    data: { isOpen },
  });

  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function updateRegistrationStatusAction(
  registrationId: string,
  status: RegistrationStatus
) {
  await requireOperator();

  await prisma.registration.update({
    where: { id: registrationId },
    data: { status },
  });

  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
