import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 10 },
    { duration: '20s', target: 25 },
    { duration: '20s', target: 50 },
  ],
  thresholds: {
    'http_req_duration{name:bid}': ['p(95)<250', 'p(99)<500'],
    // We expect some 409 Conflict errors due to OCC, which is by design for exact same moment bids
    'http_req_failed{name:bid}': ['rate<0.10'], // Less than 10% errors overall (409s are ok, but 500s are bad)
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const payload = JSON.stringify({
    auctionId: '1',
    amount: Math.floor(Math.random() * 1000) + 100,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      // In a real test, we would inject a valid clerk JWT token here
      'Authorization': 'Bearer test-token-123'
    },
    tags: { name: 'bid' }
  };

  let res = http.post(`${BASE_URL}/api/auctions/bid`, payload, params);
  
  // 200 = Success, 409 = OCC Conflict (version mismatch, which means OCC is working)
  check(res, {
    'status is 200 or 409 (OCC)': (r) => r.status === 200 || r.status === 409,
    'not 500 error': (r) => r.status !== 500,
  });
  
  sleep(1);
}
