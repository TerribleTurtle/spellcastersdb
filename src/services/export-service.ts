import { Team } from "@/types/deck";

export function downloadTeamJson(teamDecks: Team["decks"], teamName: string) {
    // Create export object
    const exportData = {
        name: teamName || "Untitled Team",
        decks: teamDecks,
        exportedAt: new Date().toISOString(),
        version: "1.0"
    };

    // Create blobs and download link
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(teamName || "untitled-team").toLowerCase().replace(/\s+/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
