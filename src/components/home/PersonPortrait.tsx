'use client';

import { UserRound } from 'lucide-react';
import { MediaImage } from '@/components/media/MediaImage';
import { uploadedPersonPhoto } from '@/lib/content/person-photo';
import { cn } from '@/lib/utils';

type PersonPortraitProps = {
  src?: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  iconClassName?: string;
};

/** Portrait frame. A person icon fills the frame when no photo has been added. */
export function PersonPortrait({
  src,
  alt,
  sizes,
  priority,
  className,
  iconClassName,
}: PersonPortraitProps) {
  const photo = uploadedPersonPhoto(src);
  if (!photo) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-surface" aria-hidden>
        <UserRound
          className={cn('size-14 text-ink/35 sm:size-20', iconClassName)}
          strokeWidth={1.25}
        />
      </div>
    );
  }

  return (
    <MediaImage
      src={photo}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={cn('object-cover object-top', className)}
    />
  );
}
