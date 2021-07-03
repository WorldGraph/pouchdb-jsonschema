import { JSONSchema7 } from "json-schema"
import PouchDB from "pouchdb"
import memoryAdapter from "pouchdb-adapter-memory"
import { jsonSchemaValidator } from "."
import Ajv from "ajv"
import { ulid } from "ulid"

const DogSchema: JSONSchema7 = {
  title: "Dog",
  type: "object",
  required: ["_id", "name", "age"],
  properties: {
    _id: {
      type: "string",
      description: "primary key",
    },
    name: {
      type: "string",
      description: "Dog's name",
    },
    age: {
      type: "number",
      description: "dog's age",
    },
  },
}

const ajv = new Ajv()
const dogValidator = ajv.compile(DogSchema)

describe("tests", () => {
  let db
  beforeAll(() => {
    // Clears the database and adds some testing data.
    // Jest will wait for this promise to resolve before running tests.
    PouchDB.plugin(jsonSchemaValidator as any)
    PouchDB.plugin(memoryAdapter)
    db = new PouchDB("testdb", { adapter: "memory" })
  })
  it("should throw", async () => {
    const missingAge = {
      _id: ulid(),
      name: "name",
    }

    await expect(async () => {
      await db.put(missingAge)
    }).rejects.toThrowError()
  })

  it("should not throw", async () => {
    const valid = {
      _id: ulid(),
      name: "Max",
      age: 10,
    }

    const res = await db.put(valid, { schemaValidator: dogValidator } as any)
    expect(res.ok).toEqual(true)
  })
})
