"use client";

import { useMemo } from "react";
import QRCode from "qrcode";

import { cn } from "@/lib/utils";

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
  testId?: string;
  label: string;
}

export function QrCodeSvg({
  value,
  size = 128,
  className,
  testId,
  label,
}: QrCodeSvgProps): React.JSX.Element {
  const svgPath = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
    const moduleSize = qr.modules.size;
    const cellSize = size / moduleSize;
    let path = "";

    for (let row = 0; row < moduleSize; row++) {
      for (let col = 0; col < moduleSize; col++) {
        if (!qr.modules.get(row, col)) continue;
        const x = col * cellSize;
        const y = row * cellSize;
        path += `M${x} ${y}h${cellSize}v${cellSize}h-${cellSize}z`;
      }
    }

    return path;
  }, [size, value]);

  return (
    <svg
      className={cn(className)}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      data-testid={testId}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={size} height={size} fill="white" />
      <path d={svgPath} fill="black" />
    </svg>
  );
}
