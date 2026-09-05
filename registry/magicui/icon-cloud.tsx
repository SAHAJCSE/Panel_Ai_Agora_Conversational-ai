'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Cloud,
  fetchSimpleIcons,
  ICloud,
  SimpleIcon,
  renderSimpleIcon,
} from 'react-icon-cloud';

export const cloudProps: Omit<ICloud, 'children'> = {
  containerProps: {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      paddingTop: 10,
    },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: 'pointer',
    tooltip: 'native',
    initial: [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: '#00000000',
    maxSpeed: 0.04,
    minSpeed: 0.02,
  },
};

export const renderCustomIcon = (icon: SimpleIcon, theme: string = 'dark') => {
  const bgHex = theme === 'light' ? '#f3f4f6' : '#080510';
  const fallbackHex = theme === 'light' ? '#6e6e73' : '#ffffff';
  const minContrastRatio = theme === 'dark' ? 2 : 1.2;

  return renderSimpleIcon({
    icon,
    bgHex,
    fallbackHex,
    minContrastRatio,
    size: 42,
    aProps: {
      href: undefined,
      target: undefined,
      rel: undefined,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
    },
  });
};

export type DynamicCloudProps = {
  iconSlugs?: string[];
  images?: string[];
};

type IconData = Awaited<ReturnType<typeof fetchSimpleIcons>>;

export function IconCloud({ iconSlugs, images }: DynamicCloudProps) {
  const [data, setData] = useState<IconData | null>(null);

  useEffect(() => {
    if (iconSlugs && iconSlugs.length > 0) {
      fetchSimpleIcons({ slugs: iconSlugs }).then(setData);
    }
  }, [iconSlugs]);

  const renderedIcons = useMemo(() => {
    if (data) {
      return Object.values(data.simpleIcons).map((icon) =>
        renderCustomIcon(icon, 'dark')
      );
    }
    return [];
  }, [data]);

  const renderedImages = useMemo(() => {
    if (images) {
      return images.map((image, index) => (
        <a key={index} href="#" onClick={(e) => e.preventDefault()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="42" width="42" alt="Tech icon" src={image} />
        </a>
      ));
    }
    return [];
  }, [images]);

  return (
    <Cloud {...cloudProps}>
      {renderedIcons}
      {renderedImages}
    </Cloud>
  );
}
