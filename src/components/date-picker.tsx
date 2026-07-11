"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DatePicker({
  selectedDate,
  todayDate,
  basePath,
}: {
  selectedDate: string;
  todayDate: string;
  basePath: string;
}) {
  const router = useRouter();
  const isToday = selectedDate === todayDate;

  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={selectedDate}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) return;
          router.push(`${basePath}?date=${value}`);
        }}
        className="w-auto"
      />
      {!isToday && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push(basePath)}
        >
          Hari Ini
        </Button>
      )}
    </div>
  );
}
