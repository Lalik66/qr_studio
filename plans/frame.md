Frames with a call-to-action

```
Add an optional decorative FRAME around the generated QR code in my React-based
QR generator (QR Studio), with a "Scan me" call-to-action label. This is a visual
enhancement to the rendered/exported output — it must not change what the QR encodes.

BEFORE WRITING CODE: inspect how the QR is currently rendered and how PNG/SVG
export works, plus the EN/AZ translation setup. The frame MUST be included in the
exported PNG and SVG, not just shown on screen — verify how export is implemented
before choosing an approach.

── WHAT IT DOES ──
A "Frame" section in the controls lets the user optionally wrap the QR in a styled
border with a caption.

Controls:
- Frame on/off toggle (default off — existing plain output stays the default).
- Style: at least 3 options, e.g. "Simple border", "Rounded card", "Bottom banner"
  (a solid bar under the QR holding the caption text).
- Caption text — editable, with a sensible default from translations
  ("Scan me" / "Skan et").
- Caption position — top or bottom.
- Frame color — reuse the existing color-picker component so it matches the app.

── REQUIREMENTS ──
- The frame + caption must render identically on screen AND in the exported PNG and
  SVG. This is the critical part: if export is canvas- or SVG-based, the frame must
  be drawn into that same output, not layered only in the DOM.
- Keep the QR itself fully scannable — the frame must not overlap the QR modules or
  its quiet zone (the mandatory blank margin). Add the caption/border OUTSIDE that
  margin.
- Default caption text and any preset labels go through the existing EN/AZ
  translation system — no hardcoded strings.
- Keep all existing options (colors, logo, all content types, tooltip) working with
  frames on or off.

── ACCEPTANCE CRITERIA ──
- Turning the frame on wraps the QR with the chosen style and caption; turning it
  off returns the exact original output.
- Exported PNG and SVG both contain the frame and caption, matching the on-screen preview.
- The framed QR still scans reliably.
- The language toggle translates the caption and preset labels.
Two things worth flagging before you send them:

The frame prompt has one real risk baked in — getting the frame into the **exported file** (not just the on-screen preview) is the part agents most often get wrong, which is why I made it explicit twice. When you test, don't just check that it looks right in the browser; download the PNG and the SVG and open them to confirm the frame is actually there.
