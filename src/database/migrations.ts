import type { SQLiteDatabase } from 'expo-sqlite';

export interface Migration {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
}

// Add future schema migrations here in version order.
// Version 1 is the initial schema — handled by initializeDb() in db.ts.
export const migrations: Migration[] = [
  // Example future migration:
  // {
  //   version: 2,
  //   up: async (db) => {
  //     await db.execAsync('ALTER TABLE containers ADD COLUMN is_archived INTEGER DEFAULT 0;');
  //   },
  // },
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  // Ensure migrations table exists
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version    INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
  `);

  // Get applied versions
  const applied = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM _migrations ORDER BY version ASC;'
  );
  const appliedVersions = new Set(applied.map((r) => r.version));

  // Apply pending migrations in order
  for (const migration of migrations) {
    if (!appliedVersions.has(migration.version)) {
      await migration.up(db);
      await db.runAsync(
        'INSERT INTO _migrations (version, applied_at) VALUES (?, ?);',
        [migration.version, Date.now()]
      );
    }
  }
}
