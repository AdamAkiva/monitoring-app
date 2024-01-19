import { getEnvValue } from '@/utils';

import './Card.css';

/**********************************************************************************/

export default function Card() {
  return <button className="myButton">{getEnvValue('SERVER_URL')}</button>;
}
