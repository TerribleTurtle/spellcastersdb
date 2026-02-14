import { AllDataSchema } from "@/services/validation/data-schemas";
import { AllDataResponse } from "@/types/api";
import { EntityCategory } from "@/types/enums";

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
         console.error(
          "🔴 Data Validation Failed:",
          JSON.stringify(result.error.format(), null, 2)
        );
        throw new Error("Data Validation Failed");
    }
    
    return result.data;
}
