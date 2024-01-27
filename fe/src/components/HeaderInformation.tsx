import './HeaderInformation.css';

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
    <div className="header-information">
      <div className="header-information-row">
        <div className="header-information-key">Name:</div>
        <div className="header-information-key">URI:</div>
        <div className="header-information-key">Interval:</div>
      </div>
      <div className="header-information-row">
        <div className="header-information-value">{name}</div>
        <div className="header-information-value">{uri}</div>
        <div className="header-information-value">
          {interval.length ? `${interval}ms` : null}
        </div>
      </div>
    </div>
  );
}
