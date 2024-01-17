import { WebsiteController } from '../controllers/index.js';
import { Router, json } from '../types/index.js';

/**********************************************************************************/

export const websiteRouter = Router();

websiteRouter.get(
  '/websites',
  json({ limit: '1kb' }),
  WebsiteController.readMany
);
websiteRouter.post(
  '/websites',
  json({ limit: '32kb' }),
  WebsiteController.createOne
);
websiteRouter.patch(
  '/websites:websiteId',
  json({ limit: '32kb' }),
  WebsiteController.updateOne
);
websiteRouter.delete(
  '/websites:websiteId',
  json({ limit: '1kb' }),
  WebsiteController.deleteOne
);
