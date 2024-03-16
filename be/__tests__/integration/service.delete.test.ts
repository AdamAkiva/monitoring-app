import {
  STATUS,
  createServices,
  describe,
  expect,
  inject,
  it,
  randomUUID,
  sendHttpRequest,
  type CreateService
} from '../utils.js';

/**********************************************************************************/

describe.concurrent('Delete tests', () => {
  const { baseURL } = inject('urls');
  const serviceRouteURL = `${baseURL}/services`;

  it('Valid', async () => {
    const servicesData: CreateService[] = [
      {
        name: 'SERVICE_DELETE_1',
        uri: 'https://SERVICE_DELETE_1.com',
        monitorInterval: 500,
        thresholds: [
          {
            lowerLimit: 0,
            upperLimit: 4
          },
          {
            lowerLimit: 5,
            upperLimit: 19
          }
        ]
      }
    ];
    const [{ id: serviceId }] = await createServices(servicesData);

    const res = await sendHttpRequest<string>(
      `${serviceRouteURL}/${serviceId}`,
      { method: 'delete' }
    );

    expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
    expect(res.data).toStrictEqual(serviceId);
  });
  describe('Invalid', () => {
    it('Missing service id', async () => {
      const { statusCode } = await sendHttpRequest<never>(
        `${serviceRouteURL}/`,
        { method: 'delete' }
      );

      expect(statusCode).toBe(STATUS.NOT_FOUND.CODE);
    });
    it('Invalid service id', async () => {
      const { statusCode } = await sendHttpRequest<never>(
        `${serviceRouteURL}/abcdefg12345`,
        { method: 'delete' }
      );

      expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
    });
    it('Non-existent service id', async () => {
      const { statusCode } = await sendHttpRequest<never>(
        `${serviceRouteURL}/${randomUUID()}`,
        { method: 'delete' }
      );

      expect(statusCode).toBe(STATUS.NOT_FOUND.CODE);
    });
  });
});
