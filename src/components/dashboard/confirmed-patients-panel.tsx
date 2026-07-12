"use client";

import { useActionState, useState, useTransition } from "react";
import { ConfirmedPatientStatus, ConfirmedTimeSlot } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TIME_SLOT_INFO,
  TIME_SLOT_ORDER,
  CONFIRMED_STATUS_LABEL,
  CONFIRMED_STATUS_BADGE_CLASS,
  CONFIRMED_STATUS_ORDER,
} from "@/lib/confirmed-patient";
import { cn } from "@/lib/utils";
import {
  addConfirmedPatientAction,
  updateConfirmedPatientStatusAction,
  type ConfirmedPatientFormState,
} from "@/app/dashboard/confirmed-actions";

type ConfirmedPatient = {
  id: string;
  promoLabel: string;
  timeSlot: ConfirmedTimeSlot;
  name: string;
  phone: string;
  complaint: string | null;
  status: ConfirmedPatientStatus;
};

type EligibleRegistration = {
  id: string;
  name: string;
  phone: string;
  complaint: string | null;
};

const initialState: ConfirmedPatientFormState = {};

export function ConfirmedPatientsPanel({
  patients,
  eligibleRegistrations,
  dateParam,
}: {
  patients: ConfirmedPatient[];
  eligibleRegistrations: EligibleRegistration[];
  dateParam: string;
}) {
  const boundAction = addConfirmedPatientAction.bind(null, dateParam);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );
  const [timeSlot, setTimeSlot] = useState<ConfirmedTimeSlot | "">("");
  const [mode, setMode] = useState<"pilih" | "manual">(
    eligibleRegistrations.length > 0 ? "pilih" : "manual"
  );
  const [selectedId, setSelectedId] = useState("");

  const selectedRegistration = eligibleRegistrations.find((r) => r.id === selectedId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Pasien Konfirmasi WA</CardTitle>
          <CardDescription>
            Untuk pasien yang sudah di-follow up lewat WhatsApp dan
            terkonfirmasi akan datang — terpisah dari antrian walk-in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <Alert variant="destructive">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            {mode === "pilih" ? (
              <div className="space-y-2">
                <Label htmlFor="confirmed-source">
                  Pasien (sudah berstatus Dikonfirmasi di antrian walk-in)
                </Label>
                <input type="hidden" name="sourceRegistrationId" value={selectedId} />
                {eligibleRegistrations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada pasien walk-in berstatus &quot;Dikonfirmasi&quot; yang
                    belum dijadwalkan.{" "}
                    <button
                      type="button"
                      className="font-medium text-primary underline underline-offset-2"
                      onClick={() => setMode("manual")}
                    >
                      Isi manual
                    </button>
                  </p>
                ) : (
                  <>
                    <Select
                      value={selectedId}
                      onValueChange={(value) => setSelectedId(value ?? "")}
                    >
                      <SelectTrigger id="confirmed-source" className="w-full">
                        <SelectValue placeholder="Pilih pasien" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleRegistrations.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} - {r.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedRegistration && (
                      <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                        <p className="font-medium">{selectedRegistration.name}</p>
                        <p className="text-muted-foreground">
                          {selectedRegistration.phone}
                        </p>
                        {selectedRegistration.complaint && (
                          <p className="text-muted-foreground">
                            {selectedRegistration.complaint}
                          </p>
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      className="text-xs font-medium text-primary underline underline-offset-2"
                      onClick={() => {
                        setMode("manual");
                        setSelectedId("");
                      }}
                    >
                      Bukan dari antrian walk-in? Isi manual
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <input type="hidden" name="sourceRegistrationId" value="" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="confirmed-name">Nama Lengkap</Label>
                    <Input id="confirmed-name" name="name" placeholder="Nama pasien" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmed-phone">Nomor HP/WA</Label>
                    <Input
                      id="confirmed-phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmed-complaint">Keluhan Singkat (opsional)</Label>
                  <Textarea
                    id="confirmed-complaint"
                    name="complaint"
                    placeholder="Contoh: sakit gigi geraham kanan bawah"
                    rows={2}
                  />
                </div>
                {eligibleRegistrations.length > 0 && (
                  <button
                    type="button"
                    className="text-xs font-medium text-primary underline underline-offset-2"
                    onClick={() => setMode("pilih")}
                  >
                    Pilih dari antrian walk-in yang sudah dikonfirmasi
                  </button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirmed-timeSlot">Waktu Kedatangan</Label>
              <input type="hidden" name="timeSlot" value={timeSlot} />
              <Select
                value={timeSlot}
                onValueChange={(value) => setTimeSlot(value as ConfirmedTimeSlot)}
              >
                <SelectTrigger id="confirmed-timeSlot" className="w-full">
                  <SelectValue placeholder="Pilih waktu Siang/Sore atau Malam" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOT_ORDER.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {TIME_SLOT_INFO[slot].label} ({TIME_SLOT_INFO[slot].hours})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Tambah Pasien"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {TIME_SLOT_ORDER.map((slot) => {
        const slotPatients = patients.filter((p) => p.timeSlot === slot);
        return (
          <div key={slot} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Sesi {TIME_SLOT_INFO[slot].label} ({TIME_SLOT_INFO[slot].hours}) &middot;{" "}
              {slotPatients.length} pasien
            </h3>
            {slotPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada pasien terkonfirmasi di sesi ini.
              </p>
            ) : (
              <ul className="space-y-3">
                {slotPatients.map((patient) => (
                  <ConfirmedPatientCard key={patient.id} patient={patient} />
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ConfirmedPatientCard({ patient }: { patient: ConfirmedPatient }) {
  const [status, setStatus] = useState(patient.status);
  const [isPending, startTransition] = useTransition();

  return (
    <li>
      <Card>
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-xs font-semibold text-secondary-foreground">
              {patient.promoLabel}
            </p>
            <p className="truncate font-semibold leading-tight">{patient.name}</p>
            <p className="text-sm text-muted-foreground">{patient.phone}</p>
            {patient.complaint && (
              <p className="text-sm break-words text-muted-foreground">
                {patient.complaint}
              </p>
            )}
          </div>

          <Select
            value={status}
            disabled={isPending}
            onValueChange={(value) => {
              const next = value as ConfirmedPatientStatus;
              setStatus(next);
              startTransition(async () => {
                await updateConfirmedPatientStatusAction(patient.id, next);
              });
            }}
          >
            <SelectTrigger
              className={cn("w-full sm:w-44", CONFIRMED_STATUS_BADGE_CLASS[status])}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONFIRMED_STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s}>
                  {CONFIRMED_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </li>
  );
}
