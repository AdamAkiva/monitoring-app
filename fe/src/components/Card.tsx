import {
  CiTrash,
  MdEdit,
  useState,
  type Service,
  type ServiceCreation,
  type ServiceUpdates
} from '@/types';

import SubmitForm from './SubmitForm.tsx';

import './Card.css';

/**********************************************************************************/

const colors = ['#33cc33', '#ff9900', '#ff3300'];

type CardProps = {
  service: Service;
  latency: number;
  onCardClick: (serviceId: string) => void;
  onSubmitForm: (serviceUpdates: ServiceCreation | ServiceUpdates) => void;
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

  const openForm = () => {
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
  };

  const handleCardClick = () => {
    onCardClick(service.id);
  };
  const handleDeleteClick = () => {
    onDeleteClick(service.id);
  };

  let circleColor = '#000000';
  for (let i = 0; i < service.thresholds.length && i < 3; ++i) {
    if (
      latency >= service.thresholds[i].lowerLimit &&
      latency <= service.thresholds[i].upperLimit
    ) {
      circleColor = colors[i];
      break;
    }
    circleColor = colors[2];
  }

  const styles = {
    backgroundColor: circleColor
  };

  return (
    <div className="card">
      {showForm && (
        <SubmitForm
          onSubmitForm={onSubmitForm}
          closeForm={closeForm}
          state={service}
        />
      )}
      <div className="card-header">
        <div className="card-header-modification">
          <button onClick={openForm}>
            <MdEdit />
          </button>
          <button onClick={handleDeleteClick}>
            <CiTrash />
          </button>
        </div>
        <div className="card-header-title" onClick={handleCardClick}>
          <b>Name:</b> {service.name}
        </div>
      </div>
      <div className="card-body" onClick={handleCardClick}>
        <p>
          <b>Latency: </b>
          {latency !== -1 ? `${latency}ms` : null}
        </p>
      </div>
      <div className="card-footer" onClick={handleCardClick}>
        <div className="card-circle" style={styles}></div>
      </div>
    </div>
  );
}
