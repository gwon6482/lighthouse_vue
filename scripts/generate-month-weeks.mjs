// 월별 주차 수 테이블 생성기 — packages/core/src/modules/career-design/data/month-weeks.ts 를 만든다.
//
// 주차 규칙(2026-08-27 확정): 한 주는 월요일~일요일이고, 그 주의 **월요일이 속한 달**에 귀속된다.
// 따라서 한 달의 주차 수 = 그 달에 있는 월요일의 개수 = 항상 4 또는 5.
// (1일이 주 중간이면 그 며칠은 전달 마지막 주에 포함된다. 모든 주가 정확히 7일이라
//  "프로젝트 n주 = n×7일" 이 배치 위치와 무관하게 보장된다.)
//
// 실행: node scripts/generate-month-weeks.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const START_YEAR = 2026
const END_YEAR   = 2099

// 그 달에 들어있는 월요일의 개수
function mondayCount(year, month) {
  const lastDay = new Date(year, month, 0).getDate()
  let n = 0
  for (let d = 1; d <= lastDay; d++) {
    if (new Date(year, month - 1, d).getDay() === 1) n++
  }
  return n
}

const rows = []
let five = 0
for (let y = START_YEAR; y <= END_YEAR; y++) {
  let s = ''
  for (let m = 1; m <= 12; m++) {
    const n = mondayCount(y, m)
    if (n !== 4 && n !== 5) throw new Error(`${y}-${m}: 주차 수가 ${n} — 규칙 위반`)
    if (n === 5) five++
    s += String(n)
  }
  rows.push(`  ${y}: '${s}',`)
}

const total = (END_YEAR - START_YEAR + 1) * 12
const out = `// ⚠️ 자동 생성 파일 — 직접 고치지 말 것.
// 생성: node scripts/generate-month-weeks.mjs
//
// 월별 주차 수 테이블 (${START_YEAR}~${END_YEAR}, ${total}개월 / 5주차인 달 ${five}개월).
// 주차 규칙: 한 주는 월~일이며 그 주의 **월요일이 속한 달**에 귀속된다.
// → 한 달의 주차 수 = 그 달의 월요일 개수 = 항상 4 또는 5.
//
// 문자열 12자리가 1월~12월의 주차 수다. 예) '${rows[0].split("'")[1]}' → 1월 ${rows[0].split("'")[1][0]}주, 2월 ${rows[0].split("'")[1][1]}주 …

export const MONTH_WEEKS_START_YEAR = ${START_YEAR}
export const MONTH_WEEKS_END_YEAR   = ${END_YEAR}

export const MONTH_WEEKS: Record<number, string> = {
${rows.join('\n')}
}
`

const dest = 'packages/core/src/modules/career-design/data/month-weeks.ts'
mkdirSync(dirname(dest), { recursive: true })
writeFileSync(dest, out, 'utf8')
console.log(`생성 완료: ${dest}`)
console.log(`  ${START_YEAR}~${END_YEAR} ${total}개월 / 5주차인 달 ${five}개월 (${(five / total * 100).toFixed(1)}%)`)
