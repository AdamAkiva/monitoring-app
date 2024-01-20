import { AiOutlinePlus, useState } from '@/types';
import SubmitForm from './SubmitForm.tsx';

import './AddCard.css';

/**********************************************************************************/

export default function AddCard({ submitForm }) {
  const [showForm, setShowForm] = useState(false);

  const openForm = () => {
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  return (
    <div className="add-card">
      <button className="add-card" onClick={openForm}>
        <AiOutlinePlus />
      </button>
      {showForm && (
        <SubmitForm
          submitForm={submitForm}
          closeForm={closeForm}
          state={undefined}
        />
      )}
    </div>
  );
}
