'use client';

import React from "react";
import { cn } from "@/lib/utils";

interface AvatarCircle {
  imageUrl: string;
  profileUrl?: string;
}

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: AvatarCircle[];
}

export function AvatarCircles({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) {
  return (
    <div className={cn("z-10 flex -space-x-3 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) => (
        <a
          key={index}
          href={url.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-block transition-transform hover:scale-110"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={index}
            className="h-10 w-10 rounded-full border-2 border-white dark:border-zinc-800 object-cover"
            src={url.imageUrl}
            width={40}
            height={40}
            alt={`Avatar ${index + 1}`}
          />
        </a>
      ))}
      {(numPeople ?? 0) > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-zinc-800 dark:bg-white dark:text-black">
          +{numPeople}
        </div>
      )}
    </div>
  );
}
