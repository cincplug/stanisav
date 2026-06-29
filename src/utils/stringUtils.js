export const formatCamelCase = (str) =>
  str
    .replace(/([A-Z])/g, " $1")
    .replace(/\./g, " ")
    .trim()
    .replace(
      /^(.)(.*)$/,
      (_, first, rest) => first.toUpperCase() + rest.toLowerCase(),
    );
