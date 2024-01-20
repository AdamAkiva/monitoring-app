import { useEffect, useState, type Service } from '@/types';
import {
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
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:4500');
    socket.addEventListener('open', () => {
      console.log('Socket connection established');
    });
    socket.addEventListener('error', (e) => {
      console.error(e);
    });
    socket.addEventListener('close', () => {
      console.log('Socket connection closed');
    });
    socket.addEventListener('message', (e) => {
      setLatency(JSON.parse(e.data).reqTime);
    });

    void fetchServices({
      setServices: setServices,
      setSelectedService: setSelectedService,
      setLoading: setLoading
    });
  }, []);

  const handleCardClick = (serviceId: string) => {
    setSelectedService(
      services.find((service) => {
        return serviceId === service.id;
      })
    );
  };

  const handleCreate = (service: Service) => {
    void createService({
      serviceToCreate: service,
      setServices: setServices,
      setLoading: setLoading
    });
  };

  const handleUpdateClick = (
    service: Partial<Omit<Service, 'id'>> & Pick<Service, 'id'>
  ) => {
    void updateService({
      service: service,
      setServices: setServices,
      setSelectedService: setSelectedService,
      setLoading: setLoading
    });
  };

  const handleDeleteClick = (serviceId: string) => {
    void deleteService({
      serviceId: serviceId,
      setServices: setServices,
      setLoading: setLoading
    });
  };

  const bodyCards = services.map((service, index) => {
    return (
      <Card
        key={index}
        service={service}
        latency={latency}
        onCardClick={handleCardClick}
        submitForm={handleUpdateClick}
        onDeleteClick={handleDeleteClick}
      />
    );
  });
  bodyCards.push(
    <AddCard key={bodyCards.length + 1} submitForm={handleCreate} />
  );
  const headerData = {
    headerInformation: (
      <HeaderInformation
        name={selectedService?.name ?? ''}
        uri={selectedService?.uri ?? ''}
        interval={selectedService?.monitorInterval.toString() ?? '0'}
      />
    ),
    headerThresholds: <HeaderThreshold items={selectedService?.thresholds} />,
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
