import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const options = {
  stages: [
    { duration: '30s', target: 5 }, // warm-up
    { duration: '45s', target: 20 }, // rampa leve
    { duration: '45s', target: 30 }, // carga moderada
    { duration: '30s', target: 0 }, // ramp-down
  ],
};

const BASE_URL = __ENV.BASE_URL;

const latencyTrend = new Trend('register_latency');
const errorRate = new Rate('register_errors');

export default function () {
  const username = `user_${__VU}_${__ITER}_${Date.now()}`;

  const payload = JSON.stringify({
    username,
    password: '123456',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: '8s',
  };

  http.post(`${BASE_URL}/api/auth/register`, payload, params);

  sleep(Math.random() * 1 + 0.5);
}
