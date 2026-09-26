'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Link2, Trash2 } from 'lucide-react';
import { cmsApi } from '@/lib/cms/client-api';
import { cn } from '@/lib/utils';

type CloudinaryImageFieldProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  help?: string;
  disabled?: boolean;
  className?: string;
  /**
   * Research listing covers are portrait 3:4 on the public site.
   */
  previewAspect?: 'portrait' | 'video' | 'square' | 'wide';
  uploadEndpoint?: string;
  uploadExtraFields?: Record<string, string>;
};

export function CloudinaryImageField({
  id,
  label,
  value,
  onChange,
  help,
  disabled,
  className,
  previewAspect = 'portrait',
  uploadEndpoint,
  uploadExtraFields,
}: CloudinaryImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const trimmed = value.trim();
  const showImage = Boolean(trimmed) && !broken;

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setUploading(true);
    setError(null);
    setBroken(false);
    try {
      if (uploadEndpoint) {
        const form = new FormData();
        form.append('file', file);
        for (const [k, v] of Object.entries(uploadExtraFields ?? {})) {
          form.append(k, v);
        }
        const res = await fetch(uploadEndpoint, {
          method: 'POST',
          credentials: 'include',
          body: form,
        });
        const data = (await res.json()) as {
          error?: string;
          url?: string;
          storage?: { url?: string };
        };
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        const url = data.url || data.storage?.url;
        if (!url) throw new Error('Upload returned no URL');
        onChange(url);
      } else {
        const result = await cmsApi.uploadMedia(file, {
          title: file.name,
          kind: 'image',
        });
        onChange(result.item.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const aspectClass =
    previewAspect === 'square'
      ? 'aspect-square'
      : previewAspect === 'wide'
        ? 'aspect-[16/7]'
        : previewAspect === 'video'
          ? 'aspect-video'
          : 'aspect-[3/4]';

  const openPicker = () => {
    if (disabled || uploading) return;
    fileRef.current?.click();
  };

  return (
    <div className={cn('space-y-3', className)}>
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-[#0D2745]">
          {label}
        </label>
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={disabled || uploading}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void upload(file);
        }}
      />

      {/* One compact unit: frame = upload target */}
      <div className="w-full max-w-[13.5rem]">
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={openPicker}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void upload(file);
          }}
          className={cn(
            'group relative block w-full overflow-hidden rounded-xl border text-left transition',
            aspectClass,
            dragging
              ? 'border-[#0B1F36] bg-[#E8F0FE] ring-2 ring-[#0B1F36]/20'
              : showImage
                ? 'border-[#D9DEE5] bg-[#EEF2F6]'
                : 'border-dashed border-[#B8C4D4] bg-[#F3F6F9] hover:border-[#0B1F36] hover:bg-[#EEF2F6]',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          {showImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={trimmed}
                src={trimmed}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-top"
                onLoad={() => setBroken(false)}
                onError={() => setBroken(true)}
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1F36]/80 to-transparent px-3 pb-3 pt-8 text-center text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                {uploading ? 'Uploading…' : 'Click to replace'}
              </span>
            </>
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#E2E8F0]">
                <ImagePlus className="h-5 w-5 text-[#0B1F36]" />
              </span>
              <span className="text-sm font-semibold text-[#0B1F36]">
                {uploading ? 'Uploading…' : 'Add cover photo'}
              </span>
              <span className="text-[11px] leading-snug text-[#7A90A8]">
                Drop here or click
                <br />
                Portrait · 3:4 like the site
              </span>
            </span>
          )}
        </button>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          {showImage ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange('');
                setBroken(false);
                setError(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A3B3B] hover:underline disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setUrlOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#174EA6] hover:underline"
          >
            <Link2 className="h-3 w-3" />
            {urlOpen ? 'Hide URL' : 'Paste URL'}
          </button>
        </div>

        {urlOpen ? (
          <input
            id={id}
            type="url"
            value={value}
            onChange={(e) => {
              setBroken(false);
              onChange(e.target.value);
            }}
            placeholder="https://…"
            disabled={disabled || uploading}
            className="mt-2 w-full rounded-lg border border-[#D9DEE5] bg-white px-3 py-2 text-sm text-[#242B2D] outline-none focus:border-[#0B1F36] focus:ring-2 focus:ring-[#0B1F36]/10"
          />
        ) : null}
      </div>

      {help ? <p className="text-xs text-[#68727D]">{help}</p> : null}
      {error ? (
        <p className="text-xs font-medium text-[#8A3B3B]">{error}</p>
      ) : null}
      {trimmed && broken ? (
        <p className="text-xs font-medium text-[#8A3B3B]">
          Couldn’t load this image — try another file or URL.
        </p>
      ) : null}
    </div>
  );
}
