import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '30s', target: 25 },
    { duration: '30s', target: 50 },
  ],
  thresholds: {
    'http_req_duration{name:checkout}': ['p(95)<500', 'p(99)<800'],
    'http_req_failed{name:checkout}': ['rate<0.005'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const payload = JSON.stringify({
    items: [{ productId: '1', quantity: 1 }],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token-123',
      'Idempotency-Key': `k6-test-${__VU}-${__ITER}`
    },
    tags: { name: 'checkout' }
  };

  let res = http.post(`${BASE_URL}/api/checkout`, payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'not oversold': (r) => r.status !== 409,
  });
  
  sleep(2);
}
