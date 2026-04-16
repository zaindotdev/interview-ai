import React from "react";
import { Container, Heading, Hr, Link, Text } from "@react-email/components";

interface VerificationEmailProps {
  name: string;
  verificationToken: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const VerificationEmail: React.FC<VerificationEmailProps> = ({
  name,
  verificationToken,
}) => {
  const containerStyle = {
    background: "#fff",
    padding: "32px",
    borderRadius: "8px",
    fontFamily: "sans-serif",
  };

  const headingStyle = {
    color: "#ff6600",
    marginBottom: "16px",
  };

  const textStyle = {
    fontSize: "16px",
    marginBottom: "16px",
  };

  const secondaryTextStyle = {
    fontSize: "14px",
    color: "#888",
    marginTop: "24px",
  };

  return (
    <Container style={containerStyle}>
      <Heading as="h2" style={headingStyle}>
        Welcome to Interview AI!
      </Heading>
      <Text style={textStyle}>
        Hi <b>{name}</b>,
      </Text>
      <Text style={textStyle}>
        Thank you for signing up. Please verify your email address to activate
        your account.
      </Text>
      <Link href={`${APP_URL}/verify?token=${verificationToken}`} style={{ ...textStyle, color: "#ff6600" }}>
        Complete your verification
      </Link>
      <Hr />
      <Text style={secondaryTextStyle}>
        If you did not sign up for Interview AI, you can safely ignore this
        email.
      </Text>
    </Container>
  );
};

export default VerificationEmail;
