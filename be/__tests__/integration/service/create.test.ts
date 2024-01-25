import {
  STATUS,
  VALIDATION,
  checkMatchIgnoringOrder,
  describe,
  expect,
  inject,
  it,
  omit,
  sendHttpRequest,
  type CreateService,
  type Service
} from '../utils.js';

/**********************************************************************************/

describe('Create tests', () => {
  const { baseURL } = inject('urls');
  const serviceRouteURL = `${baseURL}/services`;

  describe('Valid', () => {
    it.concurrent('With name', async () => {
      const serviceData: CreateService = {
        name: 'SERVICE_CREATE_1',
        uri: 'https://SERVICE_CREATE_1.com',
        monitorInterval: 500,
        thresholds: [
          {
            lowerLimit: 0,
            upperLimit: 30
          }
        ]
      };
      const res = await sendHttpRequest<Service>(serviceRouteURL, {
        method: 'POST',
        json: serviceData
      });

      expect(res.statusCode).toBe(STATUS.CREATED.CODE);
      checkMatchIgnoringOrder([serviceData], [omit(res.data, 'id')]);
    });
    it.concurrent('Without name', async () => {
      const serviceData: CreateService = {
        uri: 'https://SERVICE_CREATE_2.com',
        monitorInterval: 500,
        thresholds: [
          {
            lowerLimit: 0,
            upperLimit: 30
          }
        ]
      };
      const res = await sendHttpRequest<Service>(serviceRouteURL, {
        method: 'POST',
        json: serviceData
      });

      expect(res.statusCode).toBe(STATUS.CREATED.CODE);
      checkMatchIgnoringOrder([serviceData], [omit(res.data, 'id')]);
    });
    it.concurrent('With unicode name', async () => {
      const serviceData: CreateService = {
        name: '1בלה',
        uri: 'https://SERVICE_CREATE_3.com',
        monitorInterval: 500,
        thresholds: [
          {
            lowerLimit: 0,
            upperLimit: 30
          }
        ]
      };
      const res = await sendHttpRequest<Service>(serviceRouteURL, {
        method: 'POST',
        json: serviceData
      });

      expect(res.statusCode).toBe(STATUS.CREATED.CODE);
      checkMatchIgnoringOrder([serviceData], [omit(res.data, 'id')]);
    });
    it.concurrent('With one threshold', async () => {
      const serviceData: CreateService = {
        name: 'SERVICE_CREATE_4',
        uri: 'https://SERVICE_CREATE_4.com',
        monitorInterval: 500,
        thresholds: [
          {
            lowerLimit: 0,
            upperLimit: 30
          }
        ]
      };
      const res = await sendHttpRequest<Service>(serviceRouteURL, {
        method: 'POST',
        json: serviceData
      });

      expect(res.statusCode).toBe(STATUS.CREATED.CODE);
      checkMatchIgnoringOrder([serviceData], [omit(res.data, 'id')]);
    });
    it.concurrent('With multiple thresholds', async () => {
      const serviceData: CreateService = {
        name: 'SERVICE_CREATE_5',
        uri: 'https://SERVICE_CREATE_5.com',
        monitorInterval: 500,
        thresholds: [
          {
            lowerLimit: 0,
            upperLimit: 29
          },
          {
            lowerLimit: 30,
            upperLimit: 49
          },
          {
            lowerLimit: 50,
            upperLimit: 99
          }
        ]
      };
      const res = await sendHttpRequest<Service>(serviceRouteURL, {
        method: 'POST',
        json: serviceData
      });

      expect(res.statusCode).toBe(STATUS.CREATED.CODE);
      checkMatchIgnoringOrder([serviceData], [omit(res.data, 'id')]);
    });
  });
  describe('Invalid', () => {
    it.concurrent('Duplicate', async () => {
      const serviceData: CreateService = {
        uri: 'https://SERVICE_CREATE_6.com',
        monitorInterval: 500,
        thresholds: [
          {
            lowerLimit: 0,
            upperLimit: 30
          }
        ]
      };
      const res = await sendHttpRequest<Service>(serviceRouteURL, {
        method: 'POST',
        json: serviceData
      });

      expect(res.statusCode).toBe(STATUS.CREATED.CODE);
      checkMatchIgnoringOrder([serviceData], [omit(res.data, 'id')]);

      const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
        method: 'post',
        json: serviceData
      });

      expect(statusCode).toBe(STATUS.CONFLICT.CODE);
    });
    it.concurrent('With excess fields', async () => {
      const serviceData = {
        uri: 'https://SERVICE_CREATE_7.com',
        monitorInterval: 500,
        thresholds: [
          {
            lowerLimit: 0,
            upperLimit: 30
          }
        ],
        bla: 'bla'
      };
      const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
        method: 'POST',
        json: serviceData
      });

      expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
    });
    describe('Name', () => {
      it.concurrent('Empty value', async () => {
        const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
          method: 'POST',
          json: {
            name: '',
            uri: 'https://SERVICE_CREATE_8.com',
            monitorInterval: 500,
            thresholds: [
              {
                lowerLimit: 0,
                upperLimit: 30
              }
            ]
          } satisfies CreateService
        });

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      it.concurrent('Too long', async () => {
        const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
          method: 'POST',
          json: {
            name: 'a'.repeat(VALIDATION.NAME_MAX_LEN + 1),
            uri: 'https://SERVICE_CREATE_9.com',
            monitorInterval: 500,
            thresholds: [
              {
                lowerLimit: 0,
                upperLimit: 30
              }
            ]
          } satisfies CreateService
        });

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
    });
    describe('Uri', () => {
      it.concurrent('Empty value', async () => {
        const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
          method: 'POST',
          json: {
            name: 'SERVICE_CREATE_10',
            uri: '',
            monitorInterval: 500,
            thresholds: [
              {
                lowerLimit: 0,
                upperLimit: 30
              }
            ]
          } satisfies CreateService
        });

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      it.concurrent('Too long', async () => {
        const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
          method: 'POST',
          json: {
            name: 'SERVICE_CREATE_11',
            uri: 'a'.repeat(VALIDATION.URI_MAX_LEN + 1),
            monitorInterval: 500,
            thresholds: [
              {
                lowerLimit: 0,
                upperLimit: 30
              }
            ]
          } satisfies CreateService
        });

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      it.concurrent('Not supplied', async () => {
        const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
          method: 'POST',
          json: {
            name: 'SERVICE_CREATE_12',
            monitorInterval: 500,
            thresholds: [
              {
                lowerLimit: 0,
                upperLimit: 30
              }
            ]
          }
        });

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
    });
    describe('Monitor interval', () => {
      it.concurrent('Invalid type', async () => {
        const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
          method: 'POST',
          json: {
            name: 'SERVICE_CREATE_13',
            uri: 'https://SERVICE_CREATE_13.com',
            monitorInterval: true,
            thresholds: [
              {
                lowerLimit: 0,
                upperLimit: 30
              }
            ]
          }
        });

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      it.concurrent('Too low', async () => {
        const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
          method: 'POST',
          json: {
            name: 'SERVICE_CREATE_14',
            uri: 'https://SERVICE_CREATE_14.com',
            monitorInterval: VALIDATION.MONITOR_INTERVAL_MIN_VALUE - 1,
            thresholds: [
              {
                lowerLimit: 0,
                upperLimit: 30
              }
            ]
          } satisfies CreateService
        });

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      it.concurrent('Too high', async () => {
        const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
          method: 'POST',
          json: {
            name: 'SERVICE_CREATE_15',
            uri: 'https://SERVICE_CREATE_15.com',
            monitorInterval: VALIDATION.MONITOR_INTERVAL_MAX_VALUE + 1,
            thresholds: [
              {
                lowerLimit: 0,
                upperLimit: 30
              }
            ]
          } satisfies CreateService
        });

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
    });
    describe('Thresholds', () => {
      it.concurrent('Invalid type', async () => {
        const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
          method: 'POST',
          json: {
            name: 'SERVICE_CREATE_16',
            uri: 'https://SERVICE_CREATE_16.com',
            monitorInterval: 500,
            thresholds: true
          }
        });

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      describe('Lower limit', () => {
        it.concurrent('Invalid type', async () => {
          const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
            method: 'POST',
            json: {
              name: 'SERVICE_CREATE_17',
              uri: 'https://SERVICE_CREATE_17.com',
              monitorInterval: 500,
              thresholds: [
                {
                  lowerLimit: true,
                  upperLimit: 30
                }
              ]
            }
          });

          expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
        });
        it.concurrent('Too low', async () => {
          const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
            method: 'POST',
            json: {
              name: 'SERVICE_CREATE_18',
              uri: 'https://SERVICE_CREATE_18.com',
              monitorInterval: 500,
              thresholds: [
                {
                  lowerLimit: VALIDATION.THRESHOLD_MIN_VALUE - 1,
                  upperLimit: 30
                }
              ]
            } satisfies CreateService
          });

          expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
        });
        it.concurrent('Too high', async () => {
          const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
            method: 'POST',
            json: {
              name: 'SERVICE_CREATE_19',
              uri: 'https://SERVICE_CREATE_19.com',
              monitorInterval: 500,
              thresholds: [
                {
                  lowerLimit: VALIDATION.THRESHOLD_MAX_VAL + 1,
                  upperLimit: 30
                }
              ]
            } satisfies CreateService
          });

          expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
        });
      });
      describe('Upper limit', () => {
        it.concurrent('Invalid type', async () => {
          const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
            method: 'POST',
            json: {
              name: 'SERVICE_CREATE_20',
              uri: 'https://SERVICE_CREATE_20.com',
              monitorInterval: 500,
              thresholds: [
                {
                  lowerLimit: 0,
                  upperLimit: true
                }
              ]
            }
          });

          expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
        });
        it.concurrent('Too low', async () => {
          const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
            method: 'POST',
            json: {
              name: 'SERVICE_CREATE_21',
              uri: 'https://SERVICE_CREATE_21.com',
              monitorInterval: 500,
              thresholds: [
                {
                  lowerLimit: VALIDATION.THRESHOLD_MIN_VALUE - 1,
                  upperLimit: 30
                }
              ]
            } satisfies CreateService
          });

          expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
        });
        it.concurrent('Too high', async () => {
          const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
            method: 'POST',
            json: {
              name: 'SERVICE_CREATE_22',
              uri: 'https://SERVICE_CREATE_22.com',
              monitorInterval: 500,
              thresholds: [
                {
                  lowerLimit: 0,
                  upperLimit: VALIDATION.THRESHOLD_MAX_VAL + 1
                }
              ]
            } satisfies CreateService
          });

          expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
        });
      });
      it.concurrent('Lower limit equal to upper limit', async () => {
        const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
          method: 'POST',
          json: {
            name: 'SERVICE_CREATE_23',
            uri: 'https://SERVICE_CREATE_23.com',
            monitorInterval: 500,
            thresholds: [
              {
                lowerLimit: 30,
                upperLimit: 30
              }
            ]
          } satisfies CreateService
        });

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      it.concurrent('Lower limit larger than upper limit', async () => {
        const { statusCode } = await sendHttpRequest<never>(serviceRouteURL, {
          method: 'POST',
          json: {
            name: 'SERVICE_CREATE_24',
            uri: 'https://SERVICE_CREATE_24.com',
            monitorInterval: 500,
            thresholds: [
              {
                lowerLimit: 30,
                upperLimit: 0
              }
            ]
          } satisfies CreateService
        });

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
    });
  });
});
