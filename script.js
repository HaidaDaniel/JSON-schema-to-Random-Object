const fs = require("fs");
const path = require("path");
const generateDataFromSchema = require("./generateDataFromSchema");

const inputDir = path.join(__dirname, "input");
const outputDir = path.join(__dirname, "output");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error("Error reading the input folder:", err);
    return;
  }

  files.forEach((file) => {
    const inputFilePath = path.join(inputDir, file);
    const outputFilePath = path.join(outputDir, file);

    fs.readFile(inputFilePath, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading file ${file}:`, err);
        return;
      }

      try {
        const schema = JSON.parse(data);

        const generatedObject = generateDataFromSchema(schema);

        fs.writeFile(outputFilePath, JSON.stringify(generatedObject, null, 2), (err) => {
          if (err) {
            console.error(`Error writing file ${file}:`, err);
          } else {
            console.log(`File ${file} successfully created in the output folder.`);
          }
        });
      } catch (e) {
        console.error(`Error processing file ${file}:`, e);
      }
    });
  });
});
