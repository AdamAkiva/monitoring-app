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
        width: '100%',
        maxWidth: 400,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Stack
        direction={'column'}
        spacing={{ xs: 0, sm: 0.5, md: 0.5, lg: 1, xl: 1 }}
        sx={{ justifyContent: 'left', alignItems: 'left', mr: 1.5 }}
      >
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Name:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          URI:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Interval:
        </Typography>
      </Stack>
      <Stack
        direction={'column'}
        spacing={{ xs: 0, sm: 0.5, md: 0.5, lg: 1, xl: 1 }}
        sx={{ justifyContent: 'left', alignItems: 'left' }}
      >
        <Typography variant="body1">{name}</Typography>
        <Typography variant="body1">{uri}</Typography>
        <Typography variant="body1">
          {interval.length ? `${interval}ms` : null}
        </Typography>
      </Stack>
    </Stack>
  );
}
