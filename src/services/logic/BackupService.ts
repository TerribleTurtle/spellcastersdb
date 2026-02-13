import { Deck, Team } from "@/types/deck";
import { DeckBuilderState } from "@/store/types";

export interface BackupData {
  version: number;
  timestamp: string;
  decks: Deck[];
  teams: Team[];
}

export class BackupService {
  private static CURRENT_VERSION = 1;

  /**
   * Generates a backup object from the current store state.
   */
  public static generateBackup(state: DeckBuilderState): BackupData {
    return {
      version: this.CURRENT_VERSION,
      timestamp: new Date().toISOString(),
      decks: state.savedDecks,
      teams: state.savedTeams,
    };
  }

  /**
   * Triggers a browser download of the backup data.
   */
  public static downloadBackup(data: BackupData, filename: string = "spellcasters-backup.json"): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Validates the structure of imported backup data.
   */
  public static validateBackup(data: unknown): data is BackupData {
    if (!data || typeof data !== "object") return false;
    
    // Basic structural check
    const backup = data as Partial<BackupData>;
    if (!Array.isArray(backup.decks)) return false;
    if (!Array.isArray(backup.teams)) return false;
    
    // We could add deeper validation here, but this covers the basics
    return true;
  }

  /**
   * Reads and parses a JSON file.
   */
  public static async parseBackupFile(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result !== "string") {
            throw new Error("Failed to read file");
          }
          
          const parsed = JSON.parse(result);
          if (this.validateBackup(parsed)) {
            resolve(parsed);
          } else {
            reject(new Error("Invalid backup file format"));
          }
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  }
}
