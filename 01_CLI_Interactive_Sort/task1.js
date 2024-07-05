function insertDots(str) {
  let result = [];
  let n = str.length;

  let max = Math.pow(2, n - 1);

  for (let i = 0; i < max; i++) {
    let current = str[0];

    for (let j = 0; j < n - 1; j++) {
      if (i & (1 << j)) {
        current += ".";
      }
      current += str[j + 1];
    }

    result.push(current);
  }

  return result;
}

console.log(insertDots("abc"));
console.log(insertDots("abcdefg"));
