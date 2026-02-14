import { Metadata } from "next";
import { fetchGameData } from "@/services/api/api";
import { decodeDeck, decodeTeam } from "@/services/utils/encoding";

type Params = {
  [key: string]: string | string[] | undefined;
};

/**
 * Generates metadata for the application based on search parameters.
 * Handles Dynamic OpenGraph images for Decks and Teams.
 * 
 * @param searchParams - The search parameters from the URL.
 * @returns The Next.js Metadata object.
 */
export async function generateDeckMetadata(
  searchParams: Promise<Params>
): Promise<Metadata> {
    const resolvedParams = await searchParams;
    const deckHash = resolvedParams?.d;
    const teamHash = resolvedParams?.team;

    // 1. Handle Single Deck
    if (typeof deckHash === "string" && deckHash) {
        return await generateSingleDeckMetadata(deckHash);
    }

    // 2. Handle Team
    if (typeof teamHash === "string" && teamHash) {
        return await generateTeamMetadata(teamHash);
    }

    // 3. Default Metadata
    return {
        title: "Deck Builder & Loadout Editor - SpellcastersDB",
        description:
        "Create, optimize, and share your Spellcasters Chronicles decks. The ultimate card strategy tool for custom builds and loadouts.",
        keywords: [
        "Spellcasters Chronicles",
        "Deck Builder",
        "Loadouts",
        "Card Decks",
        "Builds",
        "Strategy",
        "MOBA",
        "Card Game",
        "Guide",
        "Wiki",
        ],
        openGraph: {
        title: "Deck Builder & Loadout Editor - SpellcastersDB",
        description:
            "Create, optimize, and share your Spellcasters Chronicles decks. The ultimate card strategy tool for custom builds and loadouts.",
        type: "website",
        images: ["/og-forge.png"],
        },
        twitter: {
        card: "summary_large_image",
        title: "Deck Builder & Loadout Editor - SpellcastersDB",
        description:
            "Create, optimize, and share your Spellcasters Chronicles decks. The ultimate card strategy tool for custom builds and loadouts.",
        },
    };
}

/**
 * Helper: Generates metadata for a single deck.
 * Decodes the deck hash to retrieve the deck name and spellcaster.
 */
async function generateSingleDeckMetadata(deckHash: string): Promise<Metadata> {
    const decoded = decodeDeck(deckHash);
    let deckName = decoded?.name;

    // If no name in the hash, resolve it from the Spellcaster ID
    let spellcasterName = "";

    // Always try to get spellcaster name for better metadata
    if (decoded?.spellcasterId) {
        try {
        const data = await fetchGameData();
        const spellcaster = data.spellcasters.find(
            (h) => h.spellcaster_id === decoded.spellcasterId
        );
        if (spellcaster) {
            spellcasterName = spellcaster.name;
            if (!deckName) {
            deckName = `${spellcaster.name} Deck`;
            }
        }
        } catch (e) {
        console.error("Failed to fetch game data for metadata", e);
        }
    }

    // Fallback if still empty
    if (!deckName) deckName = "Custom Deck";

    const description = spellcasterName
        ? `Check out this ${spellcasterName} build for Spellcasters Chronicles.`
        : `Check out this ${deckName} build for Spellcasters Chronicles.`;

    return {
        title: `${deckName} - SpellcastersDB`,
        description: description,
        openGraph: {
        title: `${deckName} - SpellcastersDB`,
        description: description,
        type: "website",
        images: [`/api/og?d=${deckHash}`],
        },
        twitter: {
        card: "summary_large_image",
        title: `${deckName} - SpellcastersDB`,
        description: description,
        images: [`/api/og?d=${deckHash}`],
        },
    };
}

/**
 * Helper: Generates metadata for a team.
 * Decodes the team hash to retrieve the team name.
 */
async function generateTeamMetadata(teamHash: string): Promise<Metadata> {
    const { name } = decodeTeam(teamHash);

    const teamName = name || "Team Trinity";
    const description = `Check out this team build for Spellcasters Chronicles.`;

    return {
        title: `${teamName} - SpellcastersDB`,
        description: description,
        openGraph: {
        title: `${teamName} - SpellcastersDB`,
        description: description,
        type: "website",
        images: [`/api/og?team=${teamHash}`],
        },
        twitter: {
        card: "summary_large_image",
        title: `${teamName} - SpellcastersDB`,
        description: description,
        images: [`/api/og?team=${teamHash}`],
        },
    };
}
