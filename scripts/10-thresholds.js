/**
 * Thresholds (성능 임계값) 테스트
 * 다양한 메트릭에 대한 성능 기준 설정
 *
 * - 임계값 미달 시 k6가 non-zero exit code 반환
 * - CI/CD 파이프라인에서 자동 실패 처리 가능
 * - abortOnFail: 임계값 실패 시 즉시 테스트 중단
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// 커스텀 메트릭 정의
const errorRate = new Rate('custom_error_rate');
const apiDuration = new Trend('custom_api_duration');
const requestCount = new Counter('custom_request_count');
const activeUsers = new Gauge('custom_active_users');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],

  thresholds: {
    // ========== HTTP 관련 임계값 ==========

    // 평균 응답 시간 < 500ms
    http_req_duration: ['avg<500'],

    // 95 퍼센타일 응답 시간 < 800ms
    'http_req_duration{expected_response:true}': ['p(95)<800'],

    // 99 퍼센타일 응답 시간 < 1500ms
    http_req_duration: ['p(99)<1500'],

    // 최대 응답 시간 < 2000ms
    http_req_duration: ['max<2000'],

    // HTTP 실패율 < 1%
    http_req_failed: ['rate<0.01'],

    // 초당 요청 수 > 10
    http_reqs: ['rate>10'],

    // ========== 연결 관련 임계값 ==========

    // 연결 시간 95 퍼센타일 < 100ms
    http_req_connecting: ['p(95)<100'],

    // TLS 핸드셰이크 시간 < 200ms
    http_req_tls_handshaking: ['p(95)<200'],

    // ========== 커스텀 메트릭 임계값 ==========

    // 커스텀 에러율 < 5%
    custom_error_rate: ['rate<0.05'],

    // 커스텀 API 응답 시간 평균 < 400ms
    custom_api_duration: ['avg<400', 'p(95)<600'],

    // 요청 카운트 > 100
    custom_request_count: ['count>100'],

    // ========== Check 관련 임계값 ==========

    // 모든 check의 성공률 > 95%
    checks: ['rate>0.95'],

    // ========== 특정 태그 기반 임계값 ==========

    // 특정 URL에 대한 임계값
    'http_req_duration{name:crocodiles-list}': ['avg<300'],
    'http_req_duration{name:crocodiles-detail}': ['avg<200'],

    // ========== abortOnFail 예시 ==========

    // 에러율이 10%를 넘으면 테스트 즉시 중단
    http_req_failed: [
      {
        threshold: 'rate<0.1',
        abortOnFail: true,
        delayAbortEval: '10s', // 10초 후 평가 시작
      },
    ],
  },
};

const BASE_URL = 'https://test-api.k6.io';

export default function () {
  // 활성 사용자 수 기록
  activeUsers.add(__VU);

  // 목록 조회
  const listRes = http.get(`${BASE_URL}/public/crocodiles/`, {
    tags: { name: 'crocodiles-list' },
  });

  const listSuccess = check(listRes, {
    'list: status is 200': (r) => r.status === 200,
    'list: has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body) && body.length > 0;
      } catch (e) {
        return false;
      }
    },
  });

  // 커스텀 메트릭 기록
  errorRate.add(!listSuccess);
  apiDuration.add(listRes.timings.duration);
  requestCount.add(1);

  sleep(0.5);

  // 상세 조회
  const detailRes = http.get(`${BASE_URL}/public/crocodiles/1/`, {
    tags: { name: 'crocodiles-detail' },
  });

  const detailSuccess = check(detailRes, {
    'detail: status is 200': (r) => r.status === 200,
    'detail: has name': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.name !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!detailSuccess);
  apiDuration.add(detailRes.timings.duration);
  requestCount.add(1);

  sleep(1);
}

// 테스트 종료 후 요약
export function handleSummary(data) {
  console.log('========== Test Summary ==========');

  // 임계값 결과 확인
  const thresholds = data.metrics;
  let passed = true;

  for (const [name, metric] of Object.entries(thresholds)) {
    if (metric.thresholds) {
      for (const [threshold, result] of Object.entries(metric.thresholds)) {
        if (!result.ok) {
          console.log(`FAILED: ${name} - ${threshold}`);
          passed = false;
        }
      }
    }
  }

  if (passed) {
    console.log('All thresholds passed!');
  }

  return {
    stdout: JSON.stringify(data, null, 2),
  };
}