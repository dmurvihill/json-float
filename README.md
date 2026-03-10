# json-float

Represent any floating point value as JSON.

:white_check_mark: Node 18+  
:white_check_mark: ESM or CJS
:white_check_mark: TypeScript-Native  
:white_check_mark: Comprehensive Documentation  
:white_check_mark: 100% Coverage

:heart: :evergreen_tree: Made with love in Portland, Oregon. :evergreen_tree: :heart:

# Getting started

```bash
npm install json-float
```

Emitting JSON:

```typescript
import { replaceFloat, reviveFloat } from "./index.ts";

const o = {
  normalFloat: 1.2,
  specialFloat: Infinity,
  otherValue: {
    key: "string",
  },
};

const s = JSON.stringify(o, replaceFloat, 2);
/*
{
  "normalFloat": 1.2,
  "specialFloat": {
    "type": "ieee754",
    "value": "Infinity"
  },
  "otherValue": {
    "key": "string"
  }
}
*/
const p = JSON.parse(s, reviveFloat); // Returns an identical object
```

For more fine-grained control, see [`float2json`](#float2json),
[`json2float`](#json2float), and [`hasJsonRepresentation`](#hasjsonrepresentation)
below.

# Why?

The IEEE 754 floating-point values `Infinity`, `-Infinity`, `-0`, and
`NaN` cannot be represented as a literal JSON numbers. `JSON.stringify`
renders the value `-0` as `0` (numerically the same but with a different
byte-level representation) and renders the other three as `null`.
`json-float` converts floating point values to and from a
JSON-serializable object representation so all possible values can be
stored.

# JSON Representation

Example outputs from `float2json`:

```
{
  type: 'ieee754',
  value: 'NaN',
}

{
  type: 'ieee754',
  value: 23.56787
}
```

## type

Always the string `ieee754`.

## value

One of the following:

- Any of the strings `Infinity`, `-Infinity`, `-0`, or `NaN`: represents
  the corresponding floating point value
- A JavaScript number.

# API Reference

## replaceFloat

Implements the [`replacer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#replacer) interface of `JSON.stringify`.

Example:

```typescript
const o = {
  normalFloat: 1.2,
  specialFloat: Infinity,
  otherValue: {
    key: "string",
  },
};

const s = JSON.stringify(o, replaceFloat, 2);
/*
{
  "normalFloat": 1.2,
  "specialFloat": {
    "type": "ieee754",
    "value": "Infinity"
  },
  "otherValue": {
    "key": "string"
  }
}
*/
```

## reviveFloat

Implements the [`reviver`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#reviver) interface of `JSON.parse`.

Example:

```typescript
const s = `
{
  "normalFloat": 1.2,
  "specialFloat": {
    "type": "ieee754",
    "value": "Infinity"
  },
  "otherValue": {
    "key": "string"
  }
}`;
const p = JSON.parse(s, reviveFloat);
/*
{
  normalFloat: 1.2,
  specialFloat: Infinity,
  otherValue: {
    key: 'string',
  },
}
*/
```

## hasJsonRepresentation

Example:

```typescript
hasJsonRepresentation(1.1); // true
hasJsonRepresentation(NaN); // false
```

Parameters:

- n: `number`.

Returns:
`true` if the number can be represented directly with a JSON number, `false` otherwise.

## float2json

Wraps a `number` in a JSON object.

Example:

```typescript
float2json(1.1); // { type: 'ieee754', value: 1.1 }
float2json(NaN); // { type: 'ieee754', value: NaN }
```

Parameters:

- n: `number`.

Returns: JSON float object (see [JSON Representation](#json-representation)).
The number is wrapped even if it could be rendered directly as a JSON number.

## json2float

Unwraps a JSON float object to a `number`.

Example:

```typescript
json2float({ type: "ieee754", value: 1.1 }); // 1.1
json2float({ type: "ieee754", value: NaN }); // NaN
```

Parameters:

- o: JSON float object (see [JSON Representation](#json-representation)).

# License

MIT. See [LICENSE.txt](LICENSE.txt).

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md).
