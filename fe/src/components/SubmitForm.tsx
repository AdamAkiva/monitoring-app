import { AiOutlinePlus, useState } from '@/types';

import './SubmitForm.css';

/**********************************************************************************/

const baseState = {
  name: '',
  uri: '',
  monitorInterval: 0,
  thresholds: [
    {
      id: 0,
      lowerLimit: '',
      upperLimit: ''
    }
  ]
};

/**********************************************************************************/

export default function SubmitForm({ submitForm, closeForm, state }) {
  const [formData, setFormData] = useState(
    (state as typeof baseState | undefined) ?? baseState
  );

  const handleInputChange = (
    field: 'monitorInterval' | 'name' | 'uri',
    value: string
  ) => {
    setFormData((prevData) => {
      return { ...prevData, [field]: value };
    });
  };

  const handleThresholdChange = (params: {
    id: number;
    type: 'lowerLimit' | 'upperLimit';
    value: string;
  }) => {
    const { id, type, value } = params;

    const updatedThresholdRows = formData.thresholds.map(
      (thresholdRow, index) => {
        if (index === id) {
          return {
            ...thresholdRow,
            [type]: value
          };
        }

        return thresholdRow;
      }
    );

    setFormData((prevData) => {
      return {
        ...prevData,
        thresholds: updatedThresholdRows
      };
    });
  };

  const handleAddRow = () => {
    const previousId = formData.thresholds.length;
    setFormData((prevData) => {
      return {
        ...prevData,
        thresholds: [
          ...prevData.thresholds,
          {
            id: previousId + 1,
            lowerLimit: '',
            upperLimit: ''
          }
        ]
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const service = {
      ...formData,
      monitorInterval: Number(formData.monitorInterval),
      thresholds: formData.thresholds.map(({ lowerLimit, upperLimit }) => {
        return {
          lowerLimit: Number(lowerLimit),
          upperLimit: Number(upperLimit)
        };
      })
    };
    submitForm(service);
  };

  const rows = formData.thresholds.map((thresholds, index) => {
    return (
      <div key={index} className="form-row">
        <input
          placeholder="Lower limit"
          type="text"
          value={thresholds.lowerLimit}
          required={true}
          onChange={(e) => {
            return handleThresholdChange({
              id: index,
              type: 'lowerLimit',
              value: e.target.value
            });
          }}
        ></input>
        <input
          placeholder="Upper limit"
          type="text"
          value={thresholds.upperLimit}
          required={true}
          onChange={(e) => {
            return handleThresholdChange({
              id: index,
              type: 'upperLimit',
              value: e.target.value
            });
          }}
        ></input>
        <AiOutlinePlus className="plus-sign" onClick={handleAddRow} />
      </div>
    );
  });

  return (
    <div className="form-window">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Name:</label>
          <input
            type="text"
            placeholder="Google"
            value={formData.name}
            required={true}
            onChange={(e) => {
              return handleInputChange('name', e.target.value);
            }}
          ></input>
        </div>
        <div className="form-row">
          <label>URI:</label>
          <input
            type="text"
            placeholder="https://google.com"
            value={formData.uri}
            required={true}
            onChange={(e) => {
              return handleInputChange('uri', e.target.value);
            }}
          ></input>
        </div>
        <div className="form-row">
          <label>Monitor interval:</label>
          <input
            type="text"
            placeholder="30"
            value={formData.monitorInterval}
            required={true}
            onChange={(e) => {
              return handleInputChange('monitorInterval', e.target.value);
            }}
          ></input>
        </div>
        <div className="form-thresholds">Thresholds:</div>
        {rows}
        <button type="submit">Submit</button>
        <button type="button" onClick={closeForm}>
          Close
        </button>
      </form>
    </div>
  );
}
