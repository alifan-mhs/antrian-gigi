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
  openTodaySessionAction,
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

export function SessionPanel({ session }: { session: SessionData | null }) {
  if (!session) {
    return <OpenSessionCard />;
  }
  return <ManageSessionCard session={session} />;
}

function OpenSessionCard() {
  const [state, formAction, isPending] = useActionState(
    openTodaySessionAction,
    initialState
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buka Pendaftaran Hari Ini</CardTitle>
        <CardDescription>
          Belum ada sesi pendaftaran untuk hari ini. Atur kuota dan promo
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

  const remaining = Math.max(session.quota - session.filled, 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Sesi Pendaftaran Hari Ini</CardTitle>
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
              startToggle(() => {
                toggleSessionOpenAction(session.id, checked);
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
