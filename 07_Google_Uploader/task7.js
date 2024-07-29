import fs from "fs";
import { google } from "googleapis";
import inquirer from "inquirer";
import TinyURL from "tinyurl";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const KEYFILEPATH = "./key.json";

async function authenticate() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });
  const authClient = await auth.getClient();
  return authClient;
}

async function uploadFile(auth, filePath, fileName) {
  const drive = google.drive({ version: "v3", auth });
  const fileMetadata = { name: fileName, parents: ["1s8mbgtBOnzoo2t-LfS8yxJgB7KMaWGHJ"] };
  const media = { mimeType: "image/jpeg", body: fs.createReadStream(filePath) };

  drive.files.create(
    {
      resource: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    },
    (err, file) => {
      if (err) {
        console.error("Error uploading file:", err);
        return;
      }
      console.log("File uploaded successfully!");
      console.log("Link to file:", file.data.webViewLink);

      inquirer
        .prompt([
          {
            type: "confirm",
            name: "shorten",
            message: "Do you want to shorten the link?",
            default: false,
          },
        ])
        .then((answers) => {
          if (answers.shorten) {
            TinyURL.shorten(file.data.webViewLink, function (res, err) {
              if (err) {
                console.log("Error shortening URL:", err);
                return;
              }
              console.log("Shortened URL:", res);
            });
          }
        });
    }
  );
}

async function startApp() {
  const auth = await authenticate();

  inquirer
    .prompt([
      {
        type: "input",
        name: "imagePath",
        message: "Drag and drop an image here:",
      },
    ])
    .then((answers) => {
      const filePath = answers.imagePath.trim();
      if (!fs.existsSync(filePath)) {
        console.log("File not found!");
        return;
      }
      inquirer
        .prompt([
          {
            type: "input",
            name: "newName",
            message: "Rename the file (or press enter to keep original name):",
            default: filePath.split("/").pop(),
          },
        ])
        .then((answers) => {
          const newName = answers.newName.trim() || filePath.split("/").pop();
          uploadFile(auth, filePath, newName);
        });
    });
}

startApp();
