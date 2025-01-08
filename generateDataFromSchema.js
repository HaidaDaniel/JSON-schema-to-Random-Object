function generateDataFromSchema(schema, definitions = {}) {
  function resolveRef(ref) {
    const refName = ref.replace(/^#\/?/, "");
    return definitions[refName];
  }

  function generateValue(fieldSchema) {
    if (fieldSchema.$ref) {
      const resolvedSchema = resolveRef(fieldSchema.$ref);
      return generateValue(resolvedSchema);
    }

    if (fieldSchema.type) {
      switch (fieldSchema.type) {
        case "string":
          return "random_string";
        case "integer":
          const min = fieldSchema.minimum || 0;
          const max = fieldSchema.maximum || 100;
          return Math.floor(Math.random() * (max - min + 1)) + min;
        case "boolean":
          return Math.random() > 0.5;
        case "array":
          if (fieldSchema.items) {
            return Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() =>
              generateValue(fieldSchema.items)
            );
          }
          return [];
        case "object":
          return generateObject(fieldSchema);
        default:
          return null;
      }
    } else if (fieldSchema.enum) {
      return fieldSchema.enum[Math.floor(Math.random() * fieldSchema.enum.length)];
    } else if (fieldSchema.anyOf) {
      const randomSchema = fieldSchema.anyOf[Math.floor(Math.random() * fieldSchema.anyOf.length)];
      return generateValue(randomSchema);
    }
    return null;
  }

  function generateObject(schema) {
    const obj = {};
    for (const key in schema.properties) {
      if (
        schema.required?.includes(key) ||
        Math.random() > 0.5
      ) {
        obj[key] = generateValue(schema.properties[key]);
      }
    }
    return obj;
  }

  return generateObject(schema);
}

module.exports = (schema) => generateDataFromSchema(schema, schema.definitions || {});
