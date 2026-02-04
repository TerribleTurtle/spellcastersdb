import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about SpellcastersDB, the community database for Spellcasters Chronicles. Learn how to use the site and contribute.",
  keywords: ["Spellcasters Chronicles", "FAQ", "Questions", "Help", "Guide"],
};

export default function FAQPage() {
  const faqs = [
    {
      question: "What is SpellcastersDB?",
      answer: "SpellcastersDB is a community-driven database and deck builder for Spellcasters Chronicles. It provides comprehensive information about all units, heroes, and consumables in the game, along with tools to help you build and share decks."
    },
    {
      question: "Is this an official website?",
      answer: "No, SpellcastersDB is an unofficial, fan-made project created by the community. It is not affiliated with or endorsed by the official Spellcasters Chronicles development team."
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
          , which is maintained by community members. The website automatically fetches the latest data from the API, so information stays current as the game evolves.
        </>
      )
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
          </a>
          {" "}by submitting corrections, adding missing data, or improving documentation. All contributions are welcome!
        </>
      )
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
          . Include as much detail as possible about the error and the correct information.
        </>
      )
    },
    {
      question: "How do I use the deck builder?",
      answer: "The deck builder is currently under development. Once complete, you&apos;ll be able to select a hero and add units to create valid decks that follow the game&apos;s rules. Decks will be shareable via URL."
    },
    {
      question: "Can I filter units by type or faction?",
      answer: "Yes! The Archive page includes powerful search and filter options. You can filter units by type (creature, spell, building, titan), rank, faction, and more. Use the search bar to find specific units by name."
    },
    {
      question: "Is the website mobile-friendly?",
      answer: "Absolutely! SpellcastersDB is designed to work seamlessly on all devices, from desktop computers to smartphones. The interface adapts to your screen size for the best experience."
    },
    {
      question: "Will there be more features in the future?",
      answer: "Yes! Planned features include a fully functional deck builder with validation, deck sharing via URLs, and potentially tier lists and meta analysis. Check back regularly for updates!"
    },
  ];

  return (
    <div className="min-h-screen bg-surface-main text-foreground pt-28 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4 mb-8">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="bg-surface-card border border-white/10 rounded-lg overflow-hidden group"
            >
              <summary className="px-6 py-4 cursor-pointer font-semibold text-slate-200 hover:text-brand-accent transition-colors list-none flex items-center justify-between">
                <span>{faq.question}</span>
                <span className="text-brand-primary group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="px-6 pb-4 text-slate-300 leading-relaxed border-t border-white/10 pt-4">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        {/* Additional Help */}
        <div className="bg-surface-card border border-white/10 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3 text-brand-accent">Still have questions?</h2>
          <p className="text-slate-300 mb-4">
            If you have a question that isn't answered here, feel free to reach out through the Community API GitHub repository or check the{" "}
            <Link href="/about" className="text-brand-primary hover:text-brand-accent transition-colors">
              About page
            </Link>
            {" "}for more information.
          </p>
        </div>

        {/* Back to Archive */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-linear-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Archive
          </Link>
        </div>
      </div>
    </div>
  );
}
