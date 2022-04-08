# @porscheofficial/nx-oagen

This plugin helps with setting up nx libraries for typescript api-clients that are generated using openapi-generator. It is merely a wrapper for the tools provided by [openapi-generator](https://github.com/OpenAPITools/openapi-generator).

For reference: This library was generated with `nx g @nrwl/nx-plugin:plugin nx-oagen`.

## Usage

This plugin provides both a generator and a builder.

-   The builder creates an nx library for you and makes all necessary adjustments to the project.json inside that library so you can easily (re-)generate the api client.

-   The builder uses [openapi-generator](https://github.com/OpenAPITools/openapi-generator) to generate the actual api-client inside your library/app.

### Create a new library project (generator)

To create a fresh library that should contain the generated api, use the generator like this:

```sh
nx g @porscheofficial/nx-oagen <project-name> \
  --specFile=<path or url to spec>
```

You may add additional generator arguments (the ones you'd usually add with `--additionalProperties`) by adding `--add <name>=<value>`. Example

```sh
nx g @porscheofficial/nx-oagen petstore-api \
  --specFile=https://petstore.swagger.io/v2/swagger.json \
  --add withSeparateModelsAndApi=true
```

for the `typescript-axios` generator. The generator will add some defaults that have proven to be usefull, but you can change those anytime in your `project.json`.

### Use in existing library/app (builder)

In your project.json add a target that looks smiliar to this:

```json
"build": {
  "executor": "@porscheofficial/nx-oagen:build",
  "options": {
    "specFile": "https://petstore.swagger.io/v2/swagger.json"
  }
}
```

**Builder Options**

| What | Why | Required | Default |
| --- | --- | :-: | :-: |
| specFile | URL or path to swagger spec file (yaml or json) | ✅ | - |
| outDir | Path inside sourceRoot to put generated code into | ❌ | lib |
| generator | Which openapi-generator to use | ❌ | typescript-axios |
| additionalProperties | Dictionary with additional properties to pass to openapi-generator | ❌ | - |

## Dependencies

| Dependency | Version | Needed for |
| --- | --- | --- |
| @openapitools/openapi-generator-cli | 2.x | Actual code generation. <br/>**Attention:** Since this uses java you'll also need a working java runtime on your machine |

 <!-- | @nrwl/node | latest |  | -->

## Running unit tests

Run `nx test nx-oagen` to execute the unit tests via [Jest](https://jestjs.io).

## Running e2e tests

Run `nx e2e nx-oagen-e2e` to execute the e2e tests via [Jest](https://jestjs.io).

The e2e test is setup to create a fresh nx project environment in which a new library is generated. Afterwards the builder that generates the actual code is executed. Since there is a lot going on, this will take a while.

## FAQ

No questions so far
