import React from "react";
import { Button, Container, Heading, Hr, Text } from "@react-email/components";

interface VerificationEmailProps {
  name: string;
  otp: string;
  otpExpiry: string;
}

const VerificationEmail: React.FC<VerificationEmailProps> = ({
  name,
  otp,
  otpExpiry,
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
      <Text style={textStyle}>{otp}</Text>
      <Text style={textStyle}>
        This OTP will expire on <b>{new Date(otpExpiry).toDateString()}</b>.
      </Text>
      <Hr />
      <Text style={secondaryTextStyle}>
        If you did not sign up for Interview AI, you can safely ignore this
        email.
      </Text>
    </Container>
  );
};

export default VerificationEmail;
