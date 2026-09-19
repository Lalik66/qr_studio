I want to add two related features to my React-based QR code generator app
(QR Studio). The app currently turns a URL into a customizable QR code and has
an EN/AZ language toggle.

BEFORE WRITING CODE: inspect the codebase to understand the current QR-generation
component, which QR library is used, how the input value flows into the QR, and
how the EN/AZ translations are structured. Match all existing patterns, styling,
and conventions.

── FEATURE 1: QR content types (scan behavior) ──
Currently the QR encodes a URL. Add a type selector letting the user choose what
the QR encodes:

- Link (existing behavior): encode the URL as-is.
- Phone: user enters a phone number; encode it as "tel:<number>" so scanning
  opens the phone's dialer with the number ready to call.
- Contact: user enters first name, last name, phone, email (org optional);
  encode a vCard 3.0 string so scanning offers "Save contact".

vCard format to build:
  BEGIN:VCARD
  VERSION:3.0
  N:<lastName>;<firstName>
  FN:<firstName> <lastName>
  TEL:<phone>
  EMAIL:<email>
  ORG:<org>
  END:VCARD

Build the correct string based on the selected type, then pass it to the existing
QR generator (do not replace the generator — just change the string fed into it).
Show the relevant input fields for each type. Sanitize inputs (e.g. strip spaces
from the phone number in the tel:/TEL value).

── FEATURE 2: Hover tooltip ──
Wrap the generated QR in a container and show a tooltip on hover that displays the
human-readable version of the SAME data (e.g. the formatted phone number, or
"Name — phone — email" for a contact). The QR string and the tooltip text must be
derived from the same input state so they can never fall out of sync. Tooltip is
hidden by default, appears on hover AND on keyboard focus (accessibility), and
degrades gracefully on touch devices where hover doesn't exist.

── REQUIREMENTS ──
- Keep existing customization (colors, logo, PNG/SVG export) working for all types.
- Both features must be driven by the same input state.
- All new UI text (type labels Link/Phone/Contact, field labels, tooltip prefixes
  like "Call:" / "Zəng et:", "Save contact" / "Əlaqə saxla") must go through the
  existing EN/AZ translation system — do not hardcode strings.
- Match the existing component structure and styling.

── ACCEPTANCE CRITERIA ──
- Selecting Phone and scanning the QR opens the dialer with the entered number.
- Selecting Contact and scanning offers to save a contact with the entered details.
- Hovering (or focusing) the QR shows the readable info, updating live as inputs change.
- The language toggle translates all new labels.
- Existing Link behavior and all export/customization options are unchanged.