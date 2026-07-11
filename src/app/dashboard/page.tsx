import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { todayAsDate, formatDisplayDate } from "@/lib/date";
import { SessionPanel } from "@/components/dashboard/session-panel";
import { QueueList } from "@/components/dashboard/queue-list";
import { Button } from "@/components/ui/button";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const operatorSession = await getSession();
  if (!operatorSession) redirect("/login");

  const today = todayAsDate();

  const dailySession = await prisma.dailySession.findUnique({
    where: {
      operatorId_date: {
        operatorId: operatorSession.operatorId,
        date: today,
      },
    },
    include: {
      registrations: {
        orderBy: { queueNumber: "asc" },
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {formatDisplayDate(today)}
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
      </header>

      <SessionPanel session={sessionData} />

      {sessionData && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Daftar Antrian</h2>
          <QueueList registrations={registrations} />
        </section>
      )}
    </main>
  );
}
