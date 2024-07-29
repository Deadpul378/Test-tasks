import fs from "fs";

fs.readFile("vacations.json", "utf8", (err, data) => {
  if (err) {
    console.error("Ошибка чтения файла:", err);
    return;
  }

  const input = JSON.parse(data);
  const result = {};

  input.forEach((vacation) => {
    const userId = vacation.user._id;
    const userName = vacation.user.name;
    const vacationPeriod = { startDate: vacation.startDate, endDate: vacation.endDate };

    if (!result[userId]) {
      result[userId] = {
        userId: userId,
        name: userName,
        weekendDates: [],
      };
    }

    result[userId].weekendDates.push(vacationPeriod);
  });

  const output = Object.values(result);

  fs.writeFile("output.json", JSON.stringify(output, null, 2), (err) => {
    if (err) {
      console.error("Ошибка записи файла:", err);
      return;
    }
    console.log("Данные успешно записаны в output.json");
  });
});
