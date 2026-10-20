"use client";

import { FeedbackForm } from "@/components/feedback-form";
import { ProblemForm } from "@/components/problem-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { CalendarSyncDialog } from "./calendary-sync-dialog";
import { AboutDialog } from "./about-dialog";

export default function InfoMenu() {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    "calendar" | "feedback" | "problem" | "about"
  >("feedback");

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <div className="fixed right-2 bottom-2 print:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="More options">
              <DotsVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* <DropdownMenuItem>Add my classes</DropdownMenuItem> */}
            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setDialogType("calendar")}>
                Add to calendar
              </DropdownMenuItem>
            </DialogTrigger>

            <DropdownMenuSeparator />

            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setDialogType("feedback")}>
                Feedback
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setDialogType("problem")}>
                Report a problem
              </DropdownMenuItem>
            </DialogTrigger>

            <DropdownMenuSeparator />

            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setDialogType("about")}>
                About
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        {dialogType === "calendar" && <CalendarSyncDialog />}
        {dialogType === "feedback" && (
          <FeedbackForm onSuccess={() => setDialogOpen(false)} />
        )}
        {dialogType === "problem" && (
          <ProblemForm onSuccess={() => setDialogOpen(false)} />
        )}
        {dialogType === "about" && <AboutDialog />}
      </DialogContent>
    </Dialog>
  );
}
