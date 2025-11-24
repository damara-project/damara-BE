/**
 * 주어진 데이터 객체에서 값이 정의된 필드만 뽑아서
 * SQL UPDATE 문의 SET 절과 바인딩 값을 만들어준다.
 *
 * @param data 업데이트하려는 값들을 담은 객체.
 *             예: { nickname: '홍길동', avatarUrl: null }
 * @param columnMap 데이터 필드를 실제 DB 컬럼명과 매핑한 객체.
 *                  예: { nickname: 'nickname', avatarUrl: 'avatar_url' }
 *
 * TypeScript 제네릭 설명:
 * - T는 객체 타입이다. 예: { nickname: string, avatarUrl: string }
 * - keyof T는 T 객체의 모든 키(키 이름들)를 union 타입으로 만든다.
 *   예: keyof { nickname: string, avatarUrl: string } = 'nickname' | 'avatarUrl'
 * - Record<keyof T, string>은 T의 모든 키를 가지되,
 *   각 값이 string인 객체 타입이다.
 *   예: Record<'nickname' | 'avatarUrl', string>
 *       = { nickname: string, avatarUrl: string }
 *
 * 동작 방식:
 * 1. Object.entries로 key/value 목록을 만들고,
 *    값이 undefined인 항목은 제외한다.
 *    → 사용자가 명시적으로 넘긴 필드만 업데이트.
 * 2. columnMap에서 컬럼명을 찾아 `${column} = $i` 형태로 SET 절을 구성한다.
 * 3. 값들을 순서대로 values 배열에 담아 반환한다.
 *
 * 결과 예:
 *   buildUpdateSet(
 *     { nickname: '길동', avatarUrl: undefined },
 *     { nickname: 'nickname', avatarUrl: 'avatar_url' }
 *   )
 *   -> { setClause: 'nickname = $1', values: ['길동'] }
 *
 * 따라서 UPDATE 쿼리를 작성할 때
 * `UPDATE users SET ${setClause} WHERE id = $n`
 * 형태로 사용하면 된다.
 */
export function buildUpdateSet<T extends Record<string, unknown>>(
  // T는 객체 타입이다.
  // 예: data = { nickname: '길동', bio: '안녕' } 일 때
  //     T = { nickname: string, bio: string }
  data: T,
  // columnMap은 T의 모든 키를 가져야 하고, 각 값은 string이어야 한다.
  // keyof T는 T의 키들의 union 타입이다.
  // 예: data가 { nickname: '길동', bio: '안녕' } 이면
  //     keyof T = 'nickname' | 'bio'
  //     Record<keyof T, string> = { nickname: string, bio: string }
  // 따라서 columnMap은 { nickname: '...', bio: '...' } 형태여야 한다.
  columnMap: Record<keyof T, string>
) {
  // Object.entries는 [키, 값] 쌍의 배열을 돌려준다.
  // 예: data = { nickname: '길동', bio: '안녕' } 일 때
  //     allEntries = [ ['nickname', '길동'], ['bio', '안녕'] ]
  // [keyof T, T[keyof T]] 는 [키 이름, 값] 튜플 타입이다.
  // 예: [keyof T] = ['nickname', 'bio'] 중 하나 (키 이름들)
  //     T[keyof T] = '길동' | '안녕' (값 타입들)
  const allEntries = Object.entries(data) as [keyof T, T[keyof T]][];

  // 값(value)이 정의된 항목만 고른다.
  // 예: allEntries에서 value가 undefined인 항목 제거
  const entries = allEntries.filter((entry) => {
    const value = entry[1]; // 두번째 요소, 즉 value를 담고
    return value !== undefined;
  });
  // 예: entries = [ ['nickname', '길동'], ['bio', '안녕'] ]

  if (entries.length === 0) {
    throw new Error("No fields to update");
  }

  // SQL 조각과 값들을 순서대로 쌓습니다.
  const setParts: string[] = [];
  // T[keyof T]는 T 객체의 모든 값 타입들의 union이다.
  // 예: T = { nickname: string, bio: string } 일 때
  //     T[keyof T] = string | string = string
  const values: T[keyof T][] = [];

  entries.forEach(([key, value], index) => {
    // key는 keyof T 타입이다 (예: 'nickname' | 'bio')
    // 예시: key = 'nickname' (첫 번째 반복), key = 'bio' (두 번째 반복)
    //
    // columnMap[key]는 string 타입이다
    // 예시: columnMap['nickname'] = 'nickname', columnMap['bio'] = 'bio'
    const column = columnMap[key];
    if (!column) {
      return;
    }

    // "nickname = $1" 같은 형태의 문자열을 만든 뒤 배열에 넣습니다.
    // 예시:
    //   첫 번째 반복 (index=0): setParts.push('nickname = $1')
    //   두 번째 반복 (index=1): setParts.push('bio = $2')
    setParts.push(`${column} = $${index + 1}`);
    // 예시:
    //   첫 번째 반복: values.push('홍길동')  → values = ['홍길동']
    //   두 번째 반복: values.push('안녕하세요') → values = ['홍길동', '안녕하세요']
    values.push(value);
  });

  // 완성된 SET 절과 값 목록을 반환합니다.
  return {
    setClause: setParts.join(", "),
    values,
  };
}
