import { AllDataSchema } from "@/services/validation/data-schemas";
import { AllDataResponse } from "@/types/api";
import { EntityCategory } from "@/types/enums";
 
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

export function mapRawDataToAllData(rawData: RawData): AllDataResponse {
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
         const errorDetails = result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
         const errorMsg = `Data Validation Failed: ${errorDetails}`;
         
         console.error("🔴 Data Validation Failed");
         console.error(errorMsg);
         console.error("Full Error:", JSON.stringify(result.error.format(), null, 2)); // Keep detailed log just in case
         
         throw new DataValidationError(errorMsg, "Game data structure is invalid. Please contact support.");
    }
    
    return result.data;
}
