import { prisma } from "@/lib/prisma";
import {
  todayAsDate,
  formatDisplayDate,
  isWithinTimeWindow,
  hasTimeWindowStarted,
} from "@/lib/date";
import { RegistrationForm } from "@/components/registration-form";
import { HiddenAdminAccess } from "@/components/hidden-admin-access";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  const isManuallyOpen = !!session?.isOpen;
  const inTimeWindow =
    isManuallyOpen && session
      ? isWithinTimeWindow(session.startTime, session.endTime)
      : false;
  const notStartedYet =
    isManuallyOpen && session ? !hasTimeWindowStarted(session.startTime) : false;
  const windowEnded = isManuallyOpen && !inTimeWindow && !notStartedYet;

  const quota = session?.quota ?? 0;
  const filled = session?._count.registrations ?? 0;
  const remaining = Math.max(quota - filled, 0);
  const isFull = inTimeWindow && remaining <= 0;
  const canRegister = inTimeWindow && !isFull;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-5 px-4 py-8">
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

      {session?.promoText && (
        <Card className="border-secondary bg-accent">
          <CardContent className="py-3 text-center text-sm font-medium text-accent-foreground">
            {session.promoText}
          </CardContent>
        </Card>
      )}

      {canRegister && (
        <div className="flex items-center justify-center">
          <Badge className="bg-secondary px-4 py-1.5 text-sm text-secondary-foreground">
            Sisa kuota hari ini: {remaining} dari {quota}
          </Badge>
        </div>
      )}

      {!isManuallyOpen && (
        <Alert>
          <AlertTitle>Pendaftaran hari ini sudah ditutup</AlertTitle>
          <AlertDescription>
            Silakan cek kembali di lain waktu atau hubungi klinik secara
            langsung.
          </AlertDescription>
        </Alert>
      )}

      {notStartedYet && session && (
        <Alert>
          <AlertTitle>Pendaftaran belum dibuka</AlertTitle>
          <AlertDescription>
            Pendaftaran hari ini dibuka mulai jam {session.startTime} WIB.
            Silakan kembali lagi nanti.
          </AlertDescription>
        </Alert>
      )}

      {windowEnded && session && (
        <Alert>
          <AlertTitle>Jam pendaftaran hari ini sudah berakhir</AlertTitle>
          <AlertDescription>
            Pendaftaran hari ini hanya dibuka jam {session.startTime} -{" "}
            {session.endTime} WIB. Silakan coba lagi besok.
          </AlertDescription>
        </Alert>
      )}

      {isFull && (
        <Alert>
          <AlertTitle>Kuota hari ini sudah penuh</AlertTitle>
          <AlertDescription>
            Terima kasih atas minatnya, silakan coba daftar lagi besok.
          </AlertDescription>
        </Alert>
      )}

      {canRegister && <RegistrationForm />}
    </main>
  );
}
