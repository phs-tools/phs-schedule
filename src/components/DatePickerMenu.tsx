"use client";

import { DateTime } from "luxon";

import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DatePickerMenuProps {
  label: React.ReactNode;
  defaultValue: string;
  onSelect: (date: string) => void;
}

export function DatePickerMenu({
  label,
  defaultValue,
  onSelect,
}: DatePickerMenuProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = DateTime.fromFormat(event.target.value, "yyyy-MM-dd");
    if (!chosen.isValid) {
      return;
    }

    onSelect(chosen.toFormat("yyyy-LL-dd"));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex min-w-[160px] cursor-pointer items-center justify-center gap-1 rounded-md border-none bg-transparent px-2 py-1 text-center text-base text-neutral-600 transition-colors select-none hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 print:hidden">
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[220px] p-2">
        <Input
          type="date"
          defaultValue={defaultValue}
          onChange={handleChange}
          className="w-full"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
