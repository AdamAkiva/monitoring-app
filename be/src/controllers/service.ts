import { ServiceLayer } from '../services/index.js';
import type { NextFunction, Request, Response } from '../types/index.js';
import { STATUS } from '../utils/index.js';
import { ServiceValidator } from '../validation/index.js';

/**********************************************************************************/

export const readMany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    ServiceValidator.readMany(req);
    const services = await ServiceLayer.readMany(req);

    return res.status(STATUS.SUCCESS.CODE).json(services);
  } catch (err) {
    return next(err);
  }
};

export const createOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const service = ServiceValidator.createOne(req);
    const createdService = await ServiceLayer.createOne(req, service);

    return res.status(STATUS.CREATED.CODE).json(createdService);
  } catch (err) {
    return next(err);
  }
};

export const updateOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const serviceUpdates = ServiceValidator.updateOne(req);
    const updatedService = await ServiceLayer.updateOne(req, serviceUpdates);

    return res.status(STATUS.SUCCESS.CODE).json(updatedService);
  } catch (err) {
    return next(err);
  }
};

export const deleteOne = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const serviceId = ServiceValidator.deleteOne(req);
    const deletedServiceId = await ServiceLayer.deleteOne(req, serviceId);

    return res.status(STATUS.SUCCESS.CODE).json(deletedServiceId);
  } catch (err) {
    return next(err);
  }
};
