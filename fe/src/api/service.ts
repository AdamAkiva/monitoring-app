import type { Service, SetState, UpsertService } from '@/types';
import { DEFAULT_SERVICE_DATA_WITH_ID } from '@/utils';

import type HttpInstance from './http.ts';

/**********************************************************************************/

export const fetchServices = async (params: {
  httpInstance: HttpInstance;
  setServices: SetState<Service[]>;
  setSelectedService: SetState<Service>;
  setLoading: SetState<boolean>;
}) => {
  const { httpInstance, setServices, setSelectedService, setLoading } = params;

  setLoading(true);
  try {
    const res = await httpInstance.sendRequest<Service[]>('services', {
      method: 'get'
    });
    if (res.statusCode !== 200) {
      throw new Error('Network error');
    }

    setServices(res.data);
    setSelectedService(
      res.data[0] ?? {
        id: '',
        name: '',
        monitorInterval: -1,
        thresholds: [{ id: '', lowerLimit: -1, upperLimit: -1 }]
      }
    );
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

export const createService = async (params: {
  httpInstance: HttpInstance;
  serviceToCreate: UpsertService;
  setServices: SetState<Service[]>;
  setLoading: SetState<boolean>;
}) => {
  const { httpInstance, serviceToCreate, setServices, setLoading } = params;

  console.log(serviceToCreate);

  setLoading(true);
  try {
    const res = await httpInstance.sendRequest<Service>('services', {
      method: 'post',
      json: serviceToCreate
    });
    if (res.statusCode !== 201) {
      throw new Error('Network error');
    }
    setServices((services) => {
      return [...services, res.data];
    });
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

export const updateService = async (params: {
  httpInstance: HttpInstance;
  serviceId: string;
  serviceUpdates: UpsertService;
  setServices: SetState<Service[]>;
  setSelectedService: SetState<Service>;
  setLoading: SetState<boolean>;
}) => {
  const {
    httpInstance,
    serviceId,
    serviceUpdates,
    setServices,
    setSelectedService,
    setLoading
  } = params;

  setLoading(true);
  try {
    const res = await httpInstance.sendRequest<Service>(
      `services/${serviceId}`,
      { method: 'patch', json: serviceUpdates }
    );
    if (res.statusCode !== 200) {
      throw new Error('Network error');
    }

    setServices((services) => {
      return services.map((service) => {
        if (serviceId !== service.id) {
          return service;
        }

        return res.data;
      });
    });
    setSelectedService((service) => {
      if (service.id === serviceId) {
        return res.data;
      }

      return service;
    });
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

export const deleteService = async (params: {
  httpInstance: HttpInstance;
  serviceId: string;
  setServices: SetState<Service[]>;
  setSelectedService: SetState<Service>;
  setLoading: SetState<boolean>;
}) => {
  const {
    httpInstance,
    serviceId,
    setServices,
    setSelectedService,
    setLoading
  } = params;

  setLoading(true);
  try {
    const res = await httpInstance.sendRequest<string>(
      `services/${serviceId}`,
      {
        method: 'delete'
      }
    );
    if (res.statusCode !== 200) {
      throw new Error('Network error');
    }

    setServices((services) => {
      const removedServiceIndex = services.findIndex((service) => {
        return serviceId === service.id;
      });
      if (removedServiceIndex >= 0) {
        return services.splice(removedServiceIndex, 1);
      }

      return services;
    });
    setSelectedService((service) => {
      if (service.id === serviceId) {
        return DEFAULT_SERVICE_DATA_WITH_ID;
      }

      return service;
    });
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
