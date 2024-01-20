import type { DatabaseHandler, Transaction } from '../db/index.js';
import { eq, type Request, type SQL, type Service } from '../types/index.js';
import { MonitoringAppError, STATUS, sanitizeError } from '../utils/index.js';
import type { ServiceValidator } from '../validation/index.js';

/**********************************************************************************/

type ServiceCreateOneValidationData = Required<
  ReturnType<typeof ServiceValidator.createOne>
>;
type ServiceUpdateOneValidationData = ReturnType<
  typeof ServiceValidator.updateOne
>;
type ServiceDeleteOneValidationData = ReturnType<
  typeof ServiceValidator.deleteOne
>;

type DatabaseServices = Awaited<ReturnType<typeof readServices>>;

/**********************************************************************************/

export const readMany = async (req: Request): Promise<Service[]> => {
  try {
    const serviceEntries = await readServices(req.monitoringApp.db);

    return sanitizeServices(serviceEntries);
  } catch (err) {
    throw sanitizeError(err);
  }
};

export const createOne = async (
  req: Request,
  service: ServiceCreateOneValidationData
): Promise<Service> => {
  try {
    const { db, wss } = req.monitoringApp;
    const handler = db.getHandler();
    const { serviceModel, thresholdModel } = db.getModels();

    const serviceId = (
      await handler
        .insert(serviceModel)
        .values({
          name: service.name,
          uri: service.uri,
          monitorInterval: service.monitorInterval
        })
        .returning({ id: serviceModel.id })
    )[0].id;
    await handler.insert(thresholdModel).values(
      service.thresholds.map((entry) => {
        return {
          ...entry,
          serviceId: serviceId
        };
      })
    );

    wss.upsertMonitoredService(serviceId, {
      name: service.name,
      uri: service.uri,
      interval: service.monitorInterval
    });

    return {
      id: serviceId,
      name: service.name,
      uri: service.uri,
      monitorInterval: service.monitorInterval,
      thresholds: service.thresholds
    };
  } catch (err) {
    throw sanitizeError(err, { type: 'Service', name: service.name });
  }
};

export const updateOne = async (
  req: Request,
  updates: ServiceUpdateOneValidationData
): Promise<Service> => {
  const { db } = req.monitoringApp;
  const handler = db.getHandler();
  const { serviceModel } = db.getModels();
  const { id: serviceId, thresholds, ...serviceUpdates } = updates;

  try {
    await handler.transaction(async (transaction) => {
      const results = await Promise.allSettled([
        findServiceToUpdate({
          db: db,
          serviceId: serviceId,
          transaction: transaction
        }),
        updateService({
          req: req,
          serviceUpdates: serviceUpdates,
          serviceId: serviceId,
          transaction: transaction
        }),
        updateServiceThresholds({
          db: db,
          thresholds: thresholds,
          serviceId: serviceId,
          transaction: transaction
        })
      ]);
      for (const result of results) {
        if (result.status === 'rejected') {
          throw result.reason;
        }
      }
    });
  } catch (err) {
    throw sanitizeError(err, {
      type: 'Service',
      name: updates.name ?? 'Unknown'
    });
  }

  try {
    const serviceEntries = await readServices(
      db,
      eq(serviceModel.id, serviceId)
    );

    return sanitizeService(serviceEntries);
  } catch (err) {
    throw new MonitoringAppError(
      'Update successful, returning the result failed',
      STATUS.SERVER_ERROR.CODE
    );
  }
};

export const deleteOne = async (
  req: Request,
  id: ServiceDeleteOneValidationData
): Promise<string> => {
  try {
    const { db, wss } = req.monitoringApp;
    const handler = db.getHandler();
    const { serviceModel } = db.getModels();

    const deletedServices = await handler
      .delete(serviceModel)
      .where(eq(serviceModel.id, id))
      .returning({
        id: serviceModel.id
      });
    if (deletedServices.length) {
      wss.deleteMonitoredService(deletedServices[0].id);

      return deletedServices[0].id;
    }

    throw new MonitoringAppError('Service not found', STATUS.NOT_FOUND.CODE);
  } catch (err) {
    throw sanitizeError(err);
  }
};

