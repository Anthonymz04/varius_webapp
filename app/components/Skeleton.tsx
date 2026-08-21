'use client';

import { CSSProperties } from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
}

export default function Skeleton({
  width = '100%',
  height = 14,
  radius = 8,
  style,
}: SkeletonProps) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />;
}
