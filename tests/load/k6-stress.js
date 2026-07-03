import http from 'k6/http';
import { check, sleep } from 'k6';

// Stress testing configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp-up to 100 users over 2 minutes
    { duration: '5m', target: 100 },  // Stay at 100 users for 5 minutes
    { duration: '2m', target: 500 },  // Ramp-up to 500 users over 2 minutes (Spike)
    { duration: '5m', target: 500 },  // Stay at 500 users for 5 minutes
    { duration: '2m', target: 1000 }, // Spike to 1000 users 
    { duration: '5m', target: 1000 }, // Hold peak
    { duration: '5m', target: 0 },    // Ramp-down to 0 users
  ],
  thresholds: {
    // 95% of requests must complete within 200ms
    http_req_duration: ['p(95)<200'], 
    // Error rate must be extremely low
    http_req_failed: ['rate<0.01'],   
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  // 1. Visit homepage
  let res = http.get(`${BASE_URL}/`);
  check(res, { 'homepage loaded': (r) => r.status === 200 });
  sleep(1);

  // 2. Visit store
  res = http.get(`${BASE_URL}/store`);
  check(res, { 'store loaded': (r) => r.status === 200 });
  sleep(1);

  // 3. Search for a product (cache miss or hit)
  res = http.get(`${BASE_URL}/store?search=luxury`);
  check(res, { 'search successful': (r) => r.status === 200 });
  sleep(2);
  
  // 4. Visit specific auction (realtime simulation)
  res = http.get(`${BASE_URL}/auctions/simulated-auction-123`);
  check(res, { 'auction loaded': (r) => r.status === 200 });
  sleep(3);
}
