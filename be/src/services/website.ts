import type { DatabaseHandler, Transaction } from '../db/index.js';
import { eq, type Request, type SQL, type Website } from '../types/index.js';
import { MonitoringAppError, STATUS, sanitizeError } from '../utils/index.js';
import type { WebsiteValidator } from '../validation/index.js';

/**********************************************************************************/

type WebsiteCreateOneValidationData = ReturnType<
  typeof WebsiteValidator.createOne
>;
type WebsiteUpdateOneValidationData = ReturnType<
  typeof WebsiteValidator.updateOne
>;
type WebsiteDeleteOneValidationData = ReturnType<
  typeof WebsiteValidator.deleteOne
>;

type DatabaseWebsites = Awaited<ReturnType<typeof readWebsites>>;

/**********************************************************************************/

export const readMany = async (req: Request): Promise<Website[]> => {
  try {
    const websiteEntries = await readWebsites(req.monitoringApp.db);

    return sanitizeWebsites(websiteEntries);
  } catch (err) {
    throw sanitizeError(err);
  }
};

export const createOne = async (
  req: Request,
  website: WebsiteCreateOneValidationData
): Promise<Website> => {
  try {
    const { db, monitorMap } = req.monitoringApp;
    const handler = db.getHandler();
    const { websiteModel, thresholdModel } = db.getModels();

    const websiteId = (
      await handler
        .insert(websiteModel)
        .values({
          url: website.url,
          monitorInterval: website.monitorInterval
        })
        .returning({ id: websiteModel.id })
    )[0].id;
    await handler.insert(thresholdModel).values(
      website.thresholds.map((entry) => {
        return {
          ...entry,
          websiteId: websiteId
        };
      })
    );

    monitorMap.set(website.url, website.monitorInterval);

    return {
      id: websiteId,
      url: website.url,
      monitorInterval: website.monitorInterval,
      thresholds: website.thresholds
    };
  } catch (err) {
    throw sanitizeError(err, { type: 'Website', name: website.url });
  }
};

export const updateOne = async (
  req: Request,
  updates: WebsiteUpdateOneValidationData
): Promise<Website> => {
  try {
    const { db } = req.monitoringApp;
    const handler = db.getHandler();
    const { websiteModel } = db.getModels();
    const { id: websiteId, thresholds, ...websiteUpdates } = updates;

    return await handler.transaction(async (transaction) => {
      const results = await Promise.allSettled([
        findWebsiteToUpdate({
          db: db,
          websiteId: websiteId,
          transaction: transaction
        }),
        updateWebsite({
          req: req,
          websiteUpdates: websiteUpdates,
          websiteId: websiteId,
          transaction: transaction
        }),
        updateWebsiteThresholds({
          db: db,
          thresholds: thresholds,
          websiteId: websiteId,
          transaction: transaction
        })
      ]);
      for (const result of results) {
        if (result.status === 'rejected') {
          throw result.reason;
        }
      }

      const websiteEntries = await readWebsites(
        db,
        eq(websiteModel.id, websiteId)
      );

      return sanitizeWebsite(websiteEntries);
    });
  } catch (err) {
    throw sanitizeError(err, {
      type: 'Website',
      name: updates.url ?? 'Unknown'
    });
  }
};

export const deleteOne = async (
  req: Request,
  id: WebsiteDeleteOneValidationData
): Promise<string> => {
  try {
    const { db, monitorMap } = req.monitoringApp;
    const handler = db.getHandler();
    const { websiteModel } = db.getModels();

    const deletedWebsites = await handler
      .delete(websiteModel)
      .where(eq(websiteModel.id, id))
      .returning({
        id: websiteModel.id
      });
    if (deletedWebsites.length) {
      monitorMap.delete(deletedWebsites[0].id);

      return deletedWebsites[0].id;
    }

    throw new MonitoringAppError('Website not found', STATUS.NOT_FOUND.CODE);
  } catch (err) {
    throw sanitizeError(err);
  }
};

