import { monitoring } from "@/services/monitoring";
import { AllDataSchema } from "@/services/validation/data-schemas";
import { validateIntegrity } from "@/services/validation/integrity-checker";
import { AllDataResponse } from "@/types/api";
import { EntityCategory } from "@/types/enums";

export class DataValidationError extends Error {
  constructor(
    message: string,
    public userFriendlyMessage: string
  ) {
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
      (u) =>
        u.category === EntityCategory.Creature ||
        u.category === EntityCategory.Building
    );
  }

  const result = AllDataSchema.safeParse(rawData);
  if (!result.success) {
    // Format error into a readable string for production logs
    const zodErrors = result.error.issues ?? [];
    const errorDetails = zodErrors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    const errorMsg = `Data Validation Failed: ${errorDetails}`;

    monitoring.captureMessage("Data Validation Failed", "error", {
      errorMsg,
      fullError: result.error.format(),
    });

    throw new DataValidationError(
      errorMsg,
      "Game data structure is invalid. Please contact support."
    );
  }

  // 2. Integrity Check (Post-Parse)
  const integrityIssues = validateIntegrity(result.data);
  if (integrityIssues.length > 0) {
    monitoring.captureMessage("Data Integrity Issues Found", "warning", {
      count: integrityIssues.length,
      issues: integrityIssues.map(
        (i) => `[${i.severity}] ${i.message} (@ ${i.path})`
      ),
    });
  }

  // 3. Update Cache
  lastRawData = rawData;
  lastResult = result.data;

  return result.data;
}
