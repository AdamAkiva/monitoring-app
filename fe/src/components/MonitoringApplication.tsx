// TODO Resolve this
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  useCallback,
  useEffect,
  useState,
  type Service,
  type ServiceCreation,
  type ServiceUpdates
} from '@/types';
import {
  WebsocketInstance,
  createService,
  deleteService,
  fetchServices,
  updateService
} from '@/utils';

import AddCard from './AddCard.tsx';
import Card from './Card.tsx';
import HeaderInformation from './HeaderInformation.tsx';
import HeaderThreshold from './HeaderThreshold.tsx';

import './MonitoringApplication.css';

/**********************************************************************************/

export default function MonitoringApplication() {
  // TODO Need to set a loading sign for the page if loading is false value
  const [, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [latency, setLatency] = useState(0);

  const handleCardClick = useCallback(
    (serviceId: string) => {
      setSelectedService(
        services.find((service) => {
          return serviceId === service.id;
        })
      );
    },
    [services]
  );
  const handleCreate = useCallback((service: ServiceCreation) => {
    void createService({
      serviceToCreate: service,
      setServices: setServices,
      setLoading: setLoading
    });
  }, []);
  const handleUpdate = useCallback((serviceUpdates: ServiceUpdates) => {
    void updateService({
      serviceUpdates: serviceUpdates,
      setServices: setServices,
      setSelectedService: setSelectedService,
      setLoading: setLoading
    });
  }, []);
  const handleDelete = useCallback((serviceId: string) => {
    void deleteService({
      serviceId: serviceId,
      setServices: setServices,
      setSelectedService: setSelectedService,
      setLoading: setLoading
    });
  }, []);

  useEffect(() => {
    new WebsocketInstance(setLatency);

    void fetchServices({
      setServices: setServices,
      setSelectedService: setSelectedService,
      setLoading: setLoading
    });
  }, []);

  const bodyCards = services.map((service, index) => {
    return (
      <Card
        key={index}
        service={service}
        latency={latency}
        onCardClick={handleCardClick}
        // TODO Resolve this
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        onSubmitForm={handleUpdate}
        onDeleteClick={handleDelete}
      />
    );
  });
  bodyCards.push(
    // TODO Resolve this
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    <AddCard key={bodyCards.length + 1} onSubmitForm={handleCreate} />
  );
  const headerData = {
    headerInformation: (
      <HeaderInformation
        name={selectedService?.name ?? ''}
        uri={selectedService?.uri ?? ''}
        interval={selectedService?.monitorInterval.toString() ?? ''}
      />
    ),
    headerThresholds: (
      // TODO Resolve this
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      <HeaderThreshold thresholds={selectedService?.thresholds} />
    ),
    bodyCards: bodyCards
  };

  return (
    <div className="app">
      <div className="header">
        {headerData.headerInformation}
        {headerData.headerThresholds}
      </div>
      <div className="body">{bodyCards}</div>
    </div>
  );
}
