import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function processInput(input) {
  if (input.toLowerCase() === "exit") {
    console.log("Program exited.");
    rl.close();
    return;
  }

  const items = input.split(" ").filter((item) => item !== "");
  const words = items.filter((item) => isNaN(item));
  const numbers = items.filter((item) => !isNaN(item)).map(Number);

  const options = `
Select Operations:
1. Sort words alphabetically
2. Display numbers in ascending order
3. Display numbers in descending order
4. Display words by length ascending
5. Show only unique words
6. Show only unique values
Choose operations separated by spaces (e.g., 1 3 5):
`;

  rl.question(options, (operationInput) => {
    const operations = operationInput.split(" ").map(Number);
    let results = [];

    if (operations.includes(1)) {
      results.push("Sorted words: " + words.sort().join(", "));
    }
    if (operations.includes(2)) {
      results.push("Numbers in ascending order: " + numbers.sort((a, b) => a - b).join(", "));
    }
    if (operations.includes(3)) {
      results.push("Numbers in descending order: " + numbers.sort((a, b) => b - a).join(", "));
    }
    if (operations.includes(4)) {
      results.push("Words sorted by length: " + words.sort((a, b) => a.length - b.length).join(", "));
    }
    if (operations.includes(5)) {
      results.push("Unique words: " + [...new Set(words)].join(", "));
    }
    if (operations.includes(6)) {
      results.push("Unique values: " + [...new Set(numbers)].join(", "));
    }

    console.log("Results:\n" + results.join("\n"));
    start();
  });
}

function start() {
  rl.question('Enter words and numbers separated by spaces (or type "exit" to quit):\n', processInput);
}

start();
