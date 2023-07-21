import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '20s',
};

export default function () {
  http.get('http://127.0.0.1:7777/');
  sleep(1);
}
