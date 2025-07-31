import React from "react";
import { Button, Container, Heading, Hr, Text } from "@react-email/components";

interface VerificationEmailProps {
  name: string;
  verificationLink: string;
}

const VerificationEmail: React.FC<VerificationEmailProps> = ({
  name,
  verificationLink,
}) => (
  <Container style={{ background: "#fff", padding: "32px", borderRadius: "8px", fontFamily: "sans-serif" }}>
    <Heading as="h2" style={{ color: "#ff6600", marginBottom: "16px" }}>
      Welcome to Interview AI!
    </Heading>
    <Text style={{ fontSize: "16px", marginBottom: "16px" }}>
      Hi <b>{name}</b>,
    </Text>
    <Text style={{ fontSize: "16px", marginBottom: "16px" }}>
      Thank you for signing up. Please verify your email address to activate your account.
    </Text>
    <Button
      href={verificationLink}
      style={{
        background: "#ff6600",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "6px",
        fontWeight: "bold",
        textDecoration: "none",
        marginBottom: "24px",
        display: "inline-block",
      }}
    >
      Verify Email
    </Button>
    <Hr />
    <Text style={{ fontSize: "14px", color: "#888", marginTop: "24px" }}>
      If you did not sign up for Interview AI, you can safely ignore this email.
    </Text>
  </Container>
);

export default VerificationEmail; 