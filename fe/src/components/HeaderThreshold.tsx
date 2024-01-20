import './HeaderThreshold.css';

/**********************************************************************************/

type HeaderThresholdProps = {
  thresholds: { lowerLimit: string; upperLimit: string }[] | undefined;
};

/**********************************************************************************/

export default function HeaderThreshold({ thresholds }: HeaderThresholdProps) {
  const thresholdElements = thresholds?.map(
    ({ lowerLimit, upperLimit }, index) => {
      return (
        <div key={index} className="header-thresholds-section">
          <b>Lower threshold:</b> {lowerLimit !== '' ? `${lowerLimit}ms` : null}
          <b>Upper threshold:</b> {upperLimit !== '' ? `${upperLimit}ms` : null}
        </div>
      );
    }
  );

  return <div className="header-thresholds">{thresholdElements}</div>;
}
