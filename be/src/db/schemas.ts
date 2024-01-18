// The imports in this file MUST be external only (not local to the project)
// The reason is that this file is used by the database migrations process,
// which is not a part of the application. Any changes with the dependencies
// must be included ONLY from external packages

import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';

/**********************************************************************************/

/**
 * Notes:
 * 1. All database related naming MUST be snake_case, this is the convention
 * for SQL based databases. Otherwise the database queries need to be in quotation
 * marks.
 * 2. Primary key is uuid and not serial for two reasons: The first being,
 * it will be must easier to replicate the database where every key is unique.
 * The second being, keeping with the convention of the company. The overhead and
 * data usage of 128 bits for uuid over the 32 of serial is ok for us.
 * 3. Indexes exist by default for primary keys and more are added on fields
 * frequently used for queries.
 * 4. Some of the settings exist by default, but we like to be verbose as long
 * as it is possible
 * 5. timestamps must be of type string and not date. Reason being, date objects
 * lose their precision and are only precision up to a second instead of up to
 * 6 (nanoseconds)
 */

/**********************************************************************************/

type CreateEntity<T> = Omit<T, 'createdAt' | 'id' | 'updatedAt'>;
type UpdateEntity<T> = Partial<Omit<T, 'createdAt'>> & { id: string };

/**********************************************************************************/

export type DService = InferSelectModel<typeof serviceModel>;
export type DThreshold = InferSelectModel<typeof thresholdModel>;

/**********************************************************************************/

export type CreateService = CreateEntity<InferInsertModel<typeof serviceModel>>;
export type CreateThreshold = CreateEntity<
  InferInsertModel<typeof thresholdModel>
>;

/**********************************************************************************/

export type UpdateService = UpdateEntity<CreateService>;
export type UpdateThreshold = UpdateEntity<CreateThreshold>;

/**********************************************************************************/

export const colorEnum = pgEnum('color', ['green', 'orange', 'red']);

/********************************* Entities ***************************************/
/**********************************************************************************/

export const serviceModel = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 2048 }).unique().notNull(),
  uri: varchar('uri', { length: 2048 }).unique().notNull(),
  monitorInterval: integer('monitor_interval').notNull(),
  createdAt: timestamp('created_at', {
    mode: 'string',
    precision: 6,
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    mode: 'string',
    precision: 6,
    withTimezone: true
  })
    .defaultNow()
    .notNull()
});

export const thresholdModel = pgTable(
  'thresholds',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    serviceId: uuid('service_id')
      .references(
        () => {
          return serviceModel.id;
        },
        { onDelete: 'cascade', onUpdate: 'no action' }
      )
      .notNull(),
    lowerLimit: integer('lower_limit').notNull(),
    upperLimit: integer('upper_limit').notNull()
  },
  (table) => {
    return {
      serviceIdIdx: index('thresholds_service_id_idx').on(table.serviceId)
    };
  }
);
