"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RegistrationStatus } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_BADGE_CLASS, STATUS_LABEL, STATUS_ORDER } from "@/lib/status";
import { formatTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { updateRegistrationStatusAction } from "@/app/dashboard/actions";

type Registration = {
  id: string;
  queueNumber: number;
  name: string;
  phone: string;
  complaint: string | null;
  status: RegistrationStatus;
  createdAt: string;
};

const FILTERS: Array<{ value: "SEMUA" | RegistrationStatus; label: string }> = [
  { value: "SEMUA", label: "Semua" },
  ...STATUS_ORDER.map((status) => ({ value: status, label: STATUS_LABEL[status] })),
];

export function QueueList({ registrations }: { registrations: Registration[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"SEMUA" | RegistrationStatus>("SEMUA");

  useEffect(() => {
    // Poll only while the tab is actually visible, and refresh right away
    // when it regains focus — avoids burning free-tier DB queries on
    // backgrounded tabs, which is where most of the "polling" cost was going.
    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => router.refresh(), 25000);
    };
    const stop = () => {
      if (!interval) return;
      clearInterval(interval);
      interval = null;
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [router]);

  const filtered = useMemo(() => {
    if (filter === "SEMUA") return registrations;
    return registrations.filter((r) => r.status === filter);
  }, [registrations, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
              {f.value !== "SEMUA" && (
                <span className="ml-1 text-xs opacity-70">
                  ({registrations.filter((r) => r.status === f.value).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Belum ada pendaftar di kategori ini.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((registration) => (
            <RegistrationCard key={registration.id} registration={registration} />
          ))}
        </ul>
      )}
    </div>
  );
}

function RegistrationCard({ registration }: { registration: Registration }) {
  const [status, setStatus] = useState(registration.status);
  const [isPending, startTransition] = useTransition();

  return (
    <li>
      <Card>
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {registration.queueNumber}
            </span>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="truncate font-semibold leading-tight">
                {registration.name}
              </p>
              <p className="text-sm text-muted-foreground">{registration.phone}</p>
              {registration.complaint && (
                <p className="text-sm break-words text-muted-foreground">
                  {registration.complaint}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Daftar {formatTime(new Date(registration.createdAt))}
              </p>
            </div>
          </div>

          <Select
            value={status}
            disabled={isPending}
            onValueChange={(value) => {
              const next = value as RegistrationStatus;
              setStatus(next);
              startTransition(() => {
                updateRegistrationStatusAction(registration.id, next);
              });
            }}
          >
            <SelectTrigger
              className={cn("w-full sm:w-44", STATUS_BADGE_CLASS[status])}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </li>
  );
}
