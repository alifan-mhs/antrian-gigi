"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  openSessionForDateAction,
  toggleSessionOpenAction,
  updateSessionSettingsAction,
  type SessionFormState,
} from "@/app/dashboard/actions";

type SessionData = {
  id: string;
  quota: number;
  startTime: string;
  endTime: string;
  promoText: string | null;
  isOpen: boolean;
  filled: number;
};

const initialState: SessionFormState = {};

export function SessionPanel({
  session,
  dateParam,
}: {
  session: SessionData | null;
  dateParam: string;
}) {
  if (!session) {
    return <OpenSessionCard dateParam={dateParam} />;
  }
  return <ManageSessionCard session={session} />;
}

function OpenSessionCard({ dateParam }: { dateParam: string }) {
  const boundAction = openSessionForDateAction.bind(null, dateParam);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buka Pendaftaran</CardTitle>
        <CardDescription>
          Belum ada sesi pendaftaran untuk tanggal ini. Atur kuota dan promo
          untuk membukanya.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="quota">Kuota Maksimal</Label>
            <Input
              id="quota"
              name="quota"
              type="number"
              min={1}
              defaultValue={20}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Jam Mulai</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                defaultValue="08:00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Jam Selesai</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                defaultValue="17:00"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="promoText">Info Promo (opsional)</Label>
            <Textarea
              id="promoText"
              name="promoText"
              placeholder="Contoh: Gratis konsultasi untuk 10 pendaftar pertama"
              rows={2}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Membuka..." : "Buka Pendaftaran"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ManageSessionCard({ session }: { session: SessionData }) {
  const boundAction = updateSessionSettingsAction.bind(null, session.id);
  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );
  const [isOpen, setIsOpen] = useState(session.isOpen);
  const [isToggling, startToggle] = useTransition();

  // Adjust state during render (not in an effect) when the server's true
  // value changes — this same component instance persists across
  // router.refresh()-driven re-renders, so without this the Switch would
  // keep showing whichever value was last set locally and never pick up
  // fresh server state (e.g. after a refresh lands mid-toggle).
  const [prevIsOpen, setPrevIsOpen] = useState(session.isOpen);
  if (session.isOpen !== prevIsOpen) {
    setPrevIsOpen(session.isOpen);
    setIsOpen(session.isOpen);
  }

  const remaining = Math.max(session.quota - session.filled, 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Sesi Pendaftaran</CardTitle>
          <CardDescription>
            {session.filled} terdaftar &middot; sisa {remaining} dari{" "}
            {session.quota} kuota &middot; jam {session.startTime}-
            {session.endTime}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isOpen ? "default" : "secondary"}>
            {isOpen ? "Dibuka" : "Ditutup"}
          </Badge>
          <Switch
            checked={isOpen}
            disabled={isToggling}
            onCheckedChange={(checked) => {
              setIsOpen(checked);
              startToggle(async () => {
                // Must be awaited (and returned into the transition) so
                // isToggling stays true until the write + revalidation
                // actually finish — otherwise a fast second toggle can race
                // ahead of the first and land the DB in the wrong state.
                await toggleSessionOpenAction(session.id, checked);
              });
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="quota">Kuota Maksimal</Label>
              <Input
                id="quota"
                name="quota"
                type="number"
                min={session.filled || 1}
                defaultValue={session.quota}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Jam Mulai</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                defaultValue={session.startTime}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Jam Selesai</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                defaultValue={session.endTime}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="promoText">Info Promo (opsional)</Label>
            <Textarea
              id="promoText"
              name="promoText"
              defaultValue={session.promoText ?? ""}
              rows={2}
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
