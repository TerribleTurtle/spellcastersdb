import Link from "next/link";

import { ChevronDown, ExternalLink } from "lucide-react";

import { JsonLd } from "@/components/common/JsonLd";
import { PageShell } from "@/components/layout/PageShell";

export const metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about SpellcastersDB, the community database for Spellcasters Chronicles. Learn how to use the site and contribute.",
  keywords: ["Spellcasters Chronicles", "FAQ", "Questions", "Help", "Guide"],
};

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  schemaAnswer?: string;
}

export default function FAQPage() {
  const faqs: FAQItem[] = [
    {
      question: "What is SpellcastersDB?",
      answer:
        "SpellcastersDB is a community-driven database and deck builder for Spellcasters Chronicles. It provides comprehensive information about all units, Spellcasters, and consumables in the game, along with tools to help you build and share decks.",
    },
    {
      question: "Is this an official website?",
      answer:
        "No, SpellcastersDB is an unofficial, fan-made project created by the community. It is not affiliated with or endorsed by the official Spellcasters Chronicles development team.",
    },
    {
      question: "How is the data updated?",
      answer: (
        <>
          All game data comes from the{" "}
          <a
            href="https://github.com/TerribleTurtle/spellcasters-community-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:text-brand-accent transition-colors inline-flex items-center gap-1"
          >
            Spellcasters Community API
            <ExternalLink size={14} />
          </a>
          , which is maintained by community members. The website automatically
          fetches the latest data from the API, so information stays current as
          the game evolves.
        </>
      ),
      schemaAnswer:
        "All game data comes from the Spellcasters Community API, which is maintained by community members. The website automatically fetches the latest data from the API, so information stays current as the game evolves.",
    },
    {
      question: "Can I contribute to the project?",
      answer: (
        <>
          Yes! You can contribute to the{" "}
          <a
            href="https://github.com/TerribleTurtle/spellcasters-community-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:text-brand-accent transition-colors inline-flex items-center gap-1"
          >
            Community API repository
            <ExternalLink size={14} />
          </a>{" "}
          by submitting corrections, adding missing data, or improving
          documentation. All contributions are welcome!
        </>
      ),
      schemaAnswer:
        "Yes! You can contribute to the Community API repository by submitting corrections, adding missing data, or improving documentation. All contributions are welcome!",
    },
    {
      question: "How do I report incorrect data?",
      answer: (
        <>
          If you find incorrect or outdated information, please report it on the{" "}
          <a
            href="https://github.com/TerribleTurtle/spellcasters-community-api/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary hover:text-brand-accent transition-colors inline-flex items-center gap-1"
          >
            GitHub Issues page
            <ExternalLink size={14} />
          </a>
          . Include as much detail as possible about the error and the correct
          information.
        </>
      ),
      schemaAnswer:
        "If you find incorrect or outdated information, please report it on the GitHub Issues page. Include as much detail as possible about the error and the correct information.",
    },
    {
      question: "How do I use the deck builder?",
      answer:
        "The Deck Builder is now live! you can select a spellcaster and add incantations to create valid decks that follow the game's rules. Decks will be shareable via URL. Access it from the home page or sidebar.",
    },
    {
      question: "Can I filter cards by type or faction?",
      answer:
        "Yes! The Archive page includes search and filter options. You can filter cards by type (creature, spell, building, titan), rank, faction, and more. Use the search bar to find specific cards by name.",
    },
    {
      question: "Is the website mobile-friendly?",
      answer:
        "Yes. SpellcastersDB is designed to work on all devices, from desktop computers to smartphones. The interface adapts to your screen size.",
    },
    {
      question: "Will there be more features in the future?",
      answer:
        "Yes! Future updates may include more advanced deck analysis tools. Check back regularly for updates!",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text:
          faq.schemaAnswer ||
          (typeof faq.answer === "string" ? faq.answer : ""),
      },
    })),
  };

  return (
    <PageShell
      title="Frequently Asked Questions"
      maxWidth="4xl"
      breadcrumbs={[{ label: "FAQ", href: "/faq" }]}
    >
      <JsonLd data={faqSchema} id="json-ld-faq" />
      <div className="space-y-4 mb-8">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="bg-surface-card border border-border-default rounded-lg overflow-hidden group hover:border-border-strong transition-colors"
          >
            <summary className="px-6 py-4 cursor-pointer font-semibold text-text-secondary hover:text-brand-accent transition-colors list-none flex items-center justify-between">
              <span>{faq.question}</span>
              <span className="text-brand-primary group-open:rotate-180 transition-transform">
                <ChevronDown size={20} />
              </span>
            </summary>
            <div className="px-6 pb-4 text-text-secondary leading-relaxed border-t border-border-default pt-4">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>

      {/* Additional Help */}
      <div className="bg-surface-card border border-border-default rounded-lg p-6 mb-8 hover:border-border-strong transition-colors">
        <h2 className="text-xl font-semibold mb-3 text-brand-accent">
          Still have questions?
        </h2>
        <p className="text-text-secondary mb-4">
          If you have a question that isn&apos;t answered here, feel free to
          reach out through the Community API GitHub repository or check the{" "}
          <Link
            href="/about"
            className="text-brand-primary hover:text-brand-accent transition-colors"
          >
            About page
          </Link>{" "}
          for more information.
        </p>
      </div>

      {/* Back to Home */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-linear-to-r from-brand-primary to-brand-secondary text-text-primary font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    </PageShell>
  );
}
