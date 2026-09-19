"use client";

import { computeFrameLayout, type FrameOptions } from "@/lib/qr-frame";

type FramedQrProps = {
  /** Rendered width of the QR box in px; the frame scales around it. */
  size: number;
  frame: FrameOptions;
  /** The QR itself, rendered at exactly `size` px. */
  children: React.ReactNode;
};

/**
 * The on-screen mirror of the exported frame: it lays the QR box, border/card/
 * banner and caption out with the same `computeFrameLayout` the SVG/PNG export
 * uses, so the preview matches the download. The frame colour is per-code data,
 * so it's applied inline (like the QR content colours), not via a theme token.
 */
export function FramedQr({ size, frame, children }: FramedQrProps) {
  const layout = computeFrameLayout(size, frame);
  const { caption } = layout;

  return (
    <div
      style={{
        position: "relative",
        width: layout.totalWidth,
        height: layout.totalHeight,
        borderRadius: layout.radius,
        backgroundColor: layout.drawBackground
          ? layout.frameColor
          : "transparent",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: layout.qrX,
          top: layout.qrY,
          width: layout.qrSize,
          height: layout.qrSize,
          lineHeight: 0,
        }}
      >
        {children}
      </div>

      {caption && (
        <div
          style={{
            position: "absolute",
            left: caption.x,
            top: caption.y,
            width: caption.width,
            height: caption.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 6px",
            backgroundColor: caption.drawBar ? layout.frameColor : "transparent",
          }}
        >
          {caption.text && (
            <span
              style={{
                fontSize: caption.fontSize,
                fontWeight: 600,
                lineHeight: 1.1,
                color: caption.textColor,
                textAlign: "center",
                maxWidth: "100%",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {caption.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
