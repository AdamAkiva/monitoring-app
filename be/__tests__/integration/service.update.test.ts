import {
  STATUS,
  VALIDATION,
  checkMatchIgnoringOrder,
  createServices,
  describe,
  expect,
  inject,
  it,
  omit,
  randomUUID,
  sendHttpRequest,
  type CreateService,
  type Service,
  type UpdateService
} from '../utils.js';

/**********************************************************************************/

describe.concurrent('Update tests', () => {
  const { baseURL } = inject('urls');
  const serviceRouteURL = `${baseURL}/services`;

  describe('Valid', () => {
    describe('Name', () => {
      it('Different name', async () => {
        const serviceData: CreateService = {
          name: 'SERVICE_UPDATE_1',
          uri: 'https://SERVICE_UPDATE_1.com',
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
        };
        const [{ id: serviceId }] = await createServices([serviceData]);

        const updateData: UpdateService = { name: 'SERVICE_UPDATE_2' };
        const res = await sendHttpRequest<Service>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'patch',
            json: updateData
          }
        );

        expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
        checkMatchIgnoringOrder(
          [{ ...serviceData, ...updateData }],
          [omit(res.data, 'id')]
        );
      });
      it('Self update', async () => {
        const serviceData: CreateService = {
          name: 'SERVICE_UPDATE_3',
          uri: 'https://SERVICE_UPDATE_3.com',
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
        };
        const [{ id: serviceId }] = await createServices([serviceData]);

        const updateData: UpdateService = { name: 'SERVICE_UPDATE_3' };
        const res = await sendHttpRequest<Service>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'patch',
            json: updateData
          }
        );

        expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
        checkMatchIgnoringOrder(
          [{ ...serviceData, ...updateData }],
          [omit(res.data, 'id')]
        );
      });
    });
    describe('Uri', () => {
      it('Different uri', async () => {
        const serviceData: CreateService = {
          name: 'SERVICE_UPDATE_4',
          uri: 'https://SERVICE_UPDATE_4.com',
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
        };
        const [{ id: serviceId }] = await createServices([serviceData]);

        const updateData: UpdateService = {
          uri: 'https://SERVICE_UPDATE_5.com'
        };
        const res = await sendHttpRequest<Service>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'patch',
            json: updateData
          }
        );

        expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
        checkMatchIgnoringOrder(
          [{ ...serviceData, ...updateData }],
          [omit(res.data, 'id')]
        );
      });
      it('Self update', async () => {
        const serviceData: CreateService = {
          name: 'SERVICE_UPDATE_6',
          uri: 'https://SERVICE_UPDATE_6.com',
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
        };
        const [{ id: serviceId }] = await createServices([serviceData]);

        const updateData: UpdateService = {
          uri: 'https://SERVICE_UPDATE_6.com'
        };
        const res = await sendHttpRequest<Service>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'patch',
            json: updateData
          }
        );

        expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
        checkMatchIgnoringOrder(
          [{ ...serviceData, ...updateData }],
          [omit(res.data, 'id')]
        );
      });
    });
    describe('Monitor interval', () => {
      it('Different value', async () => {
        const serviceData: CreateService = {
          name: 'SERVICE_UPDATE_7',
          uri: 'https://SERVICE_UPDATE_7.com',
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
        };
        const [{ id: serviceId }] = await createServices([serviceData]);

        const updateData: UpdateService = {
          monitorInterval: 1_000
        };
        const res = await sendHttpRequest<Service>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'patch',
            json: updateData
          }
        );

        expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
        checkMatchIgnoringOrder(
          [{ ...serviceData, ...updateData }],
          [omit(res.data, 'id')]
        );
      });
      it('Self update', async () => {
        const serviceData: CreateService = {
          name: 'SERVICE_UPDATE_8',
          uri: 'https://SERVICE_UPDATE_8.com',
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
        };
        const [{ id: serviceId }] = await createServices([serviceData]);

        const updateData: UpdateService = {
          monitorInterval: 1_000
        };
        const res = await sendHttpRequest<Service>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'patch',
            json: updateData
          }
        );

        expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
        checkMatchIgnoringOrder(
          [{ ...serviceData, ...updateData }],
          [omit(res.data, 'id')]
        );
      });
    });
    describe('Thresholds', () => {
      it('Add thresholds', async () => {
        const serviceData: CreateService = {
          name: 'SERVICE_UPDATE_9',
          uri: 'https://SERVICE_UPDATE_9.com',
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
        };
        const [{ id: serviceId }] = await createServices([serviceData]);

        const updateData: UpdateService = {
          thresholds: [
            ...serviceData.thresholds,
            { lowerLimit: 20, upperLimit: 39 }
          ]
        };
        const res = await sendHttpRequest<Service>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'patch',
            json: updateData
          }
        );

        expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
        checkMatchIgnoringOrder(
          [{ ...serviceData, ...updateData }],
          [omit(res.data, 'id')]
        );
      });
      it('Remove thresholds', async () => {
        const serviceData: CreateService = {
          name: 'SERVICE_UPDATE_11',
          uri: 'https://SERVICE_UPDATE_11.com',
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
        };
        const [{ id: serviceId }] = await createServices([serviceData]);

        const updateData: UpdateService = {
          thresholds: [serviceData.thresholds[0]]
        };
        const res = await sendHttpRequest<Service>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'patch',
            json: updateData
          }
        );

        expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
        checkMatchIgnoringOrder(
          [{ ...serviceData, ...updateData }],
          [omit(res.data, 'id')]
        );
      });
      it('Change thresholds', async () => {
        const serviceData: CreateService = {
          name: 'SERVICE_UPDATE_12',
          uri: 'https://SERVICE_UPDATE_12.com',
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
        };
        const [{ id: serviceId }] = await createServices([serviceData]);

        const updateData: UpdateService = {
          thresholds: [
            { lowerLimit: 0, upperLimit: 9 },
            { lowerLimit: 10, upperLimit: 19 }
          ]
        };
        const res = await sendHttpRequest<Service>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'patch',
            json: updateData
          }
        );

        expect(res.statusCode).toBe(STATUS.SUCCESS.CODE);
        checkMatchIgnoringOrder(
          [{ ...serviceData, ...updateData }],
          [omit(res.data, 'id')]
        );
      });
    });
  });
  describe('Invalid', () => {
    it('Empty update', async () => {
      const [{ id: serviceId }] = await createServices([
        {
          name: 'SERVICE_UPDATE_13',
          uri: 'https://SERVICE_UPDATE_13.com',
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
      ]);

      const { statusCode } = await sendHttpRequest<never>(
        `${serviceRouteURL}/${serviceId}`,
        { method: 'PATCH' }
      );

      expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
    });
    it('Duplicate', async () => {
      const [, { id: serviceId2 }] = await createServices([
        {
          name: 'SERVICE_UPDATE_14',
          uri: 'https://SERVICE_UPDATE_14.com',
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
        },
        {
          name: 'SERVICE_UPDATE_15',
          uri: 'https://SERVICE_UPDATE_15.com',
          monitorInterval: 1_000,
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
      ]);

      const { statusCode } = await sendHttpRequest<never>(
        `${serviceRouteURL}/${serviceId2}`,
        {
          method: 'PATCH',
          json: { name: 'SERVICE_UPDATE_14' } satisfies UpdateService
        }
      );

      expect(statusCode).toBe(STATUS.CONFLICT.CODE);
    });
    it('With non-existing fields', async () => {
      const [{ id: serviceId }] = await createServices([
        {
          name: 'SERVICE_UPDATE_16',
          uri: 'https://SERVICE_UPDATE_16.com',
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
      ]);

      const { statusCode } = await sendHttpRequest<never>(
        `${serviceRouteURL}/${serviceId}`,
        {
          method: 'PATCH',
          json: { tmp: 'bamba' }
        }
      );

      expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
    });
    it('Invalid id value', async () => {
      const { statusCode } = await sendHttpRequest<never>(
        `${serviceRouteURL}/abcdefg12345`,
        {
          method: 'PATCH',
          json: { name: 'SERVICE_UPDATE_17' } satisfies UpdateService
        }
      );

      expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
    });
    it('Non-existent id', async () => {
      const { statusCode } = await sendHttpRequest<never>(
        `${serviceRouteURL}/${randomUUID()}`,
        {
          method: 'PATCH',
          json: { name: 'SERVICE_UPDATE_18' } satisfies UpdateService
        }
      );

      expect(statusCode).toBe(STATUS.NOT_FOUND.CODE);
    });
    describe('Name', () => {
      it('Empty value', async () => {
        const [{ id: serviceId }] = await createServices([
          {
            name: 'SERVICE_UPDATE_19',
            uri: 'https://SERVICE_UPDATE_19.com',
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
        ]);

        const { statusCode } = await sendHttpRequest<never>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'PATCH',
            json: { name: '' } satisfies UpdateService
          }
        );

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      it('Too long', async () => {
        const [{ id: serviceId }] = await createServices([
          {
            name: 'SERVICE_UPDATE_20',
            uri: 'https://SERVICE_UPDATE_20.com',
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
        ]);

        const { statusCode } = await sendHttpRequest<never>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'PATCH',
            json: {
              name: 'a'.repeat(VALIDATION.NAME_MAX_LEN + 1)
            } satisfies UpdateService
          }
        );

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
    });
    describe('Uri', () => {
      it('Empty value', async () => {
        const [{ id: serviceId }] = await createServices([
          {
            name: 'SERVICE_UPDATE_21',
            uri: 'https://SERVICE_UPDATE_21.com',
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
        ]);

        const { statusCode } = await sendHttpRequest<never>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'PATCH',
            json: { uri: '' } satisfies UpdateService
          }
        );

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      it('Too long', async () => {
        const [{ id: serviceId }] = await createServices([
          {
            name: 'SERVICE_UPDATE_22',
            uri: 'https://SERVICE_UPDATE_22.com',
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
        ]);

        const { statusCode } = await sendHttpRequest<never>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'PATCH',
            json: {
              uri: 'a'.repeat(VALIDATION.URI_MAX_LEN + 1)
            } satisfies UpdateService
          }
        );

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
    });
    describe('Monitor interval', () => {
      it('Invalid type', async () => {
        const [{ id: serviceId }] = await createServices([
          {
            name: 'SERVICE_UPDATE_23',
            uri: 'https://SERVICE_UPDATE_23.com',
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
        ]);

        const { statusCode } = await sendHttpRequest<never>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'PATCH',
            json: { monitorInterval: true }
          }
        );

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      it('Too low', async () => {
        const [{ id: serviceId }] = await createServices([
          {
            name: 'SERVICE_UPDATE_24',
            uri: 'https://SERVICE_UPDATE_24.com',
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
        ]);

        const { statusCode } = await sendHttpRequest<never>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'PATCH',
            json: {
              monitorInterval: VALIDATION.MONITOR_INTERVAL_MIN_VALUE - 1
            } satisfies UpdateService
          }
        );

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      it('Too high', async () => {
        const [{ id: serviceId }] = await createServices([
          {
            name: 'SERVICE_UPDATE_25',
            uri: 'https://SERVICE_UPDATE_25.com',
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
        ]);

        const { statusCode } = await sendHttpRequest<never>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'PATCH',
            json: {
              monitorInterval: VALIDATION.MONITOR_INTERVAL_MAX_VALUE + 1
            } satisfies UpdateService
          }
        );

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
    });
    describe('Thresholds', () => {
      it('Invalid type', async () => {
        const [{ id: serviceId }] = await createServices([
          {
            name: 'SERVICE_UPDATE_26',
            uri: 'https://SERVICE_UPDATE_26.com',
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
        ]);

        const { statusCode } = await sendHttpRequest<never>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'PATCH',
            json: { thresholds: true }
          }
        );

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      describe('Lower limit', () => {
        it('Invalid type', async () => {
          const [{ id: serviceId }] = await createServices([
            {
              name: 'SERVICE_UPDATE_27',
              uri: 'https://SERVICE_UPDATE_27.com',
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
          ]);

          const { statusCode } = await sendHttpRequest<never>(
            `${serviceRouteURL}/${serviceId}`,
            {
              method: 'PATCH',
              json: { thresholds: [{ lowerLimit: true, upperLimit: 19 }] }
            }
          );

          expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
        });
        it('Too low', async () => {
          const [{ id: serviceId }] = await createServices([
            {
              name: 'SERVICE_UPDATE_28',
              uri: 'https://SERVICE_UPDATE_28.com',
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
          ]);

          const { statusCode } = await sendHttpRequest<never>(
            `${serviceRouteURL}/${serviceId}`,
            {
              method: 'PATCH',
              json: {
                thresholds: [
                  {
                    lowerLimit: VALIDATION.THRESHOLD_MIN_VALUE - 1,
                    upperLimit: 19
                  }
                ]
              } satisfies UpdateService
            }
          );

          expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
        });
        it('Too high', async () => {
          const [{ id: serviceId }] = await createServices([
            {
              name: 'SERVICE_UPDATE_29',
              uri: 'https://SERVICE_UPDATE_29.com',
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
          ]);

          const { statusCode } = await sendHttpRequest<never>(
            `${serviceRouteURL}/${serviceId}`,
            {
              method: 'PATCH',
              json: {
                thresholds: [
                  {
                    lowerLimit: VALIDATION.THRESHOLD_MAX_VAL + 1,
                    upperLimit: 19
                  }
                ]
              } satisfies UpdateService
            }
          );

          expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
        });
      });
      describe('Upper limit', () => {
        it('Invalid type', async () => {
          const [{ id: serviceId }] = await createServices([
            {
              name: 'SERVICE_UPDATE_30',
              uri: 'https://SERVICE_UPDATE_30.com',
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
          ]);

          const { statusCode } = await sendHttpRequest<never>(
            `${serviceRouteURL}/${serviceId}`,
            {
              method: 'PATCH',
              json: { thresholds: [{ lowerLimit: 0, upperLimit: true }] }
            }
          );

          expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
        });
        it('Too low', async () => {
          const [{ id: serviceId }] = await createServices([
            {
              name: 'SERVICE_UPDATE_31',
              uri: 'https://SERVICE_UPDATE_31.com',
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
          ]);

          const { statusCode } = await sendHttpRequest<never>(
            `${serviceRouteURL}/${serviceId}`,
            {
              method: 'PATCH',
              json: {
                thresholds: [
                  {
                    lowerLimit: 0,
                    upperLimit: VALIDATION.THRESHOLD_MIN_VALUE - 1
                  }
                ]
              } satisfies UpdateService
            }
          );

          expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
        });
        it('Too high', async () => {
          const [{ id: serviceId }] = await createServices([
            {
              name: 'SERVICE_UPDATE_32',
              uri: 'https://SERVICE_UPDATE_32.com',
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
          ]);

          const { statusCode } = await sendHttpRequest<never>(
            `${serviceRouteURL}/${serviceId}`,
            {
              method: 'PATCH',
              json: {
                thresholds: [
                  {
                    lowerLimit: 0,
                    upperLimit: VALIDATION.THRESHOLD_MAX_VAL + 1
                  }
                ]
              } satisfies UpdateService
            }
          );

          expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
        });
      });
      it('Lower limit equal to upper limit', async () => {
        const [{ id: serviceId }] = await createServices([
          {
            name: 'SERVICE_UPDATE_33',
            uri: 'https://SERVICE_UPDATE_33.com',
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
        ]);

        const { statusCode } = await sendHttpRequest<never>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'PATCH',
            json: {
              thresholds: [{ lowerLimit: 9, upperLimit: 9 }]
            } satisfies UpdateService
          }
        );

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
      it('Lower limit larger than upper limit', async () => {
        const [{ id: serviceId }] = await createServices([
          {
            name: 'SERVICE_UPDATE_34',
            uri: 'https://SERVICE_UPDATE_34.com',
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
        ]);

        const { statusCode } = await sendHttpRequest<never>(
          `${serviceRouteURL}/${serviceId}`,
          {
            method: 'PATCH',
            json: {
              thresholds: [{ lowerLimit: 19, upperLimit: 9 }]
            } satisfies UpdateService
          }
        );

        expect(statusCode).toBe(STATUS.BAD_REQUEST.CODE);
      });
    });
  });
});
