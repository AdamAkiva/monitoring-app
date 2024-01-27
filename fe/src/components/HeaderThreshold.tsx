import type { Service } from '@/types';

import './HeaderThreshold.css';

/**********************************************************************************/

type HeaderThresholdProps = Pick<Service, 'thresholds'>;

/**********************************************************************************/

export default function HeaderThreshold({ thresholds }: HeaderThresholdProps) {
  const thresholdElements = thresholds.map(({ id, lowerLimit, upperLimit }) => {
    return (
      <div key={id} className="header-thresholds-section">
        <b>Lower threshold:</b> {lowerLimit >= 0 ? `${lowerLimit}ms` : null}
        <b>Upper threshold:</b> {upperLimit >= 0 ? `${upperLimit}ms` : null}
      </div>
    );
  });

  return <div className="header-thresholds">{thresholdElements}</div>;
}
