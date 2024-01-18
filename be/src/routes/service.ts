import { ServiceController } from '../controllers/index.js';
import { Router, json } from '../types/index.js';

/**********************************************************************************/

export const serviceRouter = Router();

serviceRouter.get(
  '/services',
  json({ limit: '1kb' }),
  ServiceController.readMany
);
serviceRouter.post(
  '/services',
  json({ limit: '32kb' }),
  ServiceController.createOne
);
serviceRouter.patch(
  '/services/:serviceId',
  json({ limit: '32kb' }),
  ServiceController.updateOne
);
serviceRouter.delete(
  '/services/:serviceId',
  json({ limit: '1kb' }),
  ServiceController.deleteOne
);
