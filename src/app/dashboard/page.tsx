import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  parseDateParam,
  dateToParam,
  todayDateString,
  formatDisplayDate,
} from "@/lib/date";
import { SessionPanel } from "@/components/dashboard/session-panel";
import { QueueList } from "@/components/dashboard/queue-list";
import { ConfirmedPatientsPanel } from "@/components/dashboard/confirmed-patients-panel";
import { DatePicker } from "@/components/date-picker";
import { Button, buttonVariants } from "@/components/ui/button";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const operatorSession = await getSession();
  if (!operatorSession) redirect("/login");

  const { date: dateParam } = await searchParams;
  const selectedDate = parseDateParam(dateParam);
  const selectedDateParam = dateToParam(selectedDate);
  const todayParam = todayDateString();
  const isToday = selectedDateParam === todayParam;

  const dailySession = await prisma.dailySession.findUnique({
    where: {
      operatorId_date: {
        operatorId: operatorSession.operatorId,
        date: selectedDate,
      },
    },
    include: {
      registrations: {
        orderBy: { queueNumber: "asc" },
        include: { confirmedPatient: { select: { id: true } } },
      },
    },
  });

  const activeFilled =
    dailySession?.registrations.filter(
      (r) => r.status !== "BATAL" && r.status !== "TIDAK_DATANG"
    ).length ?? 0;

  const sessionData = dailySession
    ? {
        id: dailySession.id,
        quota: dailySession.quota,
        startTime: dailySession.startTime,
        endTime: dailySession.endTime,
        promoText: dailySession.promoText,
        isOpen: dailySession.isOpen,
        filled: activeFilled,
      }
    : null;

  const registrations =
    dailySession?.registrations.map((r) => ({
      id: r.id,
      queueNumber: r.queueNumber,
      name: r.name,
      phone: r.phone,
      complaint: r.complaint,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })) ?? [];

  const confirmedPatients = await prisma.confirmedPatient.findMany({
    where: { operatorId: operatorSession.operatorId, date: selectedDate },
    orderBy: { createdAt: "asc" },
  });

  // Walk-in patients already marked "Dikonfirmasi" that haven't been
  // scheduled into a time slot yet — lets the nurse reuse their existing
  // name/phone/complaint instead of retyping everything.
  const eligibleRegistrations =
    dailySession?.registrations
      .filter((r) => r.status === "DIKONFIRMASI" && !r.confirmedPatient)
      .map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        complaint: r.complaint,
      })) ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:py-8">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {formatDisplayDate(selectedDate)}
              {!isToday && (
                <span className="ml-1 font-medium text-secondary-foreground">
                  (bukan hari ini)
                </span>
              )}
            </p>
            <h1 className="text-xl font-bold text-primary sm:text-2xl">
              Halo, {operatorSession.name}
            </h1>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Keluar
            </Button>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <DatePicker
            selectedDate={selectedDateParam}
            todayDate={todayParam}
            basePath="/dashboard"
          />
          <Link
            href="/"
            target="_blank"
            rel="noopener"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ExternalLink />
            Lihat Halaman Publik
          </Link>
        </div>
      </header>

      <SessionPanel session={sessionData} dateParam={selectedDateParam} />

      {sessionData && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Daftar Antrian</h2>
          <QueueList registrations={registrations} />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Pasien Konfirmasi WA</h2>
        <ConfirmedPatientsPanel
          patients={confirmedPatients}
          eligibleRegistrations={eligibleRegistrations}
          dateParam={selectedDateParam}
        />
      </section>
    </main>
  );
}
