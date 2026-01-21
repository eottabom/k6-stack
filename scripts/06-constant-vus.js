/**
 * Constant VUs Executor
 * 일정한 VU 수를 지정된 시간 동안 유지
 *
 * - 가장 기본적인 executor
 * - 안정적인 부하 상태 테스트에 적합
 * - options.vus + options.duration의 내부 동작과 동일
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',

      // 유지할 VU 수
      vus: 20,

      // 테스트 지속 시간
      duration: '3m',

      // gracefulStop: VU가 현재 반복을 완료할 수 있는 시간
      gracefulStop: '30s',
    },
  },
};

const BASE_URL = 'https://test-api.k6.io';

export default function () {
  // 여러 엔드포인트를 순차적으로 호출
  const endpoints = [
    '/public/crocodiles/',
    '/public/crocodiles/1/',
    '/public/crocodiles/2/',
  ];

  endpoints.forEach((endpoint) => {
    const res = http.get(`${BASE_URL}${endpoint}`);

    check(res, {
      [`${endpoint} - status 200`]: (r) => r.status === 200,
    });
  });

  // 사용자 think time 시뮬레이션
  sleep(Math.random() * 2 + 1); // 1-3초 랜덤
}