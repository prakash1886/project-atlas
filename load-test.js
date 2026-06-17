import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // ramp up to 20 users
    { duration: '1m', target: 20 },  // stay at 20 users
    { duration: '30s', target: 0 },  // ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must complete in under 200ms
  },
};

export default function () {
  const res = http.get('http://localhost:3001/api/opportunities');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body has topics': (r) => r.body.includes('topic'),
  });
  sleep(1);
}
