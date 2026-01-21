/**
 * Shared Iterations Executor
 * 정해진 반복 횟수를 모든 VU가 공유하여 실행
 *
 * - 총 100번의 반복을 10개의 VU가 나눠서 실행
 * - 빠른 VU가 더 많은 반복을 처리할 수 있음
 * - 정확한 총 요청 수가 필요할 때 사용
 */
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    shared_iterations_test: {
      executor: 'shared-iterations',

      // 총 반복 횟수 (모든 VU가 공유)
      iterations: 100,

      // 동시 실행 VU 수
      vus: 10,

      // 최대 실행 시간 (이 시간이 지나면 반복이 남아도 종료)
      maxDuration: '2m',
    },
  },
};

const BASE_URL = 'https://test-api.k6.io';

export default function () {
  const vuId = __VU;
  const iterationId = __ITER;

  console.log(`VU ${vuId} executing iteration ${iterationId}`);

  const res = http.get(`${BASE_URL}/public/crocodiles/`);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // 의도적으로 sleep 없음 - 가능한 빨리 반복 실행
}