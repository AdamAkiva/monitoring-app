import {
  HttpInstance,
  WebsocketInstance,
  createService,
  deleteService,
  fetchServices,
  updateService
} from '@/api';
import {
  AddIcon,
  Box,
  Container,
  Grid,
  IconButton,
  Stack,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Service,
  type UpsertService
} from '@/types';
import { DEFAULT_SERVICE_DATA_WITH_ID } from '@/utils';

import Card from './Card.tsx';
import HeaderInformation from './HeaderInformation.tsx';
import HeaderThreshold from './HeaderThreshold.tsx';

import './MonitoringApplication.css';
import SubmitForm from './SubmitForm.tsx';

/**********************************************************************************/

export default function MonitoringApplication() {
  const httpInstance = useRef(new HttpInstance());
  const ws = useRef<WebsocketInstance | null>(null);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState(
    DEFAULT_SERVICE_DATA_WITH_ID
  );
  const [latencyMap, setLatencyMap] = useState(new Map<string, number>());

  // Passing an empty array in order for this hook to be called once, only
  // on the initial mount
  useEffect(() => {
    ws.current = new WebsocketInstance({ setLatencyMap: setLatencyMap });

    return ws.current.disconnect();
  }, []);
  // Passing an empty array in order for this hook to be called once, only
  // on the initial mount
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

  const openForm = useCallback(() => {
    setShowForm(true);
  }, []);
  const closeForm = useCallback(() => {
    setShowForm(false);
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
  // There will always be a single AddCard, so the key can be static
  bodyCards.push(
    <Grid key={-1} xs={12} sm={8} md={4} lg={4} xl={2}>
      <IconButton
        type="button"
        aria-label="Add new service"
        onClick={() => {
          openForm();
        }}
      >
        <AddIcon />
      </IconButton>
      {showForm ? (
        <SubmitForm
          onSubmitForm={handleServiceCreation}
          closeForm={closeForm}
          state={null}
        />
      ) : null}
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
    <Container maxWidth={'xl'}>
      <Stack
        direction={'row'}
        spacing={{ xs: 2, sm: 2, md: 4, lg: 8, xl: 16 }}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          pt: 2,
          pb: 4
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
