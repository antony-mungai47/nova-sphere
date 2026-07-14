export interface VersionedDTO<T> {
  version: string;
  data: T;
}

export type MigrationFn<T, U> = (oldData: T) => U;

/**
 * Registry to manage schema versions for DTOs.
 * Ensures AI and external integrations don't break on deployments.
 */
export class SchemaRegistry {
  private migrations: Map<string, MigrationFn<any, any>> = new Map();

  /**
   * Registers a migration path from one version to another for a specific entity.
   */
  public registerMigration<T, U>(entityName: string, fromVersion: string, toVersion: string, migration: MigrationFn<T, U>) {
    const key = `${entityName}_${fromVersion}_to_${toVersion}`;
    this.migrations.set(key, migration);
  }

  /**
   * Migrates a payload to the target version.
   */
  public migrate<T>(entityName: string, payload: VersionedDTO<any>, targetVersion: string): VersionedDTO<T> {
    if (payload.version === targetVersion) {
      return payload as VersionedDTO<T>;
    }

    const key = `${entityName}_${payload.version}_to_${targetVersion}`;
    const migration = this.migrations.get(key);

    if (!migration) {
      throw new Error(`No migration path registered for ${entityName} from ${payload.version} to ${targetVersion}`);
    }

    return {
      version: targetVersion,
      data: migration(payload.data)
    };
  }
}

export const GlobalSchemaRegistry = new SchemaRegistry();
