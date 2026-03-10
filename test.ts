import * as fc from "fast-check";
import * as assert from "node:assert";
import it, { describe } from "node:test";
import * as z from "zod";
import * as jf from "./index.ts";
import { replaceFloat, reviveFloat } from "./index.ts";

fc.configureGlobal({ numRuns: 10000 });

export const JsonFloatSchema = z.object({
  type: z.literal("ieee754"),
  value: z.union([z.enum(["Infinity", "-Infinity", "-0", "NaN"]), z.number()]),
});

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters,@typescript-eslint/no-unused-vars
export function assertType<_ extends never>() {}

type TypeEquals<A, B> = Exclude<A, B> | Exclude<B, A>;
assertType<TypeEquals<JsonFloat, z.infer<typeof JsonFloatSchema>>>();

const anyNumber = fc.oneof(
  fc.constantFrom(Infinity, -Infinity, 0, -0, NaN),
  fc.integer(),
  fc.float(),
  fc.double(),
);

void describe("float2json / json2float", () => {
  void testOnAllNumbers("emit objects with type=ieee754", (n) => {
    const o = jf.float2json(n);
    assert.strictEqual(typeof o, "object");
    assert.strictEqual(o["type"], "ieee754");
  });

  void testOnAllNumbers("are inverse", (n) => {
    const out = JSON.stringify(jf.float2json(n));
    const back = JsonFloatSchema.parse(JSON.parse(out));
    assert.strictEqual(jf.json2float(back), n);
  });
});

void describe("hasJsonRepresentation", () => {
  void testOnAllNumbers(
    "can tell if a number can be serialized naively",
    (n) => {
      assert.strictEqual(
        jf.hasJsonRepresentation(n),
        Object.is(JSON.parse(JSON.stringify(n)), n),
      );
    },
  );
});

void describe("JSON replacer/reviver", () => {
  void it("Are inverse except on malformed json-float objects", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc
            .object({ maxDepth: 0 })
            .map(removeUndefinedValues)
            .filter(excludeMalformedJsonFloats),
          fc.anything().filter((x) => x !== undefined && typeof x !== "object"),
        ),
        (x) => {
          const out = JSON.stringify(x, jf.replaceFloat);
          const back: unknown = JSON.parse(out, jf.reviveFloat);
          assert.deepStrictEqual(back, x);
        },
      ),
    );
  });

  void testOnAllNumbers("Replaces numbers only when necessary", (n) => {
    const isReplaced =
      typeof JSON.parse(JSON.stringify(n, jf.replaceFloat)) === "object";
    assert.strictEqual(isReplaced, !jf.hasJsonRepresentation(n));
  });

  void it("Revives from objects only if type=ieee754", () => {
    fc.assert(
      fc.property(
        fc.record(
          {
            type: fc.string().filter((s) => s !== "ieee754"),
            value: fc.integer(),
          },
          { requiredKeys: ["value"], noNullPrototype: true },
        ),
        (o) => {
          const out = JSON.stringify(o);
          const back: unknown = JSON.parse(out, jf.reviveFloat);
          assert.deepStrictEqual(back, o);
        },
      ),
    );
  });

  void it("Work as promised in README", () => {
    // This snippet appears in the "Example" at the top of the README,
    // and fragments of it appear in the example code for replaceFloat
    // and reviveFloat in the API reference

    // Snippet starts here
    // import { replaceFloat, reviveFloat } from "./index.ts";

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
    const p: unknown = JSON.parse(s, reviveFloat); // Returns an identical object
    // Snippet ends here

    assert.deepStrictEqual(p, o);
  });
});

function testOnAllNumbers(
  name: string,
  predicate: (n: number) => boolean | undefined,
) {
  return it(name, () => {
    fc.assert(fc.property(anyNumber, predicate));
  });
}

function removeUndefinedValues(o: object): object {
  const proto: unknown = Object.getPrototypeOf(o);
  const out = Object.create(proto) as object;
  for (const [k, v] of Object.entries(o)) {
    if (v !== undefined) {
      out[k] = v as unknown;
      if (k === "__proto__") {
        Object.setPrototypeOf(out, proto);
      }
    }
  }
  return out;
}

function excludeMalformedJsonFloats(o: object): boolean {
  return (
    !("type" in o) ||
    o.type !== "ieee754" ||
    ("value" in o && typeof o.value === number)
  );
}
