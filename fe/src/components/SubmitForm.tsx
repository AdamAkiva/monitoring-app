import {
  AddIcon,
  Button,
  IconButton,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Service,
  type UpsertService
} from '@/types';
import { DEFAULT_SERVICE_DATA_WITHOUT_ID } from '@/utils';

/**********************************************************************************/

type SubmitFormProps = {
  onSubmitForm: (service: UpsertService, serviceId?: string) => void;
  closeForm: () => void;
  state: Service | null;
};

/**********************************************************************************/

export default function SubmitForm({
  onSubmitForm,
  closeForm,
  state
}: SubmitFormProps) {
  const [formData, setFormData] = useState(
    state ?? DEFAULT_SERVICE_DATA_WITHOUT_ID
  );
  const thresholdRowRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    thresholdRowRef.current?.focus();
  }, [formData.thresholds.length]);

  const handleInputChange = useCallback(
    (field: 'monitorInterval' | 'name' | 'uri', value: string) => {
      setFormData((prevFormData) => {
        return { ...prevFormData, [field]: value };
      });
    },
    []
  );

  const handleThresholdChange = useCallback(
    (params: {
      id: string;
      type: 'lowerLimit' | 'upperLimit';
      value: string;
    }) => {
      const { id, type, value } = params;

      const updatedThresholdRows = formData.thresholds.map((thresholdRow) => {
        if (thresholdRow.id === id) {
          return {
            ...thresholdRow,
            [type]: value
          };
        }

        return thresholdRow;
      });

      setFormData((prevFormData) => {
        return {
          ...prevFormData,
          thresholds: updatedThresholdRows
        };
      });
    },
    [formData.thresholds]
  );

  const rows = formData.thresholds.map(({ id, lowerLimit, upperLimit }) => {
    return (
      <div key={id} className="form-row">
        <input
          placeholder="Lower limit"
          type="number"
          min={0}
          max={Number.MAX_SAFE_INTEGER}
          value={lowerLimit >= 0 ? lowerLimit : ''}
          required={true}
          // Used to set focus on a newly added row
          ref={
            id === String(formData.thresholds.length) ? thresholdRowRef : null
          }
          onChange={(e) => {
            return handleThresholdChange({
              id: id,
              type: 'lowerLimit',
              value: e.target.value
            });
          }}
        />
        <input
          placeholder="Upper limit"
          type="number"
          min={0}
          max={Number.MAX_SAFE_INTEGER}
          value={upperLimit >= 0 ? upperLimit : ''}
          required={true}
          onChange={(e) => {
            return handleThresholdChange({
              id: id,
              type: 'upperLimit',
              value: e.target.value
            });
          }}
        />
        <IconButton
          aria-label="Add new threshold row"
          type="button"
          onClick={() => {
            setFormData((prevData) => {
              return {
                ...prevData,
                thresholds: [
                  ...prevData.thresholds,
                  {
                    id: String(prevData.thresholds.length + 1),
                    lowerLimit: -1,
                    upperLimit: -1
                  }
                ]
              };
            });
          }}
        >
          <AddIcon />
        </IconButton>
      </div>
    );
  });

  return (
    <div className="form-window">
      <form
        onSubmit={(e) => {
          // To prevent a page refresh
          e.preventDefault();

          // Close the form manually since we disabled the page refresh
          closeForm();

          // Making sure the numbers are actual number types and not strings
          const upsertData: UpsertService = {
            name: formData.name,
            uri: formData.uri,
            monitorInterval: Number(formData.monitorInterval),
            thresholds: formData.thresholds.map(
              ({ lowerLimit, upperLimit }) => {
                return {
                  lowerLimit: Number(lowerLimit),
                  upperLimit: Number(upperLimit)
                };
              }
            )
          };

          return onSubmitForm(upsertData, state?.id);
        }}
      >
        <div className="form-row">
          <label>Name:</label>
          <input
            type="text"
            placeholder="Google"
            autoFocus={true}
            minLength={1}
            maxLength={2048}
            value={formData.name}
            required={true}
            onChange={(e) => {
              return handleInputChange('name', e.target.value);
            }}
          />
        </div>
        <div className="form-row">
          <label>URI:</label>
          <input
            type="string"
            placeholder="https://google.com"
            minLength={1}
            maxLength={2048}
            value={formData.uri}
            required={true}
            onChange={(e) => {
              return handleInputChange('uri', e.target.value);
            }}
          />
        </div>
        <div className="form-row">
          <label>Monitor interval:</label>
          <input
            type="number"
            placeholder="30"
            min={50}
            max={Number.MAX_SAFE_INTEGER}
            value={
              formData.monitorInterval >= 0 ? formData.monitorInterval : ''
            }
            required={true}
            onChange={(e) => {
              return handleInputChange('monitorInterval', e.target.value);
            }}
          />
        </div>
        <div className="form-thresholds">Thresholds:</div>
        {rows}
        <Button type="submit">Submit</Button>
        <Button type="button" onClick={closeForm}>
          Close
        </Button>
      </form>
    </div>
  );
}
