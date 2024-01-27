import {
  DeleteIcon,
  EditIcon,
  IconButton,
  useCallback,
  useState,
  type Service,
  type UpsertService
} from '@/types';
import { SUPPORTED_COLORS } from '@/utils';

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

export default function Card({
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
  for (let i = 0; i < service.thresholds.length && i < 3; ++i) {
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
    <div className="card">
      {showForm ? (
        <SubmitForm
          onSubmitForm={onSubmitForm}
          closeForm={closeForm}
          state={service}
        />
      ) : null}
      <div className="card-header">
        <div className="card-header-modification">
          <IconButton
            aria-label="Edit service"
            type="button"
            onClick={openForm}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            aria-label="Delete service"
            type="button"
            onClick={(e) => {
              e.stopPropagation();

              handleDeleteClick();
            }}
          >
            <DeleteIcon />
          </IconButton>
        </div>
        <div className="card-header-title" onClick={handleCardClick}>
          <b>Name:</b> {service.name}
        </div>
      </div>
      <div className="card-body" onClick={handleCardClick}>
        <p>
          <b>Latency: </b>
          {latency >= 0 ? `${latency}ms` : ''}
        </p>
      </div>
      <div className="card-footer" onClick={handleCardClick}>
        <div className="card-circle" style={{ backgroundColor: circleColor }} />
      </div>
    </div>
  );
}
