/* eslint-disable prettier/prettier */
import { Body, Heading, Link, Tailwind, Text } from '@react-email/components';
import { Html } from '@react-email/html';

interface ConfirmationTemplateProps {
  domain: string;
  token: string;
}

export function ConfirmationTemplate({
  domain,
  token,
}: ConfirmationTemplateProps) {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  return (
    <Tailwind>
      <Html>
        <Body className='text-black'>
          <Heading>Email Confirmation</Heading>
          <Text>
            Hi! To confirm your email address, please click the following link:
          </Text>
          <Link href={confirmLink}>Confirm Email</Link>
          <Text>
            This link is valid for 1 hour. If you did not request confirmation,
            please ignore this message.
          </Text>
          <Text>Thank you for using our service!</Text>
        </Body>
      </Html>
    </Tailwind>
  );
}
