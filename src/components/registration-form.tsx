"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { registerAction, type RegisterState } from "@/app/actions";

const initialState: RegisterState = { status: "idle" };

export function RegistrationForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [consent, setConsent] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (state.status === "success") {
    return (
      <Card className="border-secondary bg-accent">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <span className="text-sm font-medium text-muted-foreground">
            Nomor antrian Anda
          </span>
          <span className="text-6xl font-bold text-primary">
            {state.queueNumber}
          </span>
          <span className="rounded-full bg-secondary px-4 py-1 text-sm font-semibold text-secondary-foreground">
            Menunggu konfirmasi
          </span>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Simpan/screenshot nomor ini. Perawat akan menghubungi Anda lewat
            telepon/WA sesuai urutan antrian.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4"
    >
      {state.status === "error" && state.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input id="name" name="name" placeholder="Nama pasien" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Nomor HP/WA</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          placeholder="08xxxxxxxxxx"
          required
        />
        <div className="flex items-start gap-2 rounded-lg border bg-muted/50 p-3">
          <input type="hidden" name="consent" value={consent ? "on" : ""} />
          <Checkbox
            id="consent"
            checked={consent}
            onCheckedChange={(checked) => setConsent(checked === true)}
            required
            className="mt-0.5"
          />
          <Label
            htmlFor="consent"
            className="text-xs leading-relaxed font-normal text-muted-foreground"
          >
            Saya secara sadar memberikan nomor HP/WA ini kepada admin klinik
            untuk keperluan follow up pendaftaran. Data pribadi saya dijamin
            keamanannya dan tidak akan disebarluaskan ke pihak lain.
          </Label>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="complaint">Keluhan Singkat (opsional)</Label>
        <Textarea
          id="complaint"
          name="complaint"
          placeholder="Contoh: sakit gigi geraham kanan bawah"
          rows={3}
        />
      </div>
      <Button
        type="button"
        className="w-full"
        size="lg"
        disabled={isPending || !consent}
        onClick={() => {
          if (formRef.current?.reportValidity()) {
            setShowConfirm(true);
          }
        }}
      >
        {isPending ? "Mendaftar..." : "Daftar Sekarang"}
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pendaftaran</DialogTitle>
            <DialogDescription>
              Setelah Anda mendaftar, Anda akan di-follow up oleh petugas
              yang akan melakukan tindakan tersebut kepada Anda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                setShowConfirm(false);
                formRef.current?.requestSubmit();
              }}
            >
              Saya Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
