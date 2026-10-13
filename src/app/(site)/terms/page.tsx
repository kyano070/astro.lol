import type { Metadata } from 'next';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = { title: 'Terms' };

export default function TermsPage() {
  return (
    <InfoPage title="Terms of Service" updated="October 2026">
      <p>
        This is a starter document. Have it reviewed by a legal professional before launching publicly.
      </p>
      <h2>Using Astro.lol</h2>
      <ul>
        <li>You must be old enough to enter into an agreement in your country to create an account.</li>
        <li>You’re responsible for your account and everything on your profile.</li>
        <li>Don’t impersonate others, post illegal content, harass people, or spam.</li>
        <li>Only upload content you have the right to share (including music).</li>
      </ul>
      <h2>Moderation</h2>
      <p>
        We may remove content or suspend accounts that violate these terms. Visitors can report profiles; reports are reviewed manually.
      </p>
      <h2>Availability</h2>
      <p>The service is provided “as is”, without warranties. We may change or discontinue features at any time.</p>
    </InfoPage>
  );
}
