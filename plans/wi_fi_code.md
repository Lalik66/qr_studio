WiFi QR type**

```
Add a "WiFi" content type to my React-based QR code generator (QR Studio),
following the exact same pattern as the existing Phone and Contact types.

BEFORE WRITING CODE: inspect the codebase to see how the existing type selector,
input fields, QR-string builder, EN/AZ translations, and (if present) the Drizzle
schema / database are structured. Match all existing patterns and conventions.

── WHAT IT DOES ──
A new "WiFi" option in the type selector lets the user create a QR that, when
scanned, prompts the phone to auto-connect to a WiFi network.

Input fields for this type:
- Network name (SSID) — required, text
- Password — text; hide it behind a show/hide toggle
- Encryption — dropdown: WPA/WPA2 (default), WEP, None (open network)
- Hidden network — checkbox, default false

── ENCODED STRING ──
Build this string and feed it to the existing QR generator (do not modify the
generator itself):

  WIFI:T:<encryption>;S:<ssid>;P:<password>;H:<true|false>;;

Rules:
- <encryption> = WPA for WPA/WPA2, WEP for WEP, nopass for None.
- If encryption is None, omit the password entirely (WIFI:T:nopass;S:<ssid>;;).
- Escape special characters in SSID and password per the WiFi QR spec: a
  backslash, semicolon, comma, colon, and double-quote must each be prefixed
  with a backslash (\).
- Only include H:true when "hidden network" is checked; otherwise you may omit it.

── OTHER REQUIREMENTS ──
- Keep existing customization (colors, logo, PNG/SVG export) and the hover tooltip
  working for this type. For the tooltip, show a readable summary like
  "WiFi: <ssid>" — never display the password in the tooltip.
- All new UI text (the "WiFi" label, field labels, encryption options, show/hide
  toggle) must go through the existing EN/AZ translation system — no hardcoded strings.
- If QR records are persisted to a database, add whatever columns/fields are needed
  for this type and apply the schema change to the database (drizzle push or a
  migration), making new columns nullable so existing rows are unaffected.

── ACCEPTANCE CRITERIA ──
- Selecting WiFi, filling in the fields, and scanning the QR prompts a real phone
  to join the network.
- Open networks (None) generate a valid password-less string that still connects.
- Special characters in SSID/password are escaped and still work.
- The language toggle translates all new labels.
- All existing types and export/customization options are unchanged.
