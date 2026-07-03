import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users over 30s
    { duration: '1m', target: 50 },   // Stay at 50 users for 1m
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
  },
};

export default function () {
  const url = 'http://localhost:3000/api/v1/health';
  const res = http.get(url, {
    headers: { 'x-api-key': 'test-partner-key' }
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'rate limit not exceeded': (r) => r.status !== 429,
  });
  
  sleep(1);
}
