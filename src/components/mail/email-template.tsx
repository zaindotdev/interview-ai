import * as React from 'react';
import { Section, Text, Link, Button } from "@react-email/components"
interface EmailTemplateProps {
    name: string;
    callbackUrl: string;
}

export function EmailTemplate({ name, callbackUrl }: EmailTemplateProps) {
    return (
        <Section>
            <Text>
                Hello, {name}!
            </Text>
            <Text>
                To complete your registration, please confirm your email address by clicking the link below. Verifying your email helps us ensure the security of your account and provide you with the best possible experience. If you require any assistance, feel free to contact our support team.
            </Text>
            <Link href={callbackUrl} target='_blank'>
                <Button>
                    <Text>
                        Verify Email
                    </Text>
                </Button>
            </Link>
        </Section>
    );
}