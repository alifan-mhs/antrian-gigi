import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  parseDateParam,
  dateToParam,
  todayDateString,
  formatDisplayDate,
} from "@/lib/date";
import { getSessionStatus } from "@/lib/session-status";
import { DatePicker } from "@/components/date-picker";
import { PromoBanner } from "@/components/promo-banner";
import { SessionStatusAlerts } from "@/components/session-status-alerts";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function JadwalPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const selectedDate = parseDateParam(dateParam);
  const selectedDateParam = dateToParam(selectedDate);
  const todayParam = todayDateString();
  const isToday = selectedDateParam === todayParam;

  const session = await prisma.dailySession.findFirst({
    where: { date: selectedDate },
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
  const { remaining, quota, canRegister } = status;
  const dayLabel = isToday ? "hari ini" : "pada tanggal ini";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-4 py-8">
      <header className="space-y-3 text-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {formatDisplayDate(selectedDate)}
          </p>
          <h1 className="text-2xl font-bold text-primary">
            Cek Jadwal Pendaftaran
          </h1>
        </div>
        <div className="flex justify-center">
          <DatePicker
            selectedDate={selectedDateParam}
            todayDate={todayParam}
            basePath="/jadwal"
          />
        </div>
      </header>

      {session?.promoText && <PromoBanner text={session.promoText} />}

      {session && (
        <p className="text-center text-xs text-muted-foreground">
          Jam pendaftaran: {session.startTime} - {session.endTime} WIB
        </p>
      )}

      {canRegister && (
        <div className="flex items-center justify-center">
          <Badge className="bg-secondary px-4 py-1.5 text-sm text-secondary-foreground">
            Sisa kuota {dayLabel}: {remaining} dari {quota}
          </Badge>
        </div>
      )}

      <SessionStatusAlerts session={session} status={status} dayLabel={dayLabel} />

      {isToday && canRegister && (
        <Link href="/" className={buttonVariants({ className: "w-full", size: "lg" })}>
          Daftar Sekarang
        </Link>
      )}

      {!isToday && (
        <p className="text-center text-xs text-muted-foreground">
          Pendaftaran hanya bisa dilakukan pada hari H (walk-in). Halaman ini
          cuma untuk mengecek info jadwal.
        </p>
      )}

      <p className="pt-2 text-center text-xs text-muted-foreground">
        <Link href="/" className="font-medium text-primary underline underline-offset-2">
          Kembali ke halaman pendaftaran
        </Link>
      </p>
    </main>
  );
}
