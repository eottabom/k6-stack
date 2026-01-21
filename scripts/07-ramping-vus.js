/**
 * Ramping VUs Executor
 * 시간에 따라 VU 수를 동적으로 조절
 *
 * - stages 옵션의 내부 동작과 동일
 * - 점진적 부하 증가/감소 테스트
 * - 스트레스 테스트, 내구성 테스트에 적합
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    ramping_test: {
      executor: 'ramping-vus',

      // 시작 VU 수
      startVUs: 0,

      // 단계별 VU 조절
      stages: [
        // Warm-up: 서서히 증가
        { duration: '30s', target: 5 },

        // 첫 번째 plateau
        { duration: '1m', target: 5 },

        // 부하 증가
        { duration: '30s', target: 20 },

        // 피크 부하 유지
        { duration: '2m', target: 20 },

        // 스파이크 테스트
        { duration: '10s', target: 50 },

        // 스파이크 후 복구
        { duration: '30s', target: 20 },

        // Cool-down
        { duration: '1m', target: 0 },
      ],

      gracefulRampDown: '30s',
    },
  },
};

const BASE_URL = 'https://test-api.k6.io';

export default function () {
  const res = http.get(`${BASE_URL}/public/crocodiles/`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}