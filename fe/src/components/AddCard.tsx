import {
  AddIcon,
  IconButton,
  useCallback,
  useState,
  type UpsertService
} from '@/types';

import SubmitForm from './SubmitForm.tsx';

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
    <>
      <IconButton type="button" aria-label="Add new service" onClick={openForm}>
        <AddIcon />
      </IconButton>
      {showForm ? (
        <SubmitForm
          onSubmitForm={onSubmitForm}
          closeForm={closeForm}
          state={null}
        />
      ) : null}
    </>
  );
}
