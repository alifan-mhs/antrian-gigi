import { ConfirmedTimeSlot } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { TIME_SLOT_INFO, TIME_SLOT_ORDER } from "@/lib/confirmed-patient";
import { maskName } from "@/lib/mask";

type Patient = { promoLabel: string; timeSlot: ConfirmedTimeSlot; name: string };

export function ConfirmedPatientsSchedule({ patients }: { patients: Patient[] }) {
  return (
    <Card>
      <CardContent className="space-y-4 py-4">
        <p className="text-center text-sm font-semibold text-primary">
          Jadwal Sesi Konfirmasi (Follow-up WA)
        </p>
        {TIME_SLOT_ORDER.map((slot) => {
          const slotPatients = patients.filter((p) => p.timeSlot === slot);
          return (
            <div key={slot} className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">
                Sesi {TIME_SLOT_INFO[slot].label} ({TIME_SLOT_INFO[slot].hours})
              </p>
              {slotPatients.length === 0 ? (
                <p className="text-xs text-muted-foreground">Belum ada pasien.</p>
              ) : (
                <ul className="space-y-1">
                  {slotPatients.map((p) => (
                    <li
                      key={p.promoLabel}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="font-medium">{p.promoLabel}</span>
                      <span className="text-muted-foreground">{maskName(p.name)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
