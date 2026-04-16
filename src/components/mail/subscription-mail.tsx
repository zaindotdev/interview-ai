import React from "react";
import {
  Container,
  Heading,
  Hr,
  Text,
  Section,
  Row,
  Column,
} from "@react-email/components";

interface SubscriptionCompleteEmailProps {
  name: string;
  plan: string;
  amount: string;
  currency?: string;
  billingCycle: "monthly" | "yearly";
  startDate: string;
  nextBillingDate: string;
  transactionId: string;
  paymentMethod: string;
}

export const SubscriptionCompleteEmail: React.FC<SubscriptionCompleteEmailProps> = ({
  name,
  plan,
  amount,
  currency = "USD",
  billingCycle,
  startDate,
  nextBillingDate,
  transactionId,
  paymentMethod,
}) => {
  const containerStyle = {
    background: "#fff",
    padding: "32px",
    borderRadius: "8px",
    fontFamily: "sans-serif",
    maxWidth: "560px",
    margin: "0 auto",
  };

  const headingStyle = {
    color: "#ff6600",
    marginBottom: "8px",
  };

  const subHeadingStyle = {
    fontSize: "15px",
    color: "#555",
    marginBottom: "24px",
    marginTop: "0px",
  };

  const textStyle = {
    fontSize: "16px",
    marginBottom: "16px",
    color: "#222",
  };

  const receiptBoxStyle = {
    background: "#f9f9f9",
    borderRadius: "6px",
    padding: "20px 24px",
    marginBottom: "24px",
    border: "1px solid #eee",
  };

  const receiptLabelStyle = {
    fontSize: "13px",
    color: "#888",
    marginBottom: "2px",
  };

  const receiptValueStyle = {
    fontSize: "15px",
    color: "#222",
    fontWeight: "600",
    marginBottom: "14px",
  };

  const totalRowStyle = {
    borderTop: "1px solid #ddd",
    paddingTop: "14px",
    marginTop: "4px",
  };

  const totalLabelStyle = {
    fontSize: "15px",
    fontWeight: "700",
    color: "#222",
  };

  const totalAmountStyle = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#ff6600",
    textAlign: "right" as const,
  };

  const badgeStyle = {
    display: "inline-block",
    background: "#fff4ec",
    color: "#ff6600",
    border: "1px solid #ff6600",
    borderRadius: "12px",
    padding: "2px 12px",
    fontSize: "13px",
    fontWeight: "600",
    marginLeft: "8px",
    verticalAlign: "middle",
  };

  const secondaryTextStyle = {
    fontSize: "13px",
    color: "#aaa",
    marginTop: "8px",
  };

  return (
    <Container style={containerStyle}>
      {/* Header */}
      <Heading as="h2" style={headingStyle}>
        Interview AI
      </Heading>
      <Text style={subHeadingStyle}>Subscription Confirmation & Receipt</Text>

      {/* Greeting */}
      <Text style={textStyle}>
        Hi <b>{name}</b>,
      </Text>
      <Text style={textStyle}>
        Your subscription is now active. Here's a summary of your purchase.
        <span style={badgeStyle}>✓ Paid</span>
      </Text>

      {/* Receipt Box */}
      <Section style={receiptBoxStyle}>
        {/* Plan */}
        <Text style={receiptLabelStyle}>Plan</Text>
        <Text style={receiptValueStyle}>
          {plan}{" "}
          <span style={{ fontWeight: "400", color: "#888", fontSize: "13px" }}>
            ({billingCycle === "monthly" ? "Billed Monthly" : "Billed Yearly"})
          </span>
        </Text>

        {/* Dates */}
        <Row>
          <Column>
            <Text style={receiptLabelStyle}>Start Date</Text>
            <Text style={receiptValueStyle}>
              {new Date(startDate).toDateString()}
            </Text>
          </Column>
          <Column>
            <Text style={receiptLabelStyle}>Next Billing Date</Text>
            <Text style={receiptValueStyle}>
              {new Date(nextBillingDate).toDateString()}
            </Text>
          </Column>
        </Row>

        {/* Payment */}
        <Text style={receiptLabelStyle}>Payment Method</Text>
        <Text style={receiptValueStyle}>{paymentMethod}</Text>

        {/* Transaction ID */}
        <Text style={receiptLabelStyle}>Transaction ID</Text>
        <Text style={{ ...receiptValueStyle, fontFamily: "monospace" }}>
          {transactionId}
        </Text>

        {/* Total */}
        <Row style={totalRowStyle}>
          <Column>
            <Text style={totalLabelStyle}>Total Charged</Text>
          </Column>
          <Column>
            <Text style={totalAmountStyle}>
              {currency} {amount}
            </Text>
          </Column>
        </Row>
      </Section>

      <Hr />

      {/* Footer */}
      <Text style={secondaryTextStyle}>
        If you have any questions about your subscription, please contact us at{" "}
        <a href="mailto:support@interviewai.com" style={{ color: "#ff6600" }}>
          support@interviewai.com
        </a>
        .
      </Text>
      <Text style={secondaryTextStyle}>
        If you did not make this purchase, please contact us immediately.
      </Text>
    </Container>
  );
};