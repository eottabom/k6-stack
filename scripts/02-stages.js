/**
 * 단계별 부하 테스트 (Stages / Ramping)
 * 시간에 따라 VU 수를 단계적으로 증가/감소
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    // Ramp-up: 0 -> 10 VU (1분)
    { duration: '1m', target: 10 },
    // 유지: 10 VU (2분)
    { duration: '2m', target: 10 },
    // Ramp-up: 10 -> 50 VU (1분)
    { duration: '1m', target: 50 },
    // 유지: 50 VU (3분) - 피크 부하
    { duration: '3m', target: 50 },
    // Ramp-down: 50 -> 0 VU (1분)
    { duration: '1m', target: 0 },
  ],
};

const BASE_URL = 'https://test-api.k6.io';

export default function () {
  const res = http.get(`${BASE_URL}/public/crocodiles/`);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}