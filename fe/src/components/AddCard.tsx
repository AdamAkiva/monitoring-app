import {
  AiOutlinePlus,
  useCallback,
  useState,
  type ServiceCreation,
  type ServiceUpdates
} from '@/types';
import SubmitForm from './SubmitForm.tsx';

import './AddCard.css';

/**********************************************************************************/

type AddCardProps = {
  onSubmitForm: (serviceUpdates: ServiceCreation | ServiceUpdates) => void;
};

/**********************************************************************************/

export default function AddCard({ onSubmitForm }: AddCardProps) {
  const [showForm, setShowForm] = useState(false);

  const openForm = useCallback(() => {
    setShowForm(true);
  }, []);
  const closeForm = useCallback(() => {
    setShowForm(false);
  }, []);

  return (
    <div className="add-card">
      <button className="add-card" onClick={openForm}>
        <AiOutlinePlus />
      </button>
      {showForm && (
        <SubmitForm
          onSubmitForm={onSubmitForm}
          closeForm={closeForm}
          state={undefined}
        />
      )}
    </div>
  );
}
