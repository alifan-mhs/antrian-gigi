import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { todayAsDate, formatDisplayDate } from "@/lib/date";
import { getSessionStatus } from "@/lib/session-status";
import { RegistrationForm } from "@/components/registration-form";
import { HiddenAdminAccess } from "@/components/hidden-admin-access";
import { PwaStandaloneRedirect } from "@/components/pwa-standalone-redirect";
import { PromoBanner } from "@/components/promo-banner";
import { SessionStatusAlerts } from "@/components/session-status-alerts";
import { ConfirmedPatientsSchedule } from "@/components/confirmed-patients-schedule";
import { CONFIRMED_VISIBLE_STATUSES } from "@/lib/confirmed-patient";
import { Badge } from "@/components/ui/badge";

// Short-lived ISR: absorb bursts of concurrent walk-in visits with one shared
// cached render instead of a DB hit per request. Mutations (registration,
// session open/close/quota changes) call revalidatePath("/") to invalidate
// this immediately, so this is just a safety-net staleness window.
export const revalidate = 5;

export default async function DaftarPage() {
  const today = todayAsDate();

  const session = await prisma.dailySession.findFirst({
    where: { date: today },
    include: {
      _count: {
        select: {
          registrations: {
            where: { status: { notIn: ["BATAL", "TIDAK_DATANG"] } },
          },
        },
      },
    },
  });

  const status = getSessionStatus(session, session?._count.registrations ?? 0);
  const { isManuallyOpen, remaining, quota, canRegister } = status;

  const confirmedPatients = await prisma.confirmedPatient.findMany({
    where: { date: today, status: { in: CONFIRMED_VISIBLE_STATUSES } },
    select: { promoLabel: true, timeSlot: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-4 py-8">
      <PwaStandaloneRedirect />
      <HiddenAdminAccess>
        <header className="space-y-1 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {formatDisplayDate(today)}
          </p>
          <h1 className="text-2xl font-bold text-primary">
            Pendaftaran Pasien Hari Ini
          </h1>
          {session && isManuallyOpen && (
            <p className="text-xs text-muted-foreground">
              Jam pendaftaran: {session.startTime} - {session.endTime} WIB
            </p>
          )}
        </header>
      </HiddenAdminAccess>

      {session?.promoText && <PromoBanner text={session.promoText} />}

      {canRegister && (
        <div className="flex items-center justify-center">
          <Badge className="bg-secondary px-4 py-1.5 text-sm text-secondary-foreground">
            Sisa kuota hari ini: {remaining} dari {quota}
          </Badge>
        </div>
      )}

      <SessionStatusAlerts session={session} status={status} />

      {canRegister && <RegistrationForm />}

      {confirmedPatients.length > 0 && (
        <ConfirmedPatientsSchedule patients={confirmedPatients} />
      )}

      <p className="pt-2 text-center text-xs text-muted-foreground">
        Ingin cek jadwal hari lain?{" "}
        <Link href="/jadwal" className="font-medium text-primary underline underline-offset-2">
          Lihat di sini
        </Link>
      </p>
    </main>
  );
}
