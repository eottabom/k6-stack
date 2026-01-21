/**
 * Externally Controlled Executor
 * 외부에서 실행 시간과 VU 수를 동적으로 조절
 *
 * 실행 방법:
 * 1. k6 실행: k6 run --paused 09-externally-controlled.js
 * 2. 테스트 시작: curl -X PATCH http://localhost:6565/v1/status -H 'Content-Type: application/json' -d '{"paused": false}'
 * 3. VU 조절: curl -X PATCH http://localhost:6565/v1/status -H 'Content-Type: application/json' -d '{"vus": 20}'
 * 4. 테스트 중지: curl -X PATCH http://localhost:6565/v1/status -H 'Content-Type: application/json' -d '{"stopped": true}'
 *
 * Docker에서 실행:
 * docker-compose run --rm -p 6565:6565 k6 run --paused --address 0.0.0.0:6565 /scripts/09-externally-controlled.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    external_control: {
      executor: 'externally-controlled',

      // 초기 VU 수
      vus: 10,

      // 최대 VU 수 (외부에서 이 값까지 조절 가능)
      maxVUs: 100,

      // 테스트 최대 지속 시간
      duration: '1h',
    },
  },
};

const BASE_URL = 'https://test-api.k6.io';

export default function () {
  const res = http.get(`${BASE_URL}/public/crocodiles/`);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

/*
 * REST API 제어 명령어 예시:
 *
 * 상태 확인:
 * curl http://localhost:6565/v1/status
 *
 * VU 수 변경:
 * curl -X PATCH http://localhost:6565/v1/status \
 *   -H 'Content-Type: application/json' \
 *   -d '{"vus": 50}'
 *
 * 최대 VU 수 변경:
 * curl -X PATCH http://localhost:6565/v1/status \
 *   -H 'Content-Type: application/json' \
 *   -d '{"vus": 30, "vusMax": 50}'
 *
 * 테스트 일시정지:
 * curl -X PATCH http://localhost:6565/v1/status \
 *   -H 'Content-Type: application/json' \
 *   -d '{"paused": true}'
 *
 * 테스트 재개:
 * curl -X PATCH http://localhost:6565/v1/status \
 *   -H 'Content-Type: application/json' \
 *   -d '{"paused": false}'
 *
 * 테스트 중지:
 * curl -X PATCH http://localhost:6565/v1/status \
 *   -H 'Content-Type: application/json' \
 *   -d '{"stopped": true}'
 */