/**
 * 기본 테스트 스크립트
 * 가장 단순한 형태의 k6 테스트
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

// 기본 옵션: 10 VU로 30초간 테스트
export const options = {
  vus: 10,
  duration: '30s',
};

// 테스트할 기본 URL
const BASE_URL = 'https://test-api.k6.io';

export default function () {
  // GET 요청
  const res = http.get(`${BASE_URL}/public/crocodiles/`);

  // 응답 검증
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  // 요청 간 대기 (think time)
  sleep(1);
}