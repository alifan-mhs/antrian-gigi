import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { todayDateString, dateToParam, formatDisplayDate } from "@/lib/date";
import { ScanCompleteButton } from "@/components/scan-complete-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const operatorSession = await getSession();
  if (!operatorSession) redirect(`/login?callbackUrl=/scan/${id}`);

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: { session: { select: { date: true } } },
  });

  if (!registration) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-4 px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Pendaftaran tidak ditemukan</AlertTitle>
          <AlertDescription>
            QR code ini tidak valid atau pendaftarannya sudah dihapus.
          </AlertDescription>
        </Alert>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Kembali ke Dashboard
        </Link>
      </main>
    );
  }

  const isFromToday = dateToParam(registration.session.date) === todayDateString();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-4 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Konfirmasi Kedatangan</CardTitle>
          <CardDescription>
            Nomor antrian #{registration.queueNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isFromToday && (
            <Alert>
              <AlertTitle>Bukan pendaftaran hari ini</AlertTitle>
              <AlertDescription>
                QR code ini dari tanggal {formatDisplayDate(registration.session.date)}
                , bukan hari ini. Pastikan ini pasien yang benar.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-1">
            <p className="font-semibold leading-tight">{registration.name}</p>
            <p className="text-sm text-muted-foreground">{registration.phone}</p>
            {registration.complaint && (
              <p className="text-sm break-words text-muted-foreground">
                {registration.complaint}
              </p>
            )}
          </div>

          <ScanCompleteButton
            registrationId={registration.id}
            initialStatus={registration.status}
          />

          <Link
            href="/dashboard"
            className={buttonVariants({ variant: "outline", className: "w-full" })}
          >
            Kembali ke Dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
