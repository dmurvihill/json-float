export interface JsonFloat {
  type: "ieee754";
  value: number | "Infinity" | "-Infinity" | "-0" | "NaN";
}

export function replaceFloat(key: string, value: unknown) {
  return typeof value === "number" && !hasJsonRepresentation(value)
    ? float2json(value)
    : value;
}

export function reviveFloat(key: string, value: unknown) {
  return typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "ieee754"
    ? json2float(value as JsonFloat)
    : value;
}

export function float2json(n: number): JsonFloat {
  let value: JsonFloat["value"];
  if (n === Infinity) {
    value = "Infinity";
  } else if (n === -Infinity) {
    value = "-Infinity";
  } else if (n === 0 && 1 / n === -Infinity) {
    value = "-0";
  } else if (Number.isNaN(n)) {
    value = "NaN";
  } else {
    value = n;
  }
  return { type: "ieee754", value };
}

export function json2float(o: JsonFloat) {
  if (o.value === "Infinity") {
    return Infinity;
  } else if (o.value === "-Infinity") {
    return -Infinity;
  } else if (o.value === "-0") {
    return -0;
  } else if (o.value === "NaN") {
    return NaN;
  } else {
    return o.value;
  }
}

export function hasJsonRepresentation(n: number) {
  return !(
    n === Infinity ||
    n === -Infinity ||
    Object.is(n, -0) ||
    Object.is(n, NaN)
  );
}
