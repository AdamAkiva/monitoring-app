import type {
  Dispatch,
  Service,
  ServiceCreation,
  SetStateAction
} from '@/types';
import { httpInstance } from '@/utils';

/**********************************************************************************/

export const fetchServices = async (params: {
  setServices: Dispatch<SetStateAction<Service[]>>;
  setSelectedService: Dispatch<SetStateAction<Service | undefined>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  const { setServices, setSelectedService, setLoading } = params;

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
        monitorInterval: '',
        thresholds: [{ lowerLimit: '', upperLimit: '' }]
      }
    );
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

export const createService = async (params: {
  serviceToCreate: ServiceCreation;
  setServices: Dispatch<SetStateAction<Service[]>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  const { serviceToCreate, setServices, setLoading } = params;

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
  serviceUpdates: Partial<Omit<Service, 'id'>> & Pick<Service, 'id'>;
  setServices: Dispatch<SetStateAction<Service[]>>;
  setSelectedService: Dispatch<SetStateAction<Service | undefined>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  const { serviceUpdates, setServices, setSelectedService, setLoading } =
    params;
  const { id: serviceId, ...updates } = serviceUpdates;

  setLoading(true);
  try {
    const res = await httpInstance.sendRequest<Service>(
      `services/${serviceId}`,
      { method: 'patch', json: updates }
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
      if (service && service.id === serviceId) {
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
  serviceId: string;
  setServices: Dispatch<SetStateAction<Service[]>>;
  setSelectedService: Dispatch<SetStateAction<Service | undefined>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) => {
  const { serviceId, setServices, setSelectedService, setLoading } = params;

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
      if (removedServiceIndex !== -1) {
        return services.splice(removedServiceIndex, 1);
      }

      return services;
    });
    setSelectedService((service) => {
      if (service && service.id === serviceId) {
        return undefined;
      }

      return service;
    });
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
