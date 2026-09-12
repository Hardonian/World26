export interface StoredScenario {
  id: string;
  name: string;
  family: string;
  description?: string;
  parameterOverrides: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
}

export interface StoredRun {
  id: string;
  scenarioId: string;
  timestamp: string;
  engineType: string;
  metrics: {
    peakPop: number;
    warming2100: number;
    co22100: number;
    wellbeing2100: number;
  };
  shareToken?: string;
}

export interface StoredShareLink {
  shareToken: string;
  targetType: 'run' | 'scenario';
  targetId: string;
  createdAt: string;
}

const LOCAL_STORAGE_SCENARIOS_KEY = 'world26_custom_scenarios';
const LOCAL_STORAGE_RUNS_KEY = 'world26_saved_runs';
const LOCAL_STORAGE_SHARES_KEY = 'world26_shared_links';

class LocalStorageProvider {
  private memoryScenarios = new Map<string, StoredScenario>();
  private memoryRuns: StoredRun[] = [];
  private memoryShares = new Map<string, StoredShareLink>();

  private getStorage(): Storage | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) return (globalThis as any).localStorage;
    } catch {
      // Storage access blocked or unavailable
    }
    return null;
  }

  getScenarios(): StoredScenario[] {
    const storage = this.getStorage();
    if (storage) {
      try {
        const raw = storage.getItem(LOCAL_STORAGE_SCENARIOS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return Array.from(this.memoryScenarios.values());
      }
    }
    return Array.from(this.memoryScenarios.values());
  }

  saveScenario(scenario: Omit<StoredScenario, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): StoredScenario {
    const existing = this.getScenarios();
    const now = new Date().toISOString();
    const id = scenario.id || `scen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullScenario: StoredScenario = {
      ...scenario,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const idx = existing.findIndex((s) => s.id === id);
    if (idx >= 0) {
      existing[idx] = fullScenario;
    } else {
      existing.push(fullScenario);
    }
    this.memoryScenarios.set(id, fullScenario);

    const storage = this.getStorage();
    if (storage) {
      try {
        storage.setItem(LOCAL_STORAGE_SCENARIOS_KEY, JSON.stringify(existing));
      } catch {}
    }
    return fullScenario;
  }

  deleteScenario(id: string): boolean {
    this.memoryScenarios.delete(id);
    const existing = this.getScenarios().filter((s) => s.id !== id);
    const storage = this.getStorage();
    if (storage) {
      try {
        storage.setItem(LOCAL_STORAGE_SCENARIOS_KEY, JSON.stringify(existing));
      } catch {}
    }
    return true;
  }

  getRuns(): StoredRun[] {
    const storage = this.getStorage();
    if (storage) {
      try {
        const raw = storage.getItem(LOCAL_STORAGE_RUNS_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return this.memoryRuns;
      }
    }
    return this.memoryRuns;
  }

  saveRun(run: Omit<StoredRun, 'id' | 'timestamp'> & { id?: string }): StoredRun {
    const existing = this.getRuns();
    const id = run.id || `run_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const fullRun: StoredRun = {
      ...run,
      id,
      timestamp: new Date().toISOString(),
    };

    existing.unshift(fullRun);
    this.memoryRuns.unshift(fullRun);
    const storage = this.getStorage();
    if (storage) {
      try {
        storage.setItem(LOCAL_STORAGE_RUNS_KEY, JSON.stringify(existing.slice(0, 50)));
      } catch {}
    }
    return fullRun;
  }

  createShareLink(targetType: 'run' | 'scenario', targetId: string): string {
    const shareToken = `w26_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const storage = this.getStorage();
    let links: StoredShareLink[] = [];

    if (storage) {
      try {
        const linksRaw = storage.getItem(LOCAL_STORAGE_SHARES_KEY);
        links = linksRaw ? JSON.parse(linksRaw) : [];
      } catch {}
    }

    const shareItem: StoredShareLink = {
      shareToken,
      targetType,
      targetId,
      createdAt: new Date().toISOString(),
    };

    links.push(shareItem);
    this.memoryShares.set(shareToken, shareItem);

    if (storage) {
      try {
        storage.setItem(LOCAL_STORAGE_SHARES_KEY, JSON.stringify(links));
      } catch {}
    }
    return shareToken;
  }

  getSharedTarget(shareToken: string): StoredShareLink | null {
    if (this.memoryShares.has(shareToken)) {
      return this.memoryShares.get(shareToken)!;
    }
    const storage = this.getStorage();
    if (storage) {
      try {
        const raw = storage.getItem(LOCAL_STORAGE_SHARES_KEY);
        const links: StoredShareLink[] = raw ? JSON.parse(raw) : [];
        return links.find((l) => l.shareToken === shareToken) || null;
      } catch {}
    }
    return null;
  }
}


export class PlanetaryStorageAdapter {
  private local = new LocalStorageProvider();
  private supabaseUrl: string | undefined;
  private supabaseKey: string | undefined;

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  get isCloudConfigured(): boolean {
    return Boolean(this.supabaseUrl && this.supabaseKey);
  }

  async getScenarios(): Promise<StoredScenario[]> {
    return this.local.getScenarios();
  }

  async saveScenario(scenario: Omit<StoredScenario, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<StoredScenario> {
    return this.local.saveScenario(scenario);
  }

  async deleteScenario(id: string): Promise<boolean> {
    return this.local.deleteScenario(id);
  }

  async getRuns(): Promise<StoredRun[]> {
    return this.local.getRuns();
  }

  async saveRun(run: Omit<StoredRun, 'id' | 'timestamp'> & { id?: string }): Promise<StoredRun> {
    return this.local.saveRun(run);
  }

  async createShareLink(targetType: 'run' | 'scenario', targetId: string): Promise<string> {
    return this.local.createShareLink(targetType, targetId);
  }

  async getSharedTarget(shareToken: string): Promise<StoredShareLink | null> {
    return this.local.getSharedTarget(shareToken);
  }
}

export const defaultStorageAdapter = new PlanetaryStorageAdapter();
