import { AllDataSchema } from "@/services/validation/data-schemas";
import { AllDataResponse } from "@/types/api";
import { EntityCategory } from "@/types/enums";
import { validateIntegrity } from "@/services/validation/integrity-checker";
 
 export class DataValidationError extends Error {
   constructor(message: string, public userFriendlyMessage: string) {
     super(message);
     this.name = "DataValidationError";
   }
 }

export interface RawUnit {
  category?: string;
  [key: string]: unknown;
}

export interface RawData {
  heroes?: unknown[];
  spellcasters?: unknown[];
  units?: RawUnit[];
  [key: string]: unknown;
}


// Simple Memoization Cache
let lastRawData: RawData | null = null;
let lastResult: AllDataResponse | null = null;

export function mapRawDataToAllData(rawData: RawData): AllDataResponse {
    // 1. Cache Hit Check
    if (lastRawData === rawData && lastResult) {
        return lastResult;
    }

    // V2 Mapping: Handle legacy "heroes" field
    if (rawData.heroes && !rawData.spellcasters) {
      rawData.spellcasters = rawData.heroes;
    }

    // Pre-process: Filter units to only allow Creatures and Buildings
    if (Array.isArray(rawData.units)) {
      rawData.units = rawData.units.filter(
        (u) => u.category === EntityCategory.Creature || u.category === EntityCategory.Building
      );
    }

    const result = AllDataSchema.safeParse(rawData);
    if (!result.success) {
         // Format error into a readable string for production logs
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const zodErrors = (result.error as any).errors || (result.error as any).issues || [];
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const errorDetails = zodErrors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
         const errorMsg = `Data Validation Failed: ${errorDetails}`;
         
         console.error("🔴 Data Validation Failed");
         console.error(errorMsg);
         console.error("Full Error:", JSON.stringify(result.error.format(), null, 2)); // Keep detailed log just in case
         
         throw new DataValidationError(errorMsg, "Game data structure is invalid. Please contact support.");
    }
    
    // 2. Integrity Check (Post-Parse)
    const integrityIssues = validateIntegrity(result.data);
    if (integrityIssues.length > 0) {
        console.warn("⚠️ Data Integrity Issues Found:", integrityIssues.length);
        integrityIssues.forEach(issue => {
            const label = issue.severity === "error" ? "🔴" : "UD"; 
            console.warn(`${label} ${issue.message} (@ ${issue.path})`);
        });
    }
    
    // 3. Update Cache
    lastRawData = rawData;
    lastResult = result.data;

    return result.data;
}
