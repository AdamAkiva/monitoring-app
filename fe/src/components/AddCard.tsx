import {
  AiOutlinePlus,
  useCallback,
  useState,
  type UpsertService
} from '@/types';

import SubmitForm from './SubmitForm.tsx';

import './AddCard.css';

/**********************************************************************************/

type AddCardProps = {
  onSubmitForm: (serviceUpdates: UpsertService, serviceId?: string) => void;
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
      <button type="button" className="add-card" onClick={openForm}>
        <AiOutlinePlus />
      </button>
      {showForm ? (
        <SubmitForm
          onSubmitForm={onSubmitForm}
          closeForm={closeForm}
          state={null}
        />
      ) : null}
    </div>
  );
}
