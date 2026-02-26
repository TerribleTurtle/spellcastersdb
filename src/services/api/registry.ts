import {
  AllDataResponse,
  Consumable,
  GameSystems,
  Infusion,
  Spell,
  Spellcaster,
  Titan,
  UnifiedEntity,
  Unit,
  Upgrade,
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
  private upgrades = new Map<string, Upgrade>(); // Keyed by archetype
  private infusions = new Map<string, Infusion>();
  private unified = new Map<string, UnifiedEntity>();
  private gameSystems: GameSystems | null = null;

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
   *
   * @param data - The complete `AllDataResponse` payload from the API.
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

    // Upgrades are keyed by archetype (not entity_id) — V2 rework
    data.upgrades.forEach((u) => {
      this.upgrades.set(u.class, u);
    });

    if (data.infusions) {
      data.infusions.forEach((inf) => {
        this.infusions.set(inf.id, inf);
      });
    }

    // Game Systems (singleton, not per-entity)
    if (data.game_systems) {
      this.gameSystems = data.game_systems;
    }

    this.initialized = true;
  }

  /**
   * Retrieves any entity by its ID from the unified map.
   *
   * @param id - The entity_id to look up.
   * @returns The entity if found, otherwise `undefined`.
   *
   * @example
   * ```ts
   * const entity = registry.get("fire_imp_1");
   * if (entity) console.log(entity.name);
   * ```
   */
  public get(id: string): UnifiedEntity | undefined {
    return this.unified.get(id);
  }

  /**
   * Retrieves a Unit by its entity_id.
   *
   * @param id - The entity_id to look up.
   * @returns The Unit object if found, otherwise `undefined`.
   *
   * @example
   * ```ts
   * const unit = registry.getUnit("fire_imp_1");
   * if (unit) console.log(unit.name, unit.stats);
   * ```
   */
  public getUnit(id: string): Unit | undefined {
    return this.units.get(id);
  }

  /**
   * Retrieves a Spell by its entity_id.
   *
   * @param id - The entity_id to look up.
   * @returns The Spell object if found, otherwise `undefined`.
   *
   * @example
   * ```ts
   * const spell = registry.getSpell("fireball_1");
   * ```
   */
  public getSpell(id: string): Spell | undefined {
    return this.spells.get(id);
  }

  /**
   * Retrieves a Titan by its entity_id.
   *
   * @param id - The entity_id to look up.
   * @returns The Titan object if found, otherwise `undefined`.
   *
   * @example
   * ```ts
   * const titan = registry.getTitan("golem_prime");
   * ```
   */
  public getTitan(id: string): Titan | undefined {
    return this.titans.get(id);
  }

  /**
   * Retrieves a Spellcaster by its entity_id (or legacy spellcaster_id).
   *
   * @param id - The entity_id to look up.
   * @returns The Spellcaster object if found, otherwise `undefined`.
   *
   * @example
   * ```ts
   * const sc = registry.getSpellcaster("nadia");
   * if (sc) console.log(sc.name, sc.class);
   * ```
   */
  public getSpellcaster(id: string): Spellcaster | undefined {
    return this.spellcasters.get(id);
  }

  /** Returns `true` if the registry has been populated with data. */
  public isInitialized(): boolean {
    return this.initialized;
  }

  // ---- Bulk Getters ----

  /**
   * Returns all Units as an array.
   * @example
   * ```ts
   * const units = registry.getAllUnits();
   * ```
   */
  public getAllUnits(): Unit[] {
    return Array.from(this.units.values());
  }

  /**
   * Returns all Spells as an array.
   * @example
   * ```ts
   * const spells = registry.getAllSpells();
   * ```
   */
  public getAllSpells(): Spell[] {
    return Array.from(this.spells.values());
  }

  /**
   * Returns all Titans as an array.
   * @example
   * ```ts
   * const titans = registry.getAllTitans();
   * ```
   */
  public getAllTitans(): Titan[] {
    return Array.from(this.titans.values());
  }

  /**
   * Returns all Spellcasters as an array.
   * @example
   * ```ts
   * const spellcasters = registry.getAllSpellcasters();
   * ```
   */
  public getAllSpellcasters(): Spellcaster[] {
    return Array.from(this.spellcasters.values());
  }

  /**
   * Returns all Consumables as an array.
   * @example
   * ```ts
   * const consumables = registry.getAllConsumables();
   * ```
   */
  public getAllConsumables(): Consumable[] {
    return Array.from(this.consumables.values());
  }

  /**
   * Returns all Upgrades as an array.
   * @example
   * ```ts
   * const upgrades = registry.getAllUpgrades();
   * ```
   */
  public getAllUpgrades(): Upgrade[] {
    return Array.from(this.upgrades.values());
  }

  /**
   * Retrieves an Infusion by its id.
   * @example
   * ```ts
   * const inf = registry.getInfusion("fire_infusion");
   * ```
   */
  public getInfusion(id: string): Infusion | undefined {
    return this.infusions.get(id);
  }

  /**
   * Returns all Infusions as an array.
   * @example
   * ```ts
   * const infusions = registry.getAllInfusions();
   * ```
   */
  public getAllInfusions(): Infusion[] {
    return Array.from(this.infusions.values());
  }

  /**
   * Returns the Game Systems config, or null if not loaded.
   * @example
   * ```ts
   * const systems = registry.getGameSystems();
   * if (systems) console.log(systems.progression);
   * ```
   */
  public getGameSystems(): GameSystems | null {
    return this.gameSystems;
  }

  /** Alias for `clear()`. Resets the registry to an empty, uninitialized state. */
  public reset() {
    this.clear();
  }

  /** Clears all internal maps and marks the registry as uninitialized. */
  public clear() {
    this.units.clear();
    this.spells.clear();
    this.titans.clear();
    this.spellcasters.clear();
    this.consumables.clear();
    this.upgrades.clear();
    this.infusions.clear();
    this.unified.clear();
    this.gameSystems = null;
    this.initialized = false;
  }
}

export const registry = EntityRegistry.getInstance();