/**********************************************************************************/

const readServices = async (db: DatabaseHandler, filter?: SQL) => {
  const handler = db.getHandler();
  const { serviceModel, thresholdModel } = db.getModels();

  const fields = {
    id: serviceModel.id,
    name: serviceModel.name,
    uri: serviceModel.uri,
    monitorInterval: serviceModel.monitorInterval,
    lowerLimit: thresholdModel.lowerLimit,
    upperLimit: thresholdModel.upperLimit
  };
  const joinQuery = eq(thresholdModel.serviceId, serviceModel.id);

  if (filter) {
    return await handler
      .select(fields)
      .from(serviceModel)
      .innerJoin(thresholdModel, joinQuery)
      .where(filter);
  }

  return await handler
    .select(fields)
    .from(serviceModel)
    .innerJoin(thresholdModel, joinQuery);
};

const sanitizeServices = (serviceEntires: DatabaseServices) => {
  const servicesMap = new Map<string, Service>(
    serviceEntires.map(({ id, name, uri, monitorInterval }) => {
      return [
        id,
        {
          id: id,
          name: name,
          uri: uri,
          monitorInterval: monitorInterval,
          thresholds: []
        }
      ];
    })
  );
  serviceEntires.forEach(({ id, lowerLimit, upperLimit }) => {
    // It was assigned in the code section above, it has to be defined here
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    servicesMap.get(id)!.thresholds.push({
      lowerLimit: lowerLimit,
      upperLimit: upperLimit
    });
  });

  return Array.from(servicesMap.values());
};

const findServiceToUpdate = async (params: {
  db: DatabaseHandler;
  serviceId: string;
  transaction: Transaction;
}) => {
  const { db, serviceId, transaction } = params;
  const { serviceModel } = db.getModels();

  const services = await transaction
    .select({ id: serviceModel.id })
    .from(serviceModel)
    .where(eq(serviceModel.id, serviceId));
  if (!services.length) {
    throw new MonitoringAppError(
      `Service '${serviceId}' not found`,
      STATUS.NOT_FOUND.CODE
    );
  }
};

const updateService = async (params: {
  req: Request;
  serviceUpdates: Omit<ServiceUpdateOneValidationData, 'id' | 'thresholds'>;
  serviceId: string;
  transaction: Transaction;
}) => {
  const { req, serviceUpdates, serviceId, transaction } = params;
  const { db, wss } = req.monitoringApp;
  const { serviceModel } = db.getModels();

  if (!Object.keys(serviceUpdates).length) {
    return await Promise.resolve();
  }

  const services = await transaction
    .update(serviceModel)
    .set(serviceUpdates)
    .where(eq(serviceModel.id, serviceId))
    .returning({
      name: serviceModel.name,
      uri: serviceModel.uri,
      interval: serviceModel.monitorInterval
    });
  if (services.length) {
    wss.upsertMonitoredService(serviceId, {
      name: services[0].name,
      uri: services[0].uri,
      interval: services[0].interval
    });
  }
};

const updateServiceThresholds = async (params: {
  db: DatabaseHandler;
  thresholds: ServiceUpdateOneValidationData['thresholds'];
  serviceId: string;
  transaction: Transaction;
}) => {
  const { db, thresholds, serviceId, transaction } = params;
  const { thresholdModel } = db.getModels();

  if (!thresholds?.length) {
    return await Promise.resolve();
  }

  await transaction
    .delete(thresholdModel)
    .where(eq(thresholdModel.serviceId, serviceId));
  await transaction.insert(thresholdModel).values(
    thresholds.map((entry) => {
      return {
        ...entry,
        serviceId: serviceId
      };
    })
  );
};

const sanitizeService = (serviceEntries: DatabaseServices) => {
  return {
    id: serviceEntries[0].id,
    name: serviceEntries[0].name,
    uri: serviceEntries[0].uri,
    monitorInterval: serviceEntries[0].monitorInterval,
    thresholds: serviceEntries.map(({ lowerLimit, upperLimit }) => {
      return {
        lowerLimit: lowerLimit,
        upperLimit: upperLimit
      };
    })
  };
};
