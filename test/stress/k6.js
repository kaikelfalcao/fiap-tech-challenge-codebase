import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 10 },
    { duration: '35s', target: 35 },
    { duration: '25s', target: 50 },
    { duration: '15s', target: 25 },
  ],
};

const BASE_URL = __ENV.BASE_URL;

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
