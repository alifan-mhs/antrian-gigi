import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { SessionStatus } from "@/lib/session-status";

export function SessionStatusAlerts({
  session,
  status,
  dayLabel = "hari ini",
}: {
  session: { startTime: string; endTime: string } | null;
  status: SessionStatus;
  dayLabel?: string;
}) {
  const { isManuallyOpen, notStartedYet, windowEnded, isFull } = status;

  return (
    <>
      {!isManuallyOpen && (
        <Alert>
          <AlertTitle>Pendaftaran {dayLabel} sudah ditutup</AlertTitle>
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
            Pendaftaran {dayLabel} dibuka mulai jam {session.startTime} WIB.
            Silakan kembali lagi nanti.
          </AlertDescription>
        </Alert>
      )}

      {windowEnded && session && (
        <Alert>
          <AlertTitle>Jam pendaftaran {dayLabel} sudah berakhir</AlertTitle>
          <AlertDescription>
            Pendaftaran {dayLabel} hanya dibuka jam {session.startTime} -{" "}
            {session.endTime} WIB. Silakan cek jadwal hari lain.
          </AlertDescription>
        </Alert>
      )}

      {isFull && (
        <Alert>
          <AlertTitle>Kuota {dayLabel} sudah penuh</AlertTitle>
          <AlertDescription>
            Terima kasih atas minatnya, silakan cek jadwal hari lain.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
