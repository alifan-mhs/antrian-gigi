import { isWithinTimeWindow, hasTimeWindowStarted } from "@/lib/date";

type SessionForStatus = {
  isOpen: boolean;
  startTime: string;
  endTime: string;
  quota: number;
} | null;

export function getSessionStatus(session: SessionForStatus, activeCount: number) {
  const isManuallyOpen = !!session?.isOpen;
  const inTimeWindow =
    isManuallyOpen && session
      ? isWithinTimeWindow(session.startTime, session.endTime)
      : false;
  const notStartedYet =
    isManuallyOpen && session ? !hasTimeWindowStarted(session.startTime) : false;
  const windowEnded = isManuallyOpen && !inTimeWindow && !notStartedYet;

  const quota = session?.quota ?? 0;
  const remaining = Math.max(quota - activeCount, 0);
  const isFull = inTimeWindow && remaining <= 0;
  const canRegister = inTimeWindow && !isFull;

  return {
    isManuallyOpen,
    inTimeWindow,
    notStartedYet,
    windowEnded,
    quota,
    remaining,
    isFull,
    canRegister,
  };
}

export type SessionStatus = ReturnType<typeof getSessionStatus>;
