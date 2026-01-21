/**
 * Per VU Iterations Executor
 * 각 VU가 정해진 횟수만큼 독립적으로 반복
 *
 * - 각 VU가 10번씩 반복 (10 VU x 10회 = 총 100번)
 * - 모든 VU가 동일한 횟수를 실행하도록 보장
 * - VU별 일관된 테스트가 필요할 때 사용
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    per_vu_iterations_test: {
      executor: 'per-vu-iterations',

      // 각 VU가 실행할 반복 횟수
      iterations: 10,

      // VU 수
      vus: 10,

      // 최대 실행 시간
      maxDuration: '2m',
    },
  },
};

const BASE_URL = 'https://test-api.k6.io';

export default function () {
  const vuId = __VU;
  const iterationId = __ITER;

  console.log(`VU ${vuId} - iteration ${iterationId + 1}/10`);

  const res = http.get(`${BASE_URL}/public/crocodiles/`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}