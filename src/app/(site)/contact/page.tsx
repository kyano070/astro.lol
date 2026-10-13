import type { Metadata } from 'next';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <InfoPage title="Contact">
      <p>Questions, feedback or something to report? We’d love to hear from you.</p>
      <ul>
        <li>
          General &amp; support: <a href="mailto:hello@astro.lol">hello@astro.lol</a>
        </li>
        <li>
          Abuse &amp; takedown requests: <a href="mailto:abuse@astro.lol">abuse@astro.lol</a>
        </li>
      </ul>
      <p>To report a specific profile, use the “Report” button on that profile’s page.</p>
    </InfoPage>
  );
}
