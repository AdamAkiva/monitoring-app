import { Stack, Typography } from '@/types';

/**********************************************************************************/

type HeaderInformationProps = {
  name: string;
  uri: string;
  interval: string;
};

/**********************************************************************************/

export default function HeaderInformation({
  name,
  uri,
  interval
}: HeaderInformationProps) {
  return (
    <Stack
      direction={'row'}
      sx={{
        width: '40%',
        justifyContent: 'space-evenly',
        alignItems: 'space-evenly',
        p: 2
      }}
    >
      <Stack
        direction={'column'}
        spacing={{ xs: 0, sm: 0.5, md: 0.5, lg: 1, xl: 1 }}
        sx={{ justifyContent: 'left', alignItems: 'left' }}
      >
        <Typography variant="body1" sx={{ fontSize: 18, fontWeight: 500 }}>
          Name:
        </Typography>
        <Typography variant="body1" sx={{ fontSize: 18, fontWeight: 500 }}>
          URI:
        </Typography>
        <Typography variant="body1" sx={{ fontSize: 18, fontWeight: 500 }}>
          Interval:
        </Typography>
      </Stack>
      <Stack
        direction={'column'}
        spacing={{ xs: 0, sm: 0.5, md: 0.5, lg: 1, xl: 1 }}
        sx={{ justifyContent: 'left', alignItems: 'left' }}
      >
        <Typography variant="body1" sx={{ fontSize: 18 }}>
          {name}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: 18 }}>
          {uri}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: 18 }}>
          {interval.length ? `${interval}ms` : null}
        </Typography>
      </Stack>
    </Stack>
  );
}
