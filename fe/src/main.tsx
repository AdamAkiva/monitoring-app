import MonitoringApplication from '@/components/MonitoringApplication.tsx';
import { React, ReactDOM } from '@/types';

/**********************************************************************************/

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MonitoringApplication />
  </React.StrictMode>
);
