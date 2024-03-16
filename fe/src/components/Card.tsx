import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  DeleteIcon,
  EditIcon,
  IconButton,
  Lens,
  Stack,
  Typography,
  useCallback,
  useState,
  type Service,
  type UpsertService
} from '@/types';
import { SUPPORTED_COLORS, uppercaseFirstLetter } from '@/utils';
import { ServiceValidator } from '@/validation';

import SubmitForm from './SubmitForm.tsx';

/**********************************************************************************/

type CardProps = {
  service: Service;
  latency: number;
  onCardClick: (serviceId: string) => void;
  onSubmitForm: (serviceUpdates: UpsertService, serviceId?: string) => void;
  onDeleteClick: (serviceId: string) => void;
};

/**********************************************************************************/

export default function ServiceCard({
  service,
  latency,
  onCardClick,
  onSubmitForm,
  onDeleteClick
}: CardProps) {
  const [showForm, setShowForm] = useState(false);

  const openForm = useCallback(() => {
    setShowForm(true);
  }, []);
  const closeForm = useCallback(() => {
    setShowForm(false);
  }, []);

  const handleDeleteClick = useCallback(() => {
    onDeleteClick(service.id);
  }, [onDeleteClick, service.id]);

  const handleCardClick = useCallback(() => {
    onCardClick(service.id);
  }, [onCardClick, service.id]);

  let circleColor = '#000000';
  for (
    let i = 0;
    i < service.thresholds.length && i < ServiceValidator.MAX_THRESHOLDS_AMOUNT;
    ++i
  ) {
    if (
      latency >= service.thresholds[i].lowerLimit &&
      latency <= service.thresholds[i].upperLimit
    ) {
      circleColor = SUPPORTED_COLORS[i];
      break;
    }
    circleColor = SUPPORTED_COLORS[2];
  }

  return (
    <>
      {showForm ? (
        <SubmitForm
          onSubmitForm={onSubmitForm}
          closeForm={closeForm}
          state={service}
        />
      ) : null}
      <Card onClick={handleCardClick}>
        <CardActions>
          <IconButton
            type="button"
            size="small"
            onClick={(e) => {
              e.stopPropagation();

              openForm();
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            type="button"
            size="small"
            onClick={(e) => {
              e.stopPropagation();

              handleDeleteClick();
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </CardActions>
        <CardHeader
          title={uppercaseFirstLetter(service.name)}
          titleTypographyProps={{
            variant: 'h6',
            fontWeight: 700,
            textAlign: 'center'
          }}
        />
        <CardContent>
          <Stack direction={'column'} spacing={2} sx={{ alignItems: 'center' }}>
            <Stack direction={'row'} spacing={0.66} sx={{ mb: 0.66, p: 0.66 }}>
              <Typography variant="body1" fontWeight={600}>
                Latency:
              </Typography>
              <Typography variant="body1">
                {latency >= 0 ? `${latency}ms` : ''}
              </Typography>
            </Stack>
            <Lens fontSize="large" htmlColor={circleColor} />
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
