import inquirer from "inquirer";

let users = [];

async function addUser() {
  while (true) {
    const { name } = await inquirer.prompt({
      type: "input",
      name: "name",
      message: "Enter user name (press ENTER to stop):",
    });

    if (!name) break;

    const { gender } = await inquirer.prompt({
      type: "list",
      name: "gender",
      message: "Select gender:",
      choices: ["Male", "Female", "Other"],
    });

    const { age } = await inquirer.prompt({
      type: "input",
      name: "age",
      message: "Enter age:",
      validate: (input) => {
        const age = parseInt(input, 10);
        return !isNaN(age) || "Please enter a valid age";
      },
    });

    users.push({ name, gender, age });
    console.log(`User ${name} added.`);
  }

  await findUserPrompt();
}

async function findUserPrompt() {
  const { findUser } = await inquirer.prompt({
    type: "confirm",
    name: "findUser",
    message: "Would you like to find a user by name?",
  });

  if (findUser) {
    await findUserByName();
  } else {
    console.log("Exiting...");
  }
}

async function findUserByName() {
  const { name } = await inquirer.prompt({
    type: "input",
    name: "name",
    message: "Enter the name of the user to find:",
  });

  const user = users.find((user) => user.name === name);
  if (user) {
    console.log(`User found: Name: ${user.name}, Gender: ${user.gender}, Age: ${user.age}`);
  } else {
    console.log(`User with name ${name} not found.`);
  }

  await findUserPrompt();
}

(async () => {
  console.log("Welcome to the user management system!");
  await addUser();
})();
