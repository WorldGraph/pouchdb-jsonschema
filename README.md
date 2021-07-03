# pouch-jsonschema

## Installing

```sh
npm i -S @worldgraph/pouchdb-jsonschema ajv
```

## Usage

```ts
PouchDB.plugin(jsonSchemaValidator)
import Ajv from "ajv"
const ajv = new Ajv()
const validator = ajv.compile([your json schema object])
const db = new PouchDB("testdb")
db.put([object being persisted], { schemaValidator: validator })
```

### Note on pouchdb limitations

Because PouchDB plugins are [applied at the global level](https://github.com/pouchdb/pouchdb/issues/7198#issue-310015544), it is not possible to apply different plugins to different database instances. If it were, the plugin could be configured to associate different databases with different json schema definitions, and it wouldn't be necessary to pass the `schemaValidato` options property to `db.put`. You can get around the awkwardness of needing to pass the `schemaValidator` option to `put` each time by setting up your own database wrapper class and encapsulating the passing of `schemaValidator` there.

<!-- https://github.com/pouchdb/pouchdb/issues/7198#issue-310015544 -->

## Full Example

```ts
import PouchDB from "pouchdb"
import { JSONSchema7 } from "json-schema" // Optional for those who want strong typing of schema definitions
import { jsonSchemaValidator } from "@worldgraph/pouchdb-jsonschema"
import Ajv from "ajv"

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
      description: "The dog's name",
    },
    age: {
      type: "number",
      description: "The dog's age",
    },
  },
}

PouchDB.plugin(jsonSchemaValidator)
const ajv = new Ajv()
const dogValidator = ajv.compile(DogSchema)

async function testError() {
  const db = new PouchDB("testdb")
  const dogMissingAge = {
    _id: new Date().getTime().toString(), // or any other id generating expression
    name: "Max",
  }

  db.put(dogMissingAge, { schemaValidator: dogValidator })
}

// Will throw exception `Error: should have required property 'age'`
testError()
```
