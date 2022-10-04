export function getSequence(arr) {
  const len = arr.length;

  const result = [0];
  const p = new Array(len).fill(0)

  let start;
  let end;
  let middle;
  let resultLastIndex;
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    // vue中0是新增
    if (arrI !== 0) {
      resultLastIndex = result[result.length - 1];
      // 最后一项比当前的小，则推入
      if (arr[resultLastIndex] < arrI) {
        result.push(i);
        p[i] = resultLastIndex;
        continue;
      }
      // 二分查找出比当前值大的，用当前值的索引将其替换
      start = 0;
      end = result.length - 1;
      while (start < end) {
        middle = ((start + end) / 2) | 0;

        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }

      if (arr[result[end]] > arrI) {
        result[end] = i;

        p[i] = result[end - 1];
      }
    }
  }

  // 往前追溯，每个都存了自己前面的索引
  let i = result.length;
  let last = result[i - 1];
  while(i-- > 0) {
    result[i] = last;
    last = p[last];
  }
  

  return result;
}

// console.log(getSequence([2,3,1,5,6,8,7,9,4]));
