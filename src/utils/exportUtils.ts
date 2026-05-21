import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDb } from '../database/db';
import { nowTimestamp } from './dateUtils';

interface ExportSchema {
  version: number;
  exported_at: number;
  locations: unknown[];
  tags: unknown[];
  containers: unknown[];
  items: unknown[];
  container_tags: unknown[];
  item_tags: unknown[];
}

export async function exportData(): Promise<void> {
  const db = getDb();

  const [locations, tags, containers, items, containerTags, itemTags] =
    await Promise.all([
      db.getAllAsync('SELECT * FROM locations;'),
      db.getAllAsync('SELECT * FROM tags;'),
      db.getAllAsync('SELECT * FROM containers;'),
      db.getAllAsync('SELECT * FROM items;'),
      db.getAllAsync('SELECT * FROM container_tags;'),
      db.getAllAsync('SELECT * FROM item_tags;'),
    ]);

  const exportData: ExportSchema = {
    version: 1,
    exported_at: nowTimestamp(),
    locations,
    tags,
    containers,
    items,
    container_tags: containerTags,
    item_tags: itemTags,
  };

  const json = JSON.stringify(exportData, null, 2);
  const filename = `san-alejo-backup-${Date.now()}.json`;
  const fileUri = `${FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(fileUri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Exportar datos de San Alejo',
    });
  }
}

export async function importData(fileUri: string): Promise<void> {
  const json = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const data: ExportSchema = JSON.parse(json);
  if (!data.version || !data.containers) {
    throw new Error('Formato de archivo inválido.');
  }

  const db = getDb();

  // Import in dependency order inside a transaction
  await db.withTransactionAsync(async () => {
    // Clear existing data
    await db.execAsync('DELETE FROM item_tags;');
    await db.execAsync('DELETE FROM container_tags;');
    await db.execAsync('DELETE FROM items;');
    await db.execAsync('DELETE FROM containers;');
    await db.execAsync('DELETE FROM tags;');
    await db.execAsync('DELETE FROM locations;');

    // Insert locations
    for (const loc of data.locations as Record<string, unknown>[]) {
      await db.runAsync(
        'INSERT INTO locations (id, name, icon, created_at) VALUES (?, ?, ?, ?);',
        [loc.id as string, loc.name as string, (loc.icon as string) ?? null, loc.created_at as number]
      );
    }

    // Insert tags
    for (const tag of data.tags as Record<string, unknown>[]) {
      await db.runAsync(
        'INSERT INTO tags (id, name, color) VALUES (?, ?, ?);',
        [tag.id as string, tag.name as string, tag.color as string]
      );
    }

    // Insert containers
    for (const c of data.containers as Record<string, unknown>[]) {
      await db.runAsync(
        `INSERT INTO containers
           (id, name, description, type, location_id, parent_container_id, cover_image_uri, color_tag, created_at, updated_at, last_accessed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          c.id as string, c.name as string, (c.description as string) ?? null,
          c.type as string, (c.location_id as string) ?? null,
          (c.parent_container_id as string) ?? null,
          (c.cover_image_uri as string) ?? null, (c.color_tag as string) ?? null,
          c.created_at as number, c.updated_at as number,
          (c.last_accessed_at as number) ?? null,
        ]
      );
    }

    // Insert items
    for (const item of data.items as Record<string, unknown>[]) {
      await db.runAsync(
        `INSERT INTO items (id, name, description, quantity, container_id, cover_image_uri, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          item.id as string, item.name as string, (item.description as string) ?? null,
          item.quantity as number, item.container_id as string,
          (item.cover_image_uri as string) ?? null,
          item.created_at as number, item.updated_at as number,
        ]
      );
    }

    // Insert junction tables
    for (const ct of data.container_tags as Record<string, unknown>[]) {
      await db.runAsync(
        'INSERT OR IGNORE INTO container_tags (container_id, tag_id) VALUES (?, ?);',
        [ct.container_id as string, ct.tag_id as string]
      );
    }
    for (const it of data.item_tags as Record<string, unknown>[]) {
      await db.runAsync(
        'INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?);',
        [it.item_id as string, it.tag_id as string]
      );
    }
  });
}
