import React from "react";
import {
  Container,
  Heading,
  Hr,
  Text,
  Section,
  Row,
  Column,
  Html,
  Head,
  Body,
  Preview,
} from "@react-email/components";

interface ContactEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt?: string;
}

export const ContactEmail: React.FC<ContactEmailProps> = ({
  name,
  email,
  subject,
  message,
  receivedAt = new Date().toUTCString(),
}) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>New contact message from {name}: {subject}</Preview>
      <Body style={body}>
        <Container style={container}>

          <Section style={accentBar} />

          {/* Header */}
          <Section style={header}>
            <Heading as="h1" style={logo}>Interview AI</Heading>
            <Text style={logoSub}>Support Inbox</Text>
          </Section>

          <Hr style={divider} />

          {/* Title */}
          <Section style={titleSection}>
            <Text style={pill}>📬 New Message</Text>
            <Heading as="h2" style={title}>{subject}</Heading>
            <Text style={timestamp}>Received: {receivedAt}</Text>
          </Section>

          <Hr style={divider} />

          {/* Sender info */}
          <Section style={infoGrid}>
            <Row>
              <Column style={infoCell}>
                <Text style={infoLabel}>Full Name</Text>
                <Text style={infoValue}>{name}</Text>
              </Column>
              <Column style={infoCell}>
                <Text style={infoLabel}>Email Address</Text>
                <Text style={{ ...infoValue, color: "#b84a00" }}>
                  <a href={`mailto:${email}`} style={emailLink}>{email}</a>
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Message body */}
          <Section style={messageSection}>
            <Text style={infoLabel}>Message</Text>
            <Section style={messageBox}>
              <Text style={messageText}>{message}</Text>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Reply CTA */}
          <Section style={ctaSection}>
            <Text style={ctaHint}>
              Reply directly to this email to respond to {name}.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Interview AI · <a href="https://interview-ai.live" style={footerLink}>interview-ai.live</a>
            </Text>
            <Text style={footerText}>
              This message was submitted via the contact form.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

export default ContactEmail;

// ─── Styles ───────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#f4f0eb",
  fontFamily: "'Georgia', 'Times New Roman', serif",
  margin: 0,
  padding: "32px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  maxWidth: "580px",
  margin: "0 auto",
  borderRadius: "4px",
  overflow: "hidden",
  border: "1px solid #e0d8cf",
};

const accentBar: React.CSSProperties = {
  backgroundColor: "#c1440e",
  height: "4px",
  width: "100%",
};

const header: React.CSSProperties = {
  padding: "28px 40px 20px",
  backgroundColor: "#1a1410",
};

const logo: React.CSSProperties = {
  color: "#f5f0ea",
  fontSize: "22px",
  fontWeight: "700",
  letterSpacing: "0.5px",
  margin: "0 0 2px 0",
};

const logoSub: React.CSSProperties = {
  color: "#9a8a78",
  fontSize: "12px",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  margin: "0",
};

const divider: React.CSSProperties = {
  borderColor: "#ede8e1",
  margin: "0",
};

const titleSection: React.CSSProperties = {
  padding: "28px 40px 20px",
};

const pill: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#fff4ee",
  color: "#c1440e",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.5px",
  padding: "4px 10px",
  borderRadius: "20px",
  border: "1px solid #f5c9b3",
  margin: "0 0 12px 0",
};

const title: React.CSSProperties = {
  color: "#1a1410",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 8px 0",
  lineHeight: "1.3",
};

const timestamp: React.CSSProperties = {
  color: "#9a8a78",
  fontSize: "12px",
  margin: "0",
  letterSpacing: "0.3px",
};

const infoGrid: React.CSSProperties = {
  padding: "20px 40px",
  backgroundColor: "#faf8f5",
};

const infoCell: React.CSSProperties = {
  width: "50%",
  verticalAlign: "top",
  paddingRight: "16px",
};

const infoLabel: React.CSSProperties = {
  color: "#9a8a78",
  fontSize: "11px",
  letterSpacing: "1.5px",
  textTransform: "uppercase" as const,
  margin: "0 0 4px 0",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
};

const infoValue: React.CSSProperties = {
  color: "#1a1410",
  fontSize: "15px",
  fontWeight: "600",
  margin: "0",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
};

const emailLink: React.CSSProperties = {
  color: "#c1440e",
  textDecoration: "none",
};

const messageSection: React.CSSProperties = {
  padding: "24px 40px",
};

const messageBox: React.CSSProperties = {
  backgroundColor: "#faf8f5",
  border: "1px solid #ede8e1",
  borderLeft: "3px solid #c1440e",
  borderRadius: "2px",
  padding: "20px 24px",
  marginTop: "10px",
};

const messageText: React.CSSProperties = {
  color: "#3a2e26",
  fontSize: "15px",
  lineHeight: "1.7",
  whiteSpace: "pre-wrap" as const,
  margin: "0",
};

const ctaSection: React.CSSProperties = {
  padding: "16px 40px 24px",
  textAlign: "center" as const,
};

const ctaHint: React.CSSProperties = {
  color: "#9a8a78",
  fontSize: "13px",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  margin: "0",
};

const footer: React.CSSProperties = {
  backgroundColor: "#f4f0eb",
  padding: "20px 40px",
  borderTop: "1px solid #ede8e1",
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  color: "#b0a090",
  fontSize: "12px",
  margin: "2px 0",
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
};

const footerLink: React.CSSProperties = {
  color: "#c1440e",
  textDecoration: "none",
};