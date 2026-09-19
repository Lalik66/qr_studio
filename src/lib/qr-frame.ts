// Shared, client- and server-safe layout logic for the optional decorative
// frame drawn AROUND a QR code (a styled border/card plus a "Scan me" caption).
//
// The frame is purely visual output styling: it is drawn entirely OUTSIDE the QR
// box — which already includes the mandatory quiet zone — so it never overlaps
// the modules and never changes what the code encodes.
//
// One layout function feeds every renderer so the on-screen preview, the
// exported SVG and the exported PNG all agree pixel-for-pixel in proportion:
//   - the form/list previews (DOM) in `framed-qr.tsx`
//   - the SVG export in `qr.ts`
//   - the PNG export, which rasterises that same SVG
//
// This module must stay free of server-only imports — it runs in the browser.

export const frameStyles = ["border", "card", "banner"] as const;
export type FrameStyle = (typeof frameStyles)[number];
export const defaultFrameStyle: FrameStyle = "border";

/** Narrow an untrusted value to a supported frame style, falling back to "border". */
export function resolveFrameStyle(value: string | null | undefined): FrameStyle {
  return (frameStyles as readonly string[]).includes(value ?? "")
    ? (value as FrameStyle)
    : defaultFrameStyle;
}

export const captionPositions = ["top", "bottom"] as const;
export type CaptionPosition = (typeof captionPositions)[number];
export const defaultCaptionPosition: CaptionPosition = "bottom";

/** Narrow an untrusted value to a caption position, falling back to "bottom". */
export function resolveCaptionPosition(
  value: string | null | undefined,
): CaptionPosition {
  return (captionPositions as readonly string[]).includes(value ?? "")
    ? (value as CaptionPosition)
    : defaultCaptionPosition;
}

/** The frame's stored settings, in one place every renderer reads. */
export type FrameOptions = {
  style: FrameStyle;
  caption: string;
  position: CaptionPosition;
  color: string; // hex like "#5B5FE9"
};

/** Cap on caption length — keeps the label legible and the layout predictable. */
export const MAX_CAPTION_LENGTH = 60;

/**
 * Pick black or white for text drawn on top of the frame colour, from its
 * perceived luminance, so the caption stays readable on any frame colour.
 * The two returned values are theme foreground/background inks.
 */
export function readableTextColor(hex: string): string {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) return "#FFFFFF";
  const int = parseInt(match[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0A0E1A" : "#FFFFFF";
}

/** A drawable caption band: where the text (and, for the banner, its bar) sits. */
export type CaptionLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  text: string;
  textColor: string;
  /** The banner style paints a colour bar behind the text; border/card don't. */
  drawBar: boolean;
};

/** Everything a renderer needs to draw the frame, in the QR box's pixel units. */
export type FrameLayout = {
  totalWidth: number;
  totalHeight: number;
  qrX: number;
  qrY: number;
  qrSize: number;
  radius: number;
  /** border/card fill the whole outer rounded rect with the frame colour. */
  drawBackground: boolean;
  frameColor: string;
  caption: CaptionLayout | null;
};

/**
 * Compute the frame layout for a QR box `qrSize` px wide. All measurements are
 * proportional to `qrSize`, so the same options describe a 200px preview and a
 * 1024px export identically.
 */
export function computeFrameLayout(
  qrSize: number,
  opts: FrameOptions,
): FrameLayout {
  const S = qrSize;
  const round = Math.round;
  const caption = opts.caption.trim().slice(0, MAX_CAPTION_LENGTH);
  const hasCaption = caption.length > 0;

  let basePad: number;
  let radius: number;
  let band: number;
  let drawBackground: boolean;
  let drawBar: boolean;

  switch (opts.style) {
    case "card":
      basePad = round(S * 0.08);
      radius = round(S * 0.1);
      band = round(S * 0.26);
      drawBackground = true;
      drawBar = false;
      break;
    case "banner":
      basePad = 0;
      radius = 0;
      band = round(S * 0.2);
      drawBackground = false;
      drawBar = true;
      break;
    case "border":
    default:
      basePad = round(S * 0.05);
      radius = round(S * 0.04);
      band = round(S * 0.22);
      drawBackground = true;
      drawBar = false;
      break;
  }

  // The banner always reserves its bar; border/card only widen one side into a
  // caption band when there's actually a caption to show.
  const captionSide = drawBar ? band : hasCaption ? band : basePad;
  const sidePad = basePad;
  const topPad =
    opts.position === "top" ? captionSide : drawBar ? 0 : basePad;
  const bottomPad =
    opts.position === "bottom" ? captionSide : drawBar ? 0 : basePad;

  const qrX = sidePad;
  const qrY = topPad;
  const totalWidth = S + sidePad * 2;
  const totalHeight = S + topPad + bottomPad;

  let captionLayout: CaptionLayout | null = null;
  const showCaption = drawBar || hasCaption;
  if (showCaption) {
    const region =
      opts.position === "top"
        ? { x: 0, y: 0, width: totalWidth, height: topPad }
        : { x: 0, y: qrY + S, width: totalWidth, height: bottomPad };

    let fontSize = round(S * 0.09);
    // Shrink the caption to fit the available width, never below a floor.
    const maxTextWidth = totalWidth - Math.max(sidePad * 2, round(S * 0.08));
    const approxWidth = caption.length * fontSize * 0.58;
    if (hasCaption && approxWidth > maxTextWidth) {
      fontSize = Math.max(
        round(fontSize * (maxTextWidth / approxWidth)),
        round(S * 0.045),
      );
    }

    captionLayout = {
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height,
      fontSize,
      text: caption,
      textColor: readableTextColor(opts.color),
      drawBar,
    };
  }

  return {
    totalWidth,
    totalHeight,
    qrX,
    qrY,
    qrSize: S,
    radius,
    drawBackground,
    frameColor: opts.color,
    caption: captionLayout,
  };
}
