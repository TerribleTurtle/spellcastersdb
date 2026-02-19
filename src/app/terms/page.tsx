import Link from "next/link";

import { PageShell } from "@/components/layout/PageShell";

export const metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for SpellcastersDB. An unofficial, fan-made community database.",
};

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Service"
      maxWidth="4xl"
      breadcrumbs={[{ label: "Terms of Service", href: "/terms" }]}
    >
      <div className="space-y-8 text-text-secondary leading-relaxed">
        {/* Header */}
        <div className="bg-surface-card border border-border-default rounded-lg p-6">
          <p className="text-sm text-text-muted mb-4 uppercase tracking-widest font-mono">
            Last Updated: February 2026
          </p>
          <p className="text-lg">
            By accessing SpellcastersDB, you agree to these Terms of Service.
            Please read them carefully.
          </p>
        </div>

        {/* Unofficial Status */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            1. Unofficial Fan Project
          </h2>
          <p>
            SpellcastersDB is an unofficial, community-driven project created by
            fans of <strong>Spellcasters Chronicles</strong>.
          </p>
          <div className="mt-4 p-4 bg-surface-dim rounded-lg border border-border-subtle">
            <p className="font-semibold text-brand-primary mb-2">Disclaimer:</p>
            <p className="text-sm">
              We are not affiliated with, endorsed, sponsored, or specifically
              approved by the official developers or publishers of Spellcasters
              Chronicles. All game content, images, and assets are property of
              their respective owners.
            </p>
          </div>
        </section>

        {/* License */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            2. License & Open Source
          </h2>
          <p className="mb-4">
            The source code for this website is open source and available under
            the MIT License.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-2 ml-4 text-text-muted">
            <li>
              You may fork, modify, and contribute to the project on{" "}
              <a
                href="https://github.com/TerribleTurtle/spellcasters-community-api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline"
              >
                GitHub
              </a>
              .
            </li>
            <li>
              You may not use the &quot;SpellcastersDB&quot; branding or
              misrepresent yourself as an official partner.
            </li>
          </ul>
        </section>

        {/* User Content */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            3. User-Generated Content
          </h2>
          <p>When you create decks or use the deck builder:</p>
          <ul className="list-disc list-inside mt-4 space-y-2 ml-4 text-text-muted">
            <li>
              <strong>Storage:</strong> Your decks are stored locally on your
              device. We do not host or own your deck data.
            </li>
            <li>
              <strong>Sharing:</strong> If you share a deck via URL, you grant
              others permission to view and import that deck configuration.
            </li>
            <li>
              <strong>Responsibility:</strong> You are responsible for backing
              up your data (e.g., via export). We are not liable for data loss
              due to browser cache clearing or device failure.
            </li>
          </ul>
        </section>

        {/* Limitation of Liability */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            4. Limitation of Liability
          </h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY
            KIND.
          </p>
          <p className="mt-4">
            In no event shall the authors or copyright holders be liable for any
            claim, damages, or other liability, whether in an action of
            contract, tort or otherwise, arising from, out of or in connection
            with the software or the use or other dealings in the software.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-surface-card border border-border-default rounded-lg p-6 hover:border-border-strong transition-colors">
          <h2 className="text-2xl font-semibold mb-4 text-brand-accent">
            5. Contact
          </h2>
          <p>
            For legal inquiries or issues regarding copyright, please open an
            issue on our{" "}
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

        <div className="text-center pt-8">
          <Link
            href="/privacy"
            className="text-brand-secondary hover:text-brand-accent text-sm font-semibold transition-colors"
          >
            View Privacy Policy
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
