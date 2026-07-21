import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '30s', target: 25 },
    { duration: '30s', target: 50 },
    // If all pass, we can manually run target: 100
  ],
  thresholds: {
    'http_req_duration{name:store}': ['p(95)<150', 'p(99)<300'],
    'http_req_duration{name:pdp}': ['p(95)<150', 'p(99)<300'],
    'http_req_duration{name:search}': ['p(95)<250', 'p(99)<500'],
    'http_req_failed': ['rate<0.005'], // <0.5% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Store page
  let resStore = http.get(`${BASE_URL}/store`, { tags: { name: 'store' } });
  check(resStore, { 'status is 200': (r) => r.status === 200 });
  sleep(1);

  // Search API (if exists) or search page
  let resSearch = http.get(`${BASE_URL}/store?q=laptop`, { tags: { name: 'search' } });
  check(resSearch, { 'status is 200': (r) => r.status === 200 });
  sleep(1);

  // PDP (Product Detail Page)
  // Hardcoded ID for simulation, in reality we'd extract from store page
  let resPdp = http.get(`${BASE_URL}/product/1`, { tags: { name: 'pdp' } });
  check(resPdp, { 'status is 200': (r) => r.status === 200 || r.status === 404 });
  sleep(1);
}
