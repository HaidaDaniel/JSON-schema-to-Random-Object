const fs = require("fs");
const path = require("path");
const generateDataFromSchema = require("./generateDataFromSchema");

jest.mock("fs");
jest.mock("./generateDataFromSchema");

describe("Schema Processing Script", () => {
  const inputDir = path.join(__dirname, "input");
  const outputDir = path.join(__dirname, "output");

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should create output directory if it does not exist", () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});

    jest.isolateModules(() => {
      require("./script");
    });

    expect(fs.existsSync).toHaveBeenCalledWith(outputDir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(outputDir);
  });

  test("should log error if input folder cannot be read", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Test Error");

    fs.existsSync.mockReturnValue(true);
    fs.readdir.mockImplementation((_, callback) => callback(error, null));

    jest.isolateModules(() => {
      require("./script");
    });

    expect(consoleError).toHaveBeenCalledWith("Error reading the input folder:", error);
  });

  test("should process files and generate JSON in output folder", () => {
    const mockSchema = { type: "object", properties: { id: { type: "integer" } }, required: ["id"] };
    const mockData = JSON.stringify(mockSchema);
    const generatedObject = { id: 1 };

    fs.existsSync.mockReturnValue(true);
    fs.readdir.mockImplementation((_, callback) => callback(null, ["example-schema.json"]));
    fs.readFile.mockImplementation((_, __, callback) => callback(null, mockData));
    fs.writeFile.mockImplementation((_, __, callback) => callback(null));

    generateDataFromSchema.mockReturnValue(generatedObject);

    const consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

    jest.isolateModules(() => {
      require("./script");
    });

    expect(fs.readFile).toHaveBeenCalledWith(
      path.join(inputDir, "example-schema.json"),
      "utf8",
      expect.any(Function)
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(outputDir, "example-schema.json"),
      JSON.stringify(generatedObject, null, 2),
      expect.any(Function)
    );
    expect(consoleLog).toHaveBeenCalledWith("File example-schema.json successfully created in the output folder.");
  });

  test("should log error if file reading fails", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Test Error");

    fs.existsSync.mockReturnValue(true);
    fs.readdir.mockImplementation((_, callback) => callback(null, ["example-schema.json"]));
    fs.readFile.mockImplementation((_, __, callback) => callback(error, null));

    jest.isolateModules(() => {
      require("./script");
    });

    expect(consoleError).toHaveBeenCalledWith("Error reading file example-schema.json:", error);
  });

  test("should log error if JSON parsing fails", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    fs.existsSync.mockReturnValue(true);
    fs.readdir.mockImplementation((_, callback) => callback(null, ["example-schema.json"]));
    fs.readFile.mockImplementation((_, __, callback) => callback(null, "invalid JSON"));

    jest.isolateModules(() => {
      require("./script");
    });

    expect(consoleError).toHaveBeenCalledWith("Error processing file example-schema.json:", expect.any(SyntaxError));
  });

  test("should log error if file writing fails", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Write Error");

    const mockSchema = { type: "object", properties: { id: { type: "integer" } }, required: ["id"] };
    const mockData = JSON.stringify(mockSchema);
    const generatedObject = { id: 1 };

    fs.existsSync.mockReturnValue(true);
    fs.readdir.mockImplementation((_, callback) => callback(null, ["example-schema.json"]));
    fs.readFile.mockImplementation((_, __, callback) => callback(null, mockData));
    fs.writeFile.mockImplementation((_, __, callback) => callback(error));

    jest.isolateModules(() => {
      require("./script");
    });

    expect(consoleError).toHaveBeenCalledWith("Error writing file example-schema.json:", error);
  });
});
