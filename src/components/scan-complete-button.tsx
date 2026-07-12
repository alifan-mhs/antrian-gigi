"use client";

import { useState, useTransition } from "react";
import { RegistrationStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, STATUS_BADGE_CLASS } from "@/lib/status";
import { updateRegistrationStatusAction } from "@/app/dashboard/actions";

export function ScanCompleteButton({
  registrationId,
  initialStatus,
}: {
  registrationId: string;
  initialStatus: RegistrationStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  if (status === "SELESAI") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <Badge className={STATUS_BADGE_CLASS.SELESAI}>Selesai</Badge>
        <p className="text-sm text-muted-foreground">
          Pasien ini sudah ditandai selesai.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Badge className={STATUS_BADGE_CLASS[status]}>{STATUS_LABEL[status]}</Badge>
      <Button
        size="lg"
        className="w-full"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await updateRegistrationStatusAction(registrationId, "SELESAI");
            setStatus("SELESAI");
          });
        }}
      >
        {isPending ? "Memproses..." : "Tandai Selesai"}
      </Button>
    </div>
  );
}
