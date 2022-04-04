# @porscheofficial/nx-plugins

This repository provides reusable patterns for use in nx monorepos. It is an excerpt of the tasks the maintainers use on a daily basis. We want to share with everybody who does similar recurring tasks and who might find the provided tools helpful.

## List of plugins currently in this repository

| Name | Description |
| --- | --- |
| [nx-phrase](packages/nx-phrase/) | Helps with common translations tasks using formatjs / react-intl and phrase as provider |
| [nx-oagen](packages/nx-oagen/) | Helps with creation of nx libraries with api clients generated from openapi specification using openapi-generate |

# How does this repository work?

This project was generated using `create-nx-plugin porscheofficial`. All of the following instructions are derived from this generated plugin repository.

## Adding a plugin

To add more plugins to this repository execute:

    nx g @nrwl/nx-plugin:plugin your-plugin-name

**Note:** It is recommended to use dashes in your plugin name.

Your plugin will have the default namespace (currently `porscheofficial`) for this repository. You can change this in the `package.json` of your plugin.

## Building & Publishing

To build your plugin simply call

    nx build your-plugin-name

This will create the transpiled output in `/dist/packages/your-plugin-name/`

Our plugins are scoped. The scope is the part before the `/` inside your plugin's `package.json`. To publish your plugin somewhere else than npmjs.com, you'll have to create an `.npmrc` file in the project root. (TODO: This file could be added in the future). The file should look like this

    <scope>:registry = https://artifactory.mycompany.com/artifactory/api/npm/<npm repository name>/

Before you publish:

-   Make sure you're logged in into the repository you're trying to publish to
-   Go to the output directory of your plugin (`dist/packages/your-plugin-name`)
-   Verify the `package.json` looks good (scope is correct, version is up to date, ...)

Finally execute

    yarn publish

and follow the instructions.

## Running unit tests

Run `nx test my-plugin` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Understand your workspace

Run `nx graph` to see a diagram of the dependencies of your projects.
