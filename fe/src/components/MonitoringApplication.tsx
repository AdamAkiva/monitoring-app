import {
  HttpInstance,
  WebsocketInstance,
  createService,
  deleteService,
  fetchServices,
  updateService
} from '@/api';
import {
  Box,
  Container,
  Grid,
  Stack,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Service,
  type UpsertService
} from '@/types';
import { DEFAULT_SERVICE_DATA_WITH_ID } from '@/utils';

import AddCard from './AddCard.tsx';
import Card from './Card.tsx';
import HeaderInformation from './HeaderInformation.tsx';
import HeaderThreshold from './HeaderThreshold.tsx';

import './MonitoringApplication.css';

/**********************************************************************************/

export default function MonitoringApplication() {
  const httpInstance = useRef(new HttpInstance());
  const ws = useRef<WebsocketInstance | null>(null);

  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState(
    DEFAULT_SERVICE_DATA_WITH_ID
  );
  const [latencyMap, setLatencyMap] = useState(new Map<string, number>());

  // Passing an empty array in order for this hook to be called once
  useEffect(() => {
    ws.current = new WebsocketInstance({ setLatencyMap: setLatencyMap });

    return ws.current.disconnect();
  }, []);
  // Passing an empty array in order for this hook to be called once
  useEffect(() => {
    void fetchServices({
      httpInstance: httpInstance.current,
      setLoading: setLoading,
      setSelectedService: setSelectedService,
      setServices: setServices
    });
  }, []);

  const handleCardClick = useCallback(
    (serviceId: string) => {
      setSelectedService(
        services.find((service) => {
          return serviceId === service.id;
        }) ?? DEFAULT_SERVICE_DATA_WITH_ID
      );
    },
    [services]
  );

  const handleServiceCreation = useCallback(
    (serviceToCreate: UpsertService) => {
      void createService({
        httpInstance: httpInstance.current,
        serviceToCreate: serviceToCreate,
        setServices: setServices,
        setLoading: setLoading
      });
    },
    []
  );
  const handleServiceUpdate = useCallback(
    (serviceUpdates: UpsertService, serviceId?: string) => {
      void updateService({
        httpInstance: httpInstance.current,
        serviceId: serviceId!,
        serviceUpdates: serviceUpdates,
        setServices: setServices,
        setSelectedService: setSelectedService,
        setLoading: setLoading
      });
    },
    []
  );
  const handleServiceDelete = useCallback((serviceId: string) => {
    void deleteService({
      httpInstance: httpInstance.current,
      serviceId: serviceId,
      setServices: setServices,
      setSelectedService: setSelectedService,
      setLoading: setLoading
    });
  }, []);

  const bodyCards = services.map((service) => {
    const serviceLatency = latencyMap.get(service.id) ?? -1;

    return (
      <Grid key={service.id} xs={12} sm={8} md={4} lg={4} xl={2}>
        <Card
          service={service}
          latency={serviceLatency}
          onCardClick={handleCardClick}
          onSubmitForm={handleServiceUpdate}
          onDeleteClick={handleServiceDelete}
        />
      </Grid>
    );
  });
  // There will always be a single AddCard, so its id can be static
  bodyCards.push(
    <Grid key={-1} xs={12} sm={8} md={4} lg={4} xl={2}>
      <AddCard onSubmitForm={handleServiceCreation} />
    </Grid>
  );

  const headerData = {
    headerInformation: (
      <HeaderInformation
        name={selectedService.name}
        uri={selectedService.uri}
        interval={
          selectedService.monitorInterval >= 0
            ? selectedService.monitorInterval.toString()
            : ''
        }
      />
    ),
    headerThresholds: (
      <HeaderThreshold thresholds={selectedService.thresholds} />
    )
  };

  return (
    <Container>
      <Stack
        direction={'row'}
        spacing={{ xs: 1, sm: 2, md: 4, lg: 8, xl: 16 }}
        sx={{
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {headerData.headerInformation}
        {headerData.headerThresholds}
      </Stack>
      <Box sx={{ flexGrow: 1, mt: 10 }}>
        <Grid
          container={true}
          spacing={{ xs: 2, sm: 2, md: 4, lg: 8, xl: 8 }}
          flexWrap={'wrap'}
        >
          {bodyCards}
        </Grid>
      </Box>
    </Container>
  );
}
