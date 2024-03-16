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
        justifyContent: 'space-evenly',
        alignItems: 'space-evenly',
        p: 1.33
      }}
    >
      <Stack
        direction={'column'}
        justifyItems={'center'}
        alignItems={'center'}
        spacing={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2 }}
      >
        <Stack
          direction={'row'}
          spacing={{ xs: 0, sm: 0.66, md: 0.66, lg: 1.33, xl: 1.33 }}
        >
          <Typography variant="body1" sx={{ fontSize: 18, fontWeight: 500 }}>
            Name:
          </Typography>
          <Typography variant="body1" sx={{ fontSize: 18 }}>
            {name}
          </Typography>
        </Stack>
        <Stack
          direction={'row'}
          spacing={{ xs: 0, sm: 0.66, md: 0.66, lg: 1.33, xl: 1.33 }}
        >
          <Typography variant="body1" sx={{ fontSize: 18, fontWeight: 500 }}>
            URI:
          </Typography>
          <Typography variant="body1" sx={{ fontSize: 18 }}>
            {uri}
          </Typography>
        </Stack>
        <Stack
          direction={'row'}
          spacing={{ xs: 0, sm: 0.66, md: 0.66, lg: 1.33, xl: 1.33 }}
        >
          <Typography variant="body1" sx={{ fontSize: 18, fontWeight: 500 }}>
            Interval:
          </Typography>
          <Typography variant="body1" sx={{ fontSize: 18 }}>
            {interval.length ? `${interval}ms` : null}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
