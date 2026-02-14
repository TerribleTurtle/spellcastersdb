import {
  Spell,
  Spellcaster,
  Titan,
  Unit,
  UnifiedEntity,
  AllDataResponse,
  Consumable,
  Upgrade
} from "@/types/api";

/**
 * Singleton Registry for O(1) Entity Lookups
 */
export class EntityRegistry {
  private static instance: EntityRegistry;

  private units = new Map<string, Unit>();
  private spells = new Map<string, Spell>();
  private titans = new Map<string, Titan>();
  private spellcasters = new Map<string, Spellcaster>();
  private consumables = new Map<string, Consumable>();
  private upgrades = new Map<string, Upgrade>();
  private unified = new Map<string, UnifiedEntity>();

  private initialized = false;

  private constructor() {}

  public static getInstance(): EntityRegistry {
    if (!EntityRegistry.instance) {
      EntityRegistry.instance = new EntityRegistry();
    }
    return EntityRegistry.instance;
  }

  /**
   * Populates the registry with data.
   * Can be called multiple times to refresh data (clears old data first).
   */
  public initialize(data: AllDataResponse) {
    this.clear();

    data.units.forEach((u) => {
      this.units.set(u.entity_id, u);
      this.unified.set(u.entity_id, u);
    });

    data.spells.forEach((s) => {
      this.spells.set(s.entity_id, s);
      this.unified.set(s.entity_id, s);
    });

    data.titans.forEach((t) => {
      this.titans.set(t.entity_id, t);
      this.unified.set(t.entity_id, t);
    });

    data.spellcasters.forEach((sc) => {
      // Prefer spellcaster_id for legacy compatibility, fallback to entity_id
      const id = sc.spellcaster_id || sc.entity_id;
      this.spellcasters.set(id, sc);
      this.unified.set(id, sc);
      
      // Also register by entity_id if different, to ensure V2 lookups work
      if (sc.entity_id && sc.entity_id !== id) {
          this.unified.set(sc.entity_id, sc);
      }
    });
    
    data.consumables.forEach((c) => {
      this.consumables.set(c.entity_id, c);
      this.unified.set(c.entity_id, c);
    });

    data.upgrades.forEach((u) => {
      this.upgrades.set(u.entity_id, u);
      this.unified.set(u.entity_id, u);
    });

    this.initialized = true;

  }

  public get(id: string): UnifiedEntity | undefined {
    return this.unified.get(id);
  }

  public getUnit(id: string): Unit | undefined {
    return this.units.get(id);
  }

  public getSpell(id: string): Spell | undefined {
    return this.spells.get(id);
  }
  
  public getTitan(id: string): Titan | undefined {
    return this.titans.get(id);
  }

  public getSpellcaster(id: string): Spellcaster | undefined {
    return this.spellcasters.get(id);
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  // Bulk Getters
  public getAllUnits(): Unit[] {
    return Array.from(this.units.values());
  }

  public getAllSpells(): Spell[] {
    return Array.from(this.spells.values());
  }

  public getAllTitans(): Titan[] {
    return Array.from(this.titans.values());
  }

  public getAllSpellcasters(): Spellcaster[] {
    return Array.from(this.spellcasters.values());
  }

  public getAllConsumables(): Consumable[] {
    return Array.from(this.consumables.values());
  }

  public getAllUpgrades(): Upgrade[] {
    return Array.from(this.upgrades.values());
  }

  public reset() {
    this.clear();
  }

  private clear() {
    this.units.clear();
    this.spells.clear();
    this.titans.clear();
    this.spellcasters.clear();
    this.consumables.clear();
    this.upgrades.clear();
    this.unified.clear();
    this.initialized = false;
  }
}

export const registry = EntityRegistry.getInstance();
