import './HeaderThreshold.css';

/**********************************************************************************/

export default function HeaderThreshold({ items }) {
  const thresholds = items?.map(({ lowerLimit, upperLimit }, index) => {
    return (
      <div key={index} className="header-thresholds-section">
        <b>Lower threshold:</b> {lowerLimit !== '' ? `${lowerLimit}ms` : null}
        <b>Upper threshold:</b> {upperLimit !== '' ? `${upperLimit}ms` : null}
      </div>
    );
  });

  return <div className="header-thresholds">{thresholds}</div>;
}
