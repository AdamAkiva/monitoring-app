import { WebsiteService } from '../services/index.js';
import type { NextFunction, Request, Response } from '../types/index.js';
import { STATUS } from '../utils/index.js';
import { WebsiteValidator } from '../validation/index.js';

/**********************************************************************************/

export const readMany = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    WebsiteValidator.readMany(req);
    const websites = await WebsiteService.readMany(req);

    return res.status(STATUS.SUCCESS.CODE).json(websites);
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
    const website = WebsiteValidator.createOne(req);
    const createdWebsite = await WebsiteService.createOne(req, website);

    return res.status(STATUS.CREATED.CODE).json(createdWebsite);
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
    const websiteUpdates = WebsiteValidator.updateOne(req);
    const updateWebsite = await WebsiteService.updateOne(req, websiteUpdates);

    return res.status(STATUS.SUCCESS.CODE).json(updateWebsite);
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
    const websiteId = WebsiteValidator.deleteOne(req);
    const deletedWebsiteId = await WebsiteService.deleteOne(req, websiteId);

    return res.status(STATUS.SUCCESS.CODE).json(deletedWebsiteId);
  } catch (err) {
    return next(err);
  }
};
