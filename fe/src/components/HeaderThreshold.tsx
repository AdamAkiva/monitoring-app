import { Stack, Typography, type Service } from '@/types';

/**********************************************************************************/

type HeaderThresholdProps = Pick<Service, 'thresholds'>;

/**********************************************************************************/

export default function HeaderThreshold({ thresholds }: HeaderThresholdProps) {
  const thresholdElements = thresholds.map(({ id, lowerLimit, upperLimit }) => {
    return (
      <Stack
        key={id}
        direction={'row'}
        spacing={{ xs: 2, sm: 2, md: 4, lg: 4, xl: 8 }}
        sx={{
          width: '100%',
          maxWidth: 400,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Stack
          direction={'row'}
          sx={{ justifyContent: 'inherit', alignItems: 'inherit' }}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Lower threshold:
          </Typography>
          <Typography variant="body1" sx={{ ml: 1 }}>
            {lowerLimit >= 0 ? `${lowerLimit}ms` : null}
          </Typography>
        </Stack>
        <Stack
          direction={'row'}
          sx={{ justifyContent: 'inherit', alignItems: 'inherit' }}
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Upper threshold:
          </Typography>
          <Typography variant="body1" sx={{ ml: 1 }}>
            {upperLimit >= 0 ? `${upperLimit}ms` : null}
          </Typography>
        </Stack>
      </Stack>
    );
  });

  return (
    <Stack
      direction={'column'}
      spacing={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 4 }}
      sx={{ justifyContent: 'center', alignItems: 'center' }}
    >
      {thresholdElements}
    </Stack>
  );
}
