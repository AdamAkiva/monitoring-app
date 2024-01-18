import {
  STATUS,
  checkMatchIgnoringOrder,
  createServices,
  describe,
  expect,
  inject,
  it,
  sendHttpRequest,
  type CreateService,
  type Service
} from '../utils.js';

/**********************************************************************************/

describe('Read tests', () => {
  const { baseURL } = inject('urls');
  const serviceRouteURL = `${baseURL}/services`;

  describe('Valid', () => {
    it.concurrent('Valid', async () => {
      const servicesData: CreateService[] = [
        {
          name: 'SERVICE_READ_1',
          uri: 'https://SERVICE_READ_1.com',
          monitorInterval: 20,
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
        },
        {
          name: 'SERVICE_READ_2',
          uri: 'https://SERVICE_READ_2.com',
          monitorInterval: 10,
          thresholds: [
            {
              lowerLimit: 0,
              upperLimit: 9
            },
            {
              lowerLimit: 10,
              upperLimit: 19
            },
            {
              lowerLimit: 20,
              upperLimit: 29
            }
          ]
        },
        {
          name: 'SERVICE_READ_3',
          uri: 'https://SERVICE_READ_3.com',
          monitorInterval: 100,
          thresholds: [
            {
              lowerLimit: 0,
              upperLimit: 49
            },
            {
              lowerLimit: 50,
              upperLimit: 70
            }
          ]
        }
      ];
      await createServices(servicesData);

      const res = await sendHttpRequest<Service[]>(serviceRouteURL, {
        method: 'get'
      });

      expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
      checkMatchIgnoringOrder(servicesData, res.data);
    });
  });
});
