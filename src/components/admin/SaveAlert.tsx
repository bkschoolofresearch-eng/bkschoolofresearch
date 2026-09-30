'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check } from 'lucide-react';

export function SaveAlert({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#0B1F36]/45"
        aria-label="Close"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-sm rounded-2xl bg-white px-6 py-7 text-center shadow-2xl"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E8F0FE] text-[#173B6C]">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h2
          id={titleId}
          className="mt-4 font-[family-name:var(--font-admin-display)] text-2xl text-[#0B1F36]"
        >
          Save this?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#5B6B7C]">
          The record will update. An image is stored once, so saving again
          does not upload another copy.
        </p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-[#D5DEE8] px-4 py-2.5 text-sm font-semibold text-[#0B1F36] hover:bg-[#F4F7FB]"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-[#0B1F36] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#173B6C]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function useSaveConfirm() {
  const [open, setOpen] = useState(false);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const askSave = () => {
    if (resolver.current) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setOpen(true);
    });
  };

  const close = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpen(false);
  };

  const saveDialog = (
    <SaveAlert
      open={open}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  );

  return { askSave, saveDialog };
}
