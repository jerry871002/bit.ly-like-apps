import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '20s',
};

export default function () {
  const urls = [
    'https://fitech101.aalto.fi/designing-and-building-scalable-web-applications/',
    'https://github.com/avihavai/wsd-walking-skeleton',
    'https://fitech101.aalto.fi/web-software-development/',
    'https://deno.land/'
  ];

  const data = {
    original_url: urls[Math.floor(Math.random() * urls.length)]
  };

  http.post('http://127.0.0.1:7777/shorten_url', data);
  sleep(1);
}
