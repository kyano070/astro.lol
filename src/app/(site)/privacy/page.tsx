import type { Metadata } from 'next';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = { title: 'Privacy' };

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" updated="October 2026">
      <p>
        This is a starter policy. Have it reviewed (and adapted to your situation and local law, e.g. GDPR) before launching publicly.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Account data: email address, username and a securely hashed password (handled by Supabase Auth).</li>
        <li>Profile content you choose to publish: name, bio, links, images and music.</li>
        <li>A simple visit counter per profile. We don’t store visitor identities.</li>
        <li>Reports you submit about other profiles.</li>
      </ul>
      <h2>Your control</h2>
      <p>
        You can set your profile to private at any time, edit or remove any content, and request deletion of your account by
        contacting us.
      </p>
      <h2>Sharing</h2>
      <p>
        Public profiles are visible to anyone. We don’t sell your data. Infrastructure providers (hosting and database) process data on our behalf.
      </p>
    </InfoPage>
  );
}
