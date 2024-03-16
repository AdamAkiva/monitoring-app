import {
  AddIcon,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  randomUUID,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type Service,
  type UpsertService
} from '@/types';
import { ServiceValidator } from '@/validation';

/**********************************************************************************/

// TODO
// Focus does not work by default in strict mode since every hook is called twice

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
  // Used to monitor the current element which needs to be focused.
  // Used to focus on a newly added threshold row
  const focusRef = useRef<HTMLInputElement | null>(null);

  // The reason for keeping all of these states is to allow for validation checks.
  // TODO
  // I have my concerns about the performance of so many state but I'll get
  // to it at a later date

  // Keep the state of the service name
  const [serviceName, setServiceName] = useState({
    text: state?.name ?? '',
    errorText: ''
  });
  // Keep the state of the service uri
  const [serviceUri, setServiceUri] = useState({
    text: state?.uri ?? '',
    errorText: ''
  });
  // Keep the state of the service monitor interval
  const [serviceMonitorInterval, setServiceMonitorInterval] = useState({
    text:
      state && state.monitorInterval >= 0
        ? state.monitorInterval.toString()
        : '',
    errorText: ''
  });
  // Keep the state of the service threshold row(s)
  const [thresholds, setThresholds] = useState(
    state?.thresholds.map(({ id, lowerLimit, upperLimit }) => {
      return {
        id: id,
        lowerLimitText: lowerLimit.toString(),
        lowerLimitErrorText: '',
        upperLimitText: upperLimit.toString(),
        upperLimitErrorText: ''
      };
    }) ?? [
      // The default is one in size, in order to have an empty row when creating
      // a new service
      {
        id: randomUUID(),
        lowerLimitText: '',
        lowerLimitErrorText: '',
        upperLimitText: '',
        upperLimitErrorText: ''
      }
    ]
  );

  // Used to focus a newly added thresholds row
  useEffect(
    () => {
      focusRef.current?.focus();
    },
    // Run this hook whenever the threshold rows size changes
    [thresholds.length]
  );

  const onSubmitHandler = (e: FormEvent<HTMLFormElement>) => {
    // Disable the default behavior of a form, to send a form.
    // I want it to propagate up the chain instead
    e.preventDefault();

    // Basically the idea is to validate every field and change its status to
    // error is it needs to be. In addition we don't remove the previous value
    // because that does not make any sense (hence the ...prevData everywhere)
    let valid = true;
    const serviceNameError = ServiceValidator.nameValidator(serviceName.text);
    if (serviceNameError) {
      setServiceName((prevData) => {
        return {
          ...prevData,
          errorText: serviceNameError
        };
      });
      valid = false;
    }
    const serviceUriError = ServiceValidator.uriValidator(serviceUri.text);
    if (serviceUriError) {
      setServiceUri((prevData) => {
        return {
          ...prevData,
          errorText: serviceUriError
        };
      });
      valid = false;
    }
    const serviceMonitorIntervalError =
      ServiceValidator.monitorIntervalValidator(serviceMonitorInterval.text);
    if (serviceMonitorIntervalError) {
      setServiceMonitorInterval((prevData) => {
        return {
          ...prevData,
          errorText: serviceMonitorIntervalError
        };
      });
      valid = false;
    }
    for (const threshold of thresholds) {
      const thresholdErrs = ServiceValidator.thresholdValidator(
        threshold.lowerLimitText,
        threshold.upperLimitText
      );
      if (thresholdErrs.lowerThreshold || thresholdErrs.upperThreshold) {
        setThresholds((prevData) => {
          return prevData.map((data) => {
            if (data.id === threshold.id) {
              return {
                ...data,
                lowerLimitErrorText: thresholdErrs.lowerThreshold,
                upperLimitErrorText: thresholdErrs.upperThreshold
              };
            }

            return data;
          });
        });
        valid = false;
      }
    }

    if (!valid) {
      return;
    }

    // It is guaranteed to be in order
    const formData = new FormData(e.currentTarget);
    const lowerLimits = formData.getAll('lowerLimit');
    const upperLimits = formData.getAll('upperLimit');

    onSubmitForm(
      {
        name: formData.get('name') as string,
        uri: formData.get('uri') as string,
        monitorInterval: Number(formData.get('monitorInterval')),
        thresholds: lowerLimits.map((lowerLimit, i) => {
          return {
            lowerLimit: Number(lowerLimit),
            upperLimit: Number(upperLimits[i])
          };
        })
      },
      state?.id
    );

    closeForm();
  };

  const rows = thresholds.map((threshold) => {
    return (
      <Stack
        key={threshold.id}
        direction={'row'}
        spacing={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 4 }}
        sx={{ mt: 2.5 }}
      >
        <TextField
          required={true}
          // Used to set focus on a newly added threshold row
          inputRef={
            threshold.id === String(thresholds.length) ? focusRef : null
          }
          margin={'normal'}
          id={'lowerLimit'}
          name={'lowerLimit'}
          label={'Lower Limit'}
          type={'number'}
          fullWidth={true}
          variant={'filled'}
          placeholder={'0'}
          value={threshold.lowerLimitText}
          error={!!threshold.lowerLimitErrorText}
          helperText={threshold.lowerLimitErrorText}
          onChange={(e) => {
            // Used to update the state and reset the error value (if exists)
            setThresholds((prevData) => {
              return prevData.map((data) => {
                if (data.id === threshold.id) {
                  return {
                    ...data,
                    lowerLimitText: e.target.value,
                    lowerLimitErrorText: ''
                  };
                }

                return data;
              });
            });
          }}
        />
        <TextField
          required={true}
          margin={'normal'}
          id={'upperLimit'}
          name={'upperLimit'}
          label={'Upper Limit'}
          type={'number'}
          fullWidth={true}
          variant={'filled'}
          placeholder={'99'}
          value={threshold.upperLimitText}
          error={!!threshold.upperLimitErrorText}
          helperText={threshold.upperLimitErrorText}
          onChange={(e) => {
            // Used to update the state and reset the error value (if exists)
            setThresholds((prevData) => {
              return prevData.map((data) => {
                if (data.id === threshold.id) {
                  return {
                    ...data,
                    upperLimitText: e.target.value,
                    upperLimitErrorText: ''
                  };
                }

                return data;
              });
            });
          }}
        />
        <IconButton
          type="button"
          disabled={
            thresholds.length === ServiceValidator.MAX_THRESHOLDS_AMOUNT
          }
          sx={{ borderRadius: 0 }}
          onClick={() => {
            // Create a new threshold row on a button click
            setThresholds((prevData) => {
              return [
                ...prevData,
                {
                  id: String(prevData.length + 1),
                  lowerLimitText: '',
                  lowerLimitErrorText: '',
                  upperLimitText: '',
                  upperLimitErrorText: ''
                }
              ];
            });
          }}
        >
          <AddIcon />
        </IconButton>
      </Stack>
    );
  });

  return (
    <Dialog
      open={true}
      onClose={closeForm}
      // Use MUI Paper as the container as a form component
      PaperProps={{
        component: 'form',
        onSubmit: onSubmitHandler
      }}
    >
      <DialogTitle align={'center'} fontWeight={500} fontSize={24}>
        Add Service
      </DialogTitle>
      <DialogContent dividers={true}>
        <DialogContentText align={'center'} fontWeight={400} fontSize={18}>
          To add a new service please fill out this form:
        </DialogContentText>
        <TextField
          autoFocus={true}
          required={true}
          margin={'normal'}
          id={'name'}
          name={'name'}
          label={'Service Name'}
          type={'text'}
          fullWidth={true}
          variant={'filled'}
          placeholder={'Google'}
          value={serviceName.text}
          error={!!serviceName.errorText}
          helperText={serviceName.errorText}
          onChange={(e) => {
            // Used to update the state and reset the error value (if exists)
            setServiceName({
              text: e.target.value,
              errorText: ''
            });
          }}
        />
        <TextField
          required={true}
          margin={'normal'}
          id={'uri'}
          name={'uri'}
          label={'URI'}
          type={'text'}
          fullWidth={true}
          variant={'filled'}
          placeholder={'https://google.com'}
          value={serviceUri.text}
          error={!!serviceUri.errorText}
          helperText={serviceUri.errorText}
          onChange={(e) => {
            // Used to update the state and reset the error value (if exists)
            setServiceUri({
              text: e.target.value,
              errorText: ''
            });
          }}
        />
        <TextField
          required={true}
          margin={'normal'}
          id={'monitorInterval'}
          name={'monitorInterval'}
          label={'Monitor Interval'}
          type={'number'}
          fullWidth={true}
          variant={'filled'}
          placeholder={'2000'}
          value={serviceMonitorInterval.text}
          error={!!serviceMonitorInterval.errorText}
          helperText={serviceMonitorInterval.errorText}
          onChange={(e) => {
            // Used to update the state and reset the error value (if exists)
            setServiceMonitorInterval({
              text: e.target.value,
              errorText: ''
            });
          }}
        />
        {rows}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'left' }}>
        <Button type="button" onClick={closeForm}>
          Cancel
        </Button>
        <Button type="submit">{state ? 'Update' : 'Add'}</Button>
      </DialogActions>
    </Dialog>
  );
}