/**********************************************************************************/

const readWebsites = async (db: DatabaseHandler, filter?: SQL<unknown>) => {
  const handler = db.getHandler();
  const { websiteModel, thresholdModel } = db.getModels();

  const fields = {
    id: websiteModel.id,
    url: websiteModel.url,
    monitorInterval: websiteModel.monitorInterval,
    thresholdColor: thresholdModel.color,
    thresholdLimit: thresholdModel.limit
  };
  const joinQuery = eq(thresholdModel.websiteId, websiteModel.id);

  if (filter) {
    return await handler
      .select(fields)
      .from(websiteModel)
      .innerJoin(thresholdModel, joinQuery)
      .where(filter);
  }

  return await handler
    .select(fields)
    .from(websiteModel)
    .innerJoin(thresholdModel, joinQuery);
};

const sanitizeWebsites = (websiteEntries: DatabaseWebsites) => {
  const websiteMap = new Map<string, Website>(
    websiteEntries.map(({ id, url, monitorInterval }) => {
      return [
        id,
        { id: id, url: url, monitorInterval: monitorInterval, thresholds: [] }
      ];
    })
  );
  websiteEntries.forEach(({ id, thresholdColor, thresholdLimit }) => {
    websiteMap.get(id)!.thresholds.push({
      color: thresholdColor,
      limit: thresholdLimit
    });
  });

  return Array.from(websiteMap.values());
};

const findWebsiteToUpdate = async (params: {
  db: DatabaseHandler;
  websiteId: string;
  transaction: Transaction;
}) => {
  const { db, websiteId, transaction } = params;
  const { websiteModel } = db.getModels();

  const websites = await transaction
    .select({ id: websiteModel.id })
    .from(websiteModel)
    .where(eq(websiteModel.id, websiteId));
  if (!websites.length) {
    throw new MonitoringAppError(
      `Website '${websiteId}' not found`,
      STATUS.NOT_FOUND.CODE
    );
  }
};

const updateWebsite = async (params: {
  req: Request;
  websiteUpdates: Omit<WebsiteUpdateOneValidationData, 'id' | 'thresholds'>;
  websiteId: string;
  transaction: Transaction;
}) => {
  const { req, websiteUpdates, websiteId, transaction } = params;
  const { db, monitorMap } = req.monitoringApp;
  const { websiteModel } = db.getModels();

  if (!Object.keys(websiteUpdates).length) {
    return await Promise.resolve();
  }

  const websites = await transaction
    .update(websiteModel)
    .set(websiteUpdates)
    .where(eq(websiteModel.id, websiteId))
    .returning({
      url: websiteModel.url,
      interval: websiteModel.monitorInterval
    });
  if (websites.length) {
    monitorMap.set(websites[0].url, websites[0].interval);
  }
};

const updateWebsiteThresholds = async (params: {
  db: DatabaseHandler;
  thresholds: WebsiteUpdateOneValidationData['thresholds'];
  websiteId: string;
  transaction: Transaction;
}) => {
  const { db, thresholds, websiteId, transaction } = params;
  const { thresholdModel } = db.getModels();

  if (!thresholds?.length) {
    return await Promise.resolve();
  }

  await transaction
    .delete(thresholdModel)
    .where(eq(thresholdModel.websiteId, websiteId));
  await transaction.insert(thresholdModel).values(
    thresholds.map((entry) => {
      return {
        ...entry,
        websiteId: websiteId
      };
    })
  );
};

const sanitizeWebsite = (websiteEntries: DatabaseWebsites) => {
  return {
    id: websiteEntries[0].id,
    url: websiteEntries[0].url,
    monitorInterval: websiteEntries[0].monitorInterval,
    thresholds: websiteEntries.map(({ thresholdColor, thresholdLimit }) => {
      return {
        color: thresholdColor,
        limit: thresholdLimit
      };
    })
  };
};
