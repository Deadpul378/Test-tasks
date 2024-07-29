import fs from "fs";
import { performance } from "perf_hooks";

const readPhrasesFromFile = (filePath) => {
  return fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
};

const getUniqueUsernames = (files) => {
  const uniqueUsernames = new Set();
  files.forEach((file) => {
    const phrases = readPhrasesFromFile(file);
    phrases.forEach((phrase) => uniqueUsernames.add(phrase));
  });
  return uniqueUsernames.size;
};

const getUsernamesInAllFiles = (files) => {
  const usernameCount = {};
  files.forEach((file) => {
    const phrases = readPhrasesFromFile(file);
    const uniquePhrases = new Set(phrases);
    uniquePhrases.forEach((phrase) => {
      usernameCount[phrase] = (usernameCount[phrase] || 0) + 1;
    });
  });
  return Object.values(usernameCount).filter((count) => count === files.length).length;
};

const getUsernamesInAtLeastNFiles = (files, n) => {
  const usernameCount = {};
  files.forEach((file) => {
    const phrases = readPhrasesFromFile(file);
    const uniquePhrases = new Set(phrases);
    uniquePhrases.forEach((phrase) => {
      usernameCount[phrase] = (usernameCount[phrase] || 0) + 1;
    });
  });
  return Object.values(usernameCount).filter((count) => count >= n).length;
};

const files = Array.from({ length: 20 }, (_, i) => `../files/out${i}.txt`);

const measureExecutionTime = (fn, ...args) => {
  const startTime = performance.now();
  const result = fn(...args);
  const endTime = performance.now();
  console.log(`Result: ${result}, Time: ${endTime - startTime} ms`);
};

measureExecutionTime(getUniqueUsernames, files);
measureExecutionTime(getUsernamesInAllFiles, files);
measureExecutionTime(getUsernamesInAtLeastNFiles, files, 10);
