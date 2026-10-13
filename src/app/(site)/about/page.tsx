import type { Metadata } from 'next';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <InfoPage title="About Astro.lol">
      <p>
        Astro.lol gives everyone a single, beautiful link for everything they are. Claim a username, add your socials, drop in
        some music and make the page truly yours — no code needed.
      </p>
      <h2>What we believe</h2>
      <ul>
        <li>Your page should look like you, not like a template.</li>
        <li>It should be fast, accessible and work on every screen.</li>
        <li>You stay in control: you decide what’s public and what’s private.</li>
      </ul>
    </InfoPage>
  );
}
