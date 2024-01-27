import MonitoringApplication from '@/components/MonitoringApplication.tsx';
import { React, ReactDOM } from '@/types';

/**********************************************************************************/

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

/**********************************************************************************/

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MonitoringApplication />
  </React.StrictMode>
);
