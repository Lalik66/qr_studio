import { Body, Button, Container, Head, Heading, Html, Preview, Text } from "react-email";

export default function ResetPassword({ url, name }: { url: string; name?: string }) {
  return (
    <Html>
      <Head />
      <Preview>Reset your QR Studio password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>QR Studio</Heading>
          <Text style={text}>Hi{name ? ` ${name}` : ""},</Text>
          <Text style={text}>
            We got a request to reset your password. Choose a new one using the button
            below — the link is good for one hour.
          </Text>
          <Button href={url} style={button}>
            Reset password
          </Button>
          <Text style={muted}>
            If you didn&apos;t ask to reset your password, you can ignore this email and
            nothing will change.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { fontFamily: "Inter, Arial, sans-serif", backgroundColor: "#0A0E1A", padding: "24px 0" };
const container = { maxWidth: 480, margin: "0 auto", padding: "32px", backgroundColor: "#151A28", borderRadius: 16 };
const heading = { color: "#5B5FE9", fontSize: 20, fontWeight: 700, margin: "0 0 16px" };
const text = { color: "#FFFFFF", fontSize: 15, lineHeight: "1.6", margin: "0 0 12px" };
const button = { display: "inline-block", background: "#5B5FE9", color: "#FFFFFF", fontSize: 15, fontWeight: 600, padding: "12px 22px", borderRadius: 12, textDecoration: "none", margin: "8px 0 20px" };
const muted = { color: "#AEB4C2", fontSize: 13, lineHeight: "1.6", margin: 0 };
