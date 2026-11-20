"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export function SheetContent({ className, children, title = "Menu" }: { className?: string; children: React.ReactNode; title?: string }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-maroon-dark/60 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col bg-ivory p-6 shadow-xl data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
          className
        )}
      >
        <Dialog.Title className="font-display text-xl text-maroon">{title}</Dialog.Title>
        <Dialog.Description className="sr-only">Site navigation</Dialog.Description>
        <Dialog.Close className="absolute right-4 top-4 rounded p-1 text-maroon hover:bg-cream" aria-label="Close">
          <X className="h-5 w-5" />
        </Dialog.Close>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
