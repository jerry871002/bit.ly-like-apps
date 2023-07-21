import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 20,
  duration: '20s'
};

const short_urls = [];

export function setup() {
  const urls = [
    'https://fitech101.aalto.fi/designing-and-building-scalable-web-applications/',
    'https://github.com/avihavai/wsd-walking-skeleton',
    'https://fitech101.aalto.fi/web-software-development/',
    'https://deno.land/'
  ];

  for (var url of urls) {
    const response = http.post('http://127.0.0.1:7777/shorten_url', {
      original_url: url
    });
    short_urls.push(response.body);
  }

  return { short_urls: short_urls };
}

export default function (data) {
  const short_urls = data.short_urls;
  const idx = Math.floor(Math.random() * short_urls.length);
  const short_url = short_urls[idx];

  http.get(`http://127.0.0.1:7777/${short_url}`);
  sleep(1);
}
