const generateDataFromSchema = require("./generateDataFromSchema");

describe("generateDataFromSchema", () => {
  it("should generate an object with required fields", () => {
    const schema = {
      type: "object",
      properties: {
        id: { type: "integer", minimum: 1, maximum: 10 },
        name: { type: "string" },
      },
      required: ["id", "name"],
    };
    const data = generateDataFromSchema(schema);

    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("name");
    expect(data.id).toBeGreaterThanOrEqual(1);
    expect(data.id).toBeLessThanOrEqual(10);
  });

  it("should generate nested objects", () => {
    const schema = {
      type: "object",
      properties: {
        details: {
          type: "object",
          properties: {
            length: { type: "integer", minimum: 1, maximum: 20 },
            width: { type: "integer", minimum: 1, maximum: 20 },
          },
          required: ["length"],
        },
      },
      required: ["details"],
    };
    const data = generateDataFromSchema(schema);

    expect(data).toHaveProperty("details");
    expect(data.details).toHaveProperty("length");
    expect(data.details.length).toBeGreaterThanOrEqual(1);
    expect(data.details.length).toBeLessThanOrEqual(20);
  });

  it("should handle arrays", () => {
    const schema = {
        type: "object",
        properties: {
          test: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["test"],
      };
    const data = generateDataFromSchema(schema);
    expect(Array.isArray(data?.test)).toBe(true);

    data.test.forEach((item) => expect(typeof item).toBe("string"));
  });
});
