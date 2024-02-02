import { Grid, Typography, type Service } from '@/types';

/**********************************************************************************/

type HeaderThresholdProps = Pick<Service, 'thresholds'>;

/**********************************************************************************/

export default function HeaderThreshold({ thresholds }: HeaderThresholdProps) {
  const thresholdElements = thresholds.map(({ id, lowerLimit, upperLimit }) => {
    return (
      <Grid
        key={id}
        container={true}
        direction={'row'}
        spacing={{ xs: 2, sm: 2, md: 4, lg: 4, xl: 8 }}
        justifyContent={'center'}
      >
        <Grid>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {upperLimit >= 0 ? 'Lower threshold:' : null}
          </Typography>
          <Typography variant="body1" sx={{ ml: 0.66, textAlign: 'center' }}>
            {lowerLimit >= 0 ? `${lowerLimit}ms` : null}
          </Typography>
        </Grid>
        <Grid>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {upperLimit >= 0 ? 'Upper threshold:' : null}
          </Typography>
          <Typography variant="body1" sx={{ ml: 0.66, textAlign: 'center' }}>
            {upperLimit >= 0 ? `${upperLimit}ms` : null}
          </Typography>
        </Grid>
      </Grid>
    );
  });

  return (
    <Grid
      container={true}
      direction={'column'}
      justifyContent={'flex-start'}
      spacing={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 4 }}
    >
      {thresholdElements}
    </Grid>
  );
}
