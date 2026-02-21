import { PageShell } from "@/components/layout/PageShell";
import { ClearDataButton } from "@/components/privacy/ClearDataButton";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for SpellcastersDB. We prioritize your privacy with minimal data collection and no tracking cookies.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy Policy"
      maxWidth="4xl"
      breadcrumbs={[{ label: "Privacy Policy", href: "/privacy" }]}
    >
      <div className="space-y-8 text-text-secondary leading-relaxed">
        {/* Last Updated */}
        <div className="bg-surface-card border border-border-default rounded-lg p-6">
          <p className="text-sm text-text-muted mb-4 uppercase tracking-widest font-mono">
            Last Updated: February 2026
          </p>
          <p className="text-lg">
            SpellcastersDB (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
            respects your privacy. This Privacy Policy explains how we collect,
            use, and protect your information when you use our website.
          </p>
          <p className="mt-4 font-semibold text-brand-primary">
            TL;DR: We don&apos;t create user accounts, we don&apos;t sell your
            data, and your decks are stored locally on your device.
          </p>
        </div>

        {/* Data Collection */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            Data Collection & Storage
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-secondary"></span>
                Local Storage
              </h3>
              <p className="mb-2">
                This website uses your browser&apos;s{" "}
                <strong>Local Storage</strong> to save your preferences. This
                allows you to revisit the site and keep your data without
                logging in.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-text-muted">
                <li>Created decks and drafts</li>
                <li>Theme settings (Light/Dark mode)</li>
                <li>Filter preferences in the database</li>
              </ul>
              <p className="mt-3 text-sm text-text-dimmed italic">
                This data never leaves your device unless you explicitly share a
                deck via URL or export string. You can permanently delete all
                saved data by clearing your browser&apos;s site data or local
                storage via your browser&apos;s settings (e.g., in Chrome:
                Settings &gt; Privacy and security &gt; Site settings, or by
                using the &quot;Clear browsing data&quot; tool).
              </p>
              <ClearDataButton />
            </div>

            <div className="border-t border-border-subtle pt-6">
              <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                Analytics &amp; Performance
              </h3>
              <p className="mb-2">
                We use <strong>Vercel Analytics</strong> and{" "}
                <strong>Vercel Speed Insights</strong> to understand website
                traffic and monitor performance. They collect anonymous data
                such as:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-text-muted">
                <li>Page views and navigation patterns</li>
                <li>Core Web Vitals (load times, responsiveness)</li>
                <li>Device type (Desktop/Mobile)</li>
                <li>Country of origin</li>
              </ul>
              <p className="mt-3 text-sm text-text-dimmed italic">
                This data is aggregated and does not identify you personally.
                Both services are privacy-friendly and do not use cookies.
              </p>
            </div>

            <div className="border-t border-border-subtle pt-6">
              <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                Error Monitoring (Sentry)
              </h3>
              <p className="mb-2">
                We use <strong>Sentry</strong> to track and monitor application
                errors and prevent crashes. Our Sentry configuration is strictly
                configured for privacy:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-text-muted">
                <li>No cookies or session replays are used</li>
                <li>
                  All Personally Identifiable Information (PII) such as IP
                  addresses, emails, and session tokens is stripped before data
                  is sent
                </li>
                <li>
                  Error data is routed through our own server rather than
                  directly to Sentry, preventing third-party network requests
                  from your browser
                </li>
              </ul>
              <p className="mt-3 text-sm text-text-dimmed italic">
                This ensures that error logs contain only technical diagnostic
                data and no personal details.
              </p>
            </div>

            <div className="border-t border-border-subtle pt-6">
              <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                Rate Limiting
              </h3>
              <p className="mb-2">
                To protect against abuse, certain API routes use rate-limiting
                powered by Upstash Redis. We ensure your privacy by applying a
                <strong> one-way cryptographic hash</strong> to your IP address
                before it is used.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-text-muted">
                <li>
                  Your actual IP address is <strong>never</strong> sent to or
                  stored in the rate-limiting database
                </li>
                <li>
                  The anonymized hash (which cannot be reversed back to your IP)
                  is retained for a maximum of 10 seconds and then automatically
                  flushed
                </li>
              </ul>
            </div>

            <div className="border-t border-border-subtle pt-6">
              <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                Feedback (Tally)
              </h3>
              <p className="mb-2">
                We embed a <strong>Tally.so</strong> widget to optionally
                collect user feedback. Any information you choose to provide in
                the feedback form is processed and stored by Tally&apos;s
                servers securely.
              </p>
              <p className="mt-3 text-sm text-text-dimmed italic">
                When you open the feedback form, the current page URL
                (containing only game state data, such as the cards in your
                deck) is automatically included as context. This URL does not
                contain any personal identifiers. No other personal data is
                sent.
              </p>
            </div>
          </div>
        </section>

        {/* Third Party Links */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            Third-Party Links
          </h2>
          <p className="mb-4">
            Our website contains links to third-party websites for game
            resources and community interaction. These include:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-4 text-text-muted">
            <li>Steam (Valve Corporation)</li>
            <li>Discord</li>
            <li>GitHub</li>
          </ul>
          <p className="mt-4 text-sm">
            We are not responsible for the privacy practices of these external
            sites. We encourage you to review their respective privacy policies.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            Contact & Updates
          </h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated &quot;Last Updated&quot;
            date.
          </p>
          <p>
            If you have questions about this policy, please reach out via our{" "}
            <a
              href="https://github.com/TerribleTurtle/spellcasters-community-api/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-primary hover:text-brand-accent underline transition-colors"
            >
              GitHub Repository
            </a>
            .
          </p>
        </section>
      </div>
    </PageShell>
  );
}
