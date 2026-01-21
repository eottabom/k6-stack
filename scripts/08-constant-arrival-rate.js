/**
 * Constant Arrival Rate Executor
 * 일정한 RPS(Requests Per Second)를 유지
 *
 * - 응답 시간과 관계없이 고정된 요청률 유지
 * - 서버의 처리량(throughput) 테스트에 적합
 * - preAllocatedVUs: 미리 할당할 VU 수
 * - maxVUs: 필요시 추가 할당 가능한 최대 VU 수
 */
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',

      // 초당 요청 수 (RPS)
      rate: 30,

      // rate의 시간 단위 (1초당 30개 요청)
      timeUnit: '1s',

      // 테스트 지속 시간
      duration: '2m',

      // 미리 할당할 VU 수 (예상 필요량)
      preAllocatedVUs: 50,

      // 최대 VU 수 (요청이 밀릴 경우 추가 할당)
      maxVUs: 100,
    },
  },
};

const BASE_URL = 'https://test-api.k6.io';

export default function () {
  const startTime = Date.now();

  const res = http.get(`${BASE_URL}/public/crocodiles/`);

  const duration = Date.now() - startTime;

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1s': (r) => r.timings.duration < 1000,
  });

  // 참고: constant-arrival-rate에서는 sleep을 사용하지 않는 것이 일반적
  // k6가 자동으로 요청 간격을 조절함
}