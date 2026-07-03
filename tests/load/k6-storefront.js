import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 min
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  // 1. Visit homepage
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'homepage loaded': (r) => r.status === 200,
  });
  sleep(1);

  // 2. Visit store
  res = http.get(`${BASE_URL}/store`);
  check(res, {
    'store loaded': (r) => r.status === 200,
  });
  sleep(1);

  // 3. Search for a product (simulate API call if it was exposed, here just page route)
  res = http.get(`${BASE_URL}/store?search=tech`);
  check(res, {
    'search successful': (r) => r.status === 200,
  });
  sleep(2);
}
