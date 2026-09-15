import { BaseEntity, SoftDeleteRecord } from '../types';

/**
 * Checks if an entity is active (not soft deleted).
 * Returns true if isDeleted is not true AND deletedAt is null/undefined.
 */
export function isEntityActive<T extends SoftDeleteRecord>(entity: T | null | undefined): entity is T {
  if (!entity) return false;
  const isMarkedDeleted = entity.isDeleted === true;
  const hasDeletedTimestamp = entity.deletedAt !== null && entity.deletedAt !== undefined;
  return !isMarkedDeleted && !hasDeletedTimestamp;
}

/**
 * Filters an array of records to exclude soft-deleted entities.
 * Ensures data history is preserved while hiding deleted items from active queries.
 */
export function filterActiveRecords<T extends SoftDeleteRecord>(records: T[] | null | undefined): T[] {
  if (!Array.isArray(records)) return [];
  return records.filter(isEntityActive);
}

/**
 * Marks a record as soft-deleted without physically removing it from the dataset.
 */
export function softDelete<T extends BaseEntity>(entity: T, deletedBy?: string): T {
  const timestamp = new Date().toISOString();
  return {
    ...entity,
    isDeleted: true,
    deletedAt: timestamp,
    updatedAt: timestamp,
    ...(deletedBy ? { deletedBy } : {}),
  };
}

/**
 * Restores a previously soft-deleted record.
 */
export function restoreSoftDeleted<T extends BaseEntity>(entity: T): T {
  const timestamp = new Date().toISOString();
  return {
    ...entity,
    isDeleted: false,
    deletedAt: null,
    updatedAt: timestamp,
  };
}

/**
 * Example 1: Generic Repository Query Interceptor
 * Intercepts query calls and automatically appends soft-delete filter conditions.
 */
export interface QueryOptions<T> {
  includeDeleted?: boolean;
  filter?: Partial<Record<keyof T, any>>;
}

export class SoftDeleteRepository<T extends BaseEntity> {
  private items: T[];

  constructor(initialItems: T[] = []) {
    this.items = initialItems;
  }

  /**
   * Find records with automatic soft-delete filtration unless includeDeleted is explicitly true.
   */
  async find(options: QueryOptions<T> = {}): Promise<T[]> {
    let result = this.items;

    if (!options.includeDeleted) {
      result = filterActiveRecords(result);
    }

    if (options.filter) {
      result = result.filter((item) =>
        Object.entries(options.filter || {}).every(([key, value]) => (item as any)[key] === value)
      );
    }

    return result;
  }

  async findById(id: string, options: { includeDeleted?: boolean } = {}): Promise<T | null> {
    const item = this.items.find((i) => i.id === id);
    if (!item) return null;
    if (!options.includeDeleted && !isEntityActive(item)) return null;
    return item;
  }
}

/**
 * Example 2: Database / ORM Middleware Pattern (e.g. Prisma / TypeORM / Knex / MongoDB)
 * Demonstrates how an ORM interceptor mutates incoming query args to filter `isDeleted: false` & `deletedAt: null`.
 */
export function createSoftDeleteMiddleware() {
  return async (params: { model?: string; action: string; args: any }, next: (params: any) => Promise<any>) => {
    // Actions that fetch or query records
    const readActions = ['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'];

    if (readActions.includes(params.action)) {
      if (!params.args) params.args = {};
      if (!params.args.where) params.args.where = {};

      // If user did not explicitly request deleted records, exclude them
      if (params.args.where.isDeleted === undefined && params.args.where.deletedAt === undefined) {
        params.args.where.isDeleted = false;
        params.args.where.deletedAt = null;
      }
    }

    // Intercept delete actions to transform them into soft delete updates
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      };
    }

    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data !== undefined) {
        params.args.data.isDeleted = true;
        params.args.data.deletedAt = new Date().toISOString();
      } else {
        params.args.data = {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
        };
      }
    }

    return next(params);
  };
}
