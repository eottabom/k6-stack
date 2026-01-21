/**
 * 시나리오 기반 테스트
 * 여러 시나리오를 동시에 또는 순차적으로 실행
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    // 시나리오 1: 브라우징 사용자 (읽기 위주)
    browse_users: {
      executor: 'constant-vus',
      vus: 5,
      duration: '2m',
      exec: 'browseScenario',
      tags: { scenario: 'browse' },
    },

    // 시나리오 2: API 사용자 (빈번한 요청)
    api_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 },
      ],
      exec: 'apiScenario',
      tags: { scenario: 'api' },
      startTime: '30s', // 30초 후 시작
    },

    // 시나리오 3: 스파이크 테스트 (갑작스러운 부하)
    spike_test: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      stages: [
        { duration: '10s', target: 1 },
        { duration: '5s', target: 50 },  // 스파이크!
        { duration: '10s', target: 1 },
      ],
      exec: 'spikeScenario',
      tags: { scenario: 'spike' },
      startTime: '1m',
    },
  },
};

const BASE_URL = 'https://test-api.k6.io';

// 브라우징 시나리오: 목록 조회 후 상세 조회
export function browseScenario() {
  // 목록 조회
  const listRes = http.get(`${BASE_URL}/public/crocodiles/`);
  check(listRes, {
    '[Browse] list status 200': (r) => r.status === 200,
  });

  sleep(2);

  // 상세 조회
  const detailRes = http.get(`${BASE_URL}/public/crocodiles/1/`);
  check(detailRes, {
    '[Browse] detail status 200': (r) => r.status === 200,
  });

  sleep(3);
}

// API 시나리오: 빠른 연속 요청
export function apiScenario() {
  const responses = http.batch([
    ['GET', `${BASE_URL}/public/crocodiles/1/`],
    ['GET', `${BASE_URL}/public/crocodiles/2/`],
    ['GET', `${BASE_URL}/public/crocodiles/3/`],
  ]);

  responses.forEach((res, idx) => {
    check(res, {
      [`[API] request ${idx + 1} status 200`]: (r) => r.status === 200,
    });
  });

  sleep(0.5);
}

// 스파이크 시나리오: 단순 요청
export function spikeScenario() {
  const res = http.get(`${BASE_URL}/public/crocodiles/`);
  check(res, {
    '[Spike] status 200': (r) => r.status === 200,
  });
}