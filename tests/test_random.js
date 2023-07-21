import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '20s'
};

export function setup() {
  const urls = [
    'https://fitech101.aalto.fi/designing-and-building-scalable-web-applications/',
    'https://github.com/avihavai/wsd-walking-skeleton',
    'https://fitech101.aalto.fi/web-software-development/',
    'https://deno.land/'
  ];

  for (var url of urls) {
    http.post('http://127.0.0.1:7777/shorten_url', {
      original_url: url
    });
  }
}

export default function () {
  http.get('http://127.0.0.1:7777/random');
  sleep(1);
}
