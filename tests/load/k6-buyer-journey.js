import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics to track SLAs
const checkoutApiDuration = new Trend('checkout_api_duration');
const webhookDuration = new Trend('webhook_processing_duration');

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up
    { duration: '1m', target: 100 },  // Sustained load
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    // Checkout API SLA: P95 < 500ms, P99 < 800ms
    'checkout_api_duration': ['p(95)<500', 'p(99)<800'],
    // Webhook SLA: < 1 second (1000ms)
    'webhook_processing_duration': ['p(95)<1000'],
    // General HTTP errors should be less than 1%
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  group('Buyer Journey', function () {
    // 1. Visit Storefront
    let res = http.get(`${BASE_URL}/store`);
    check(res, { 'store loaded': (r) => r.status === 200 });
    sleep(1);

    // 2. Fetch specific product (simulating add to cart browse)
    res = http.get(`${BASE_URL}/api/products`);
    check(res, { 'products loaded': (r) => r.status === 200 });
    sleep(1);

    // 3. Seed an order for load testing
    const seedRes = http.post(`${BASE_URL}/api/tests/seed-order`);
    check(seedRes, { 'order seeded': (r) => r.status === 200 });
    let orderId = 'mock-order-id-k6';
    if (seedRes.status === 200) {
      orderId = seedRes.json('orderId');
    }

    // 4. Simulate Checkout Form Submission (Calling simulate-webhook)
    const payload = JSON.stringify({
      orderId,
      scenario: 'success',
      amount: 100,
      providerEventId: `evt_k6_${__VU}_${__ITER}_${new Date().getTime()}`
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const startTime = new Date().getTime();
    res = http.post(`${BASE_URL}/api/checkout/simulate-webhook`, payload, params);
    const endTime = new Date().getTime();
    
    // Track durations
    checkoutApiDuration.add(endTime - startTime);
    webhookDuration.add(endTime - startTime);

    check(res, {
      'checkout simulated successfully': (r) => r.status === 200,
    });
    sleep(2);
  });
}
