export const formatCamelCase = (str) =>
  str
    .replace(/([A-Z])/g, " $1")
    .replace(/\./g, " ")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
