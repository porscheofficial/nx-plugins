# @porscheofficial/nx-phrase

This plugin helps you with your nx react app to extract translations defined via `react-intl`'s `#defineMessages`-method.

The actual extraction is handled by `@formatjs/cli`'s `extract` command.

For reference: This plugin was generated with `nx g @nrwl/nx-plugin:plugin nx-phrase`

## Usage

To extract translations from your source code and upload them to phrase use:

```sh
nx run your-project-name:translation:push
```

To download translations from phrase use:

```sh
nx run your-project-name:translation
# OR
nx run your-project-name:translation:pull
```

## Configuration

Configuration happens in two steps. You'll need to adjust your project's configuration file and create a configuration file.

### .phrase.yml

The plugin uses a configuration file that has to be located in your nx project's root folder. The name of the file must be `.phrase.yml`. The content of this file should look something like this:

```
phrase:
    projectNameA:
        access_token: accessToken1
    projectNameB:
        access_token: accessToken2
```

The 'phrase' document root is required. Below the root node you can define multiple project configurations. The name of each configuration must be the name of the corresponding nx app or lib, for which the access token is valid. Don't have a Phrase access token yet? Goto [phrase.com -> Access Tokens](https://app.phrase.com/settings/oauth_access_tokens) and create one with read and write scopes. The access token is configured separately because Nx's `project.json` are committed to version control, therefor the secret does not belong there.

**Make sure you never commit your `.phrase.yml` to your version control. Best to add it to your .gitignore file.**

### Adjusting your project.json

To make the executor available via nx commands, add this to your `targets` section in your `project.json`:

```json
"translation": {
  "executor": "@porscheofficial/nx-phrase:build",
    "options": {
      "projectId": "some phrase project id",
      "output": "src/assets/l10n",
      "uploadLanguageId": "id of default language",
      ...
    },
    "configurations": {
      "pull": {
        "operation": "pull",
        ...
      },
      "push": {
        "operation": "push",
        ...
      },
      "unused": {
        "operation": "find-unused",
        ...
      }
    }
  }

```

Technically the `pull` configuration is unnecessary because `pull` is the the default action of the executor. It does help to keep your configuration easy to understand, though.

All operations have the following options in common:

| Name | What does it do? | Required | Default |
| --- | --- | :-: | :-: |
| projectId | Id of the phrase project to use. Can be found in Phrase project settings under API, or the "☁️ ID"-button on the project overview. | ✅ | - |
| branch | In case you're working with branches in phrase. | ❌ | - |

Other options vary vary depending on the executed operation. It makes sense to set at least `projectId`, `output` and `uploadLanguageId` in the shared options of the executor configuration, to get you started quickly.

All available and required options per operation are explained in the next section.

#### Pull

This operation pulls (i.e. downloads) translations from phrase into the configured output folder.

| Name | What does it do? | Required | Default |
| --- | --- | :-: | :-: |
| output | Where downloaded translations files will be placed relative to your project's root directory. | ❌ | `./translations` |
| fileFormat | File format to download from phrase. See [supported platforms and formats](https://help.phrase.com/help/supported-platforms-and-formats) | ❌ | `react_simple_json` |
| branch | In case you're working with branches in phrase. | ❌ | - |
| useSourceLocaleAsFallback | Emulate phrase fallback_locale behavior via source_locale field. This only works with `react_simple_json` fileFormat | ❌ | false |

#### Push

This operation extracts translations from the source code and pushes (i.e. uploads) them to phrase.

| Name | What does it do? | Required | Default |
| --- | --- | :-: | :-: |
| uploadLanguageId | Language ID to use when uploading translations. Can be found in the API section when editing a language. Do yourself a favor and make this a language you will never edit in phrase. | ✅ | - |
| branch | In case you're working with branches in phrase. | ❌ | - |
| sourceRoot | Source root override, in case some of your sources are not located in your project's sourceRoot. | ❌ | Your project's sourceRoot directory (as specified in project.json) |
| sourceGlob | Glob pattern used to search for files containing translations | ❌ | `**/*.{ts,tsx}` |
| ignoreGlob | Glob pattern to ignore some files that would otherwise be included by `sourceGlob` | ❌ |  |

#### Unused

This operation finds keys in the source code and phrase that are not in use or are missing. By configuring transfomers and filters it is also possible to compare keys that aren't a direct match. This is helpful for example when you allow your translators to create derivative translation keys that target the same translation in code.

| Name | What does it do? | Required | Default |
| --- | --- | :-: | :-: |
| sourceKeyTransformer | Path to a javascript file exporting a default function that is called for each key extracted from the source to allow transformation of said key | ❌ | - |
| phraseKeyTransformer | Path to a javascript file exporting a default function that is called for each key downloaded from phrase to allow transformation of said key | ❌ | - |
| sourceKeyFilter | Path to a javascript file exporting a default function that is called for each key extracted from the source to allow transformation of said key | ❌ | - |
| phraseKeyFilter | Path to a javascript file exporting a default function that is called for each key downloaded from phrase to allow transformation of said key | ❌ | - |

#### (Future) Delete

This operation allows you to delete keys in phrase. It is mostly used to delete translations keys that have previously been identified as unused by the `unused` operation.

(This is still in development)

## Dependencies

This plugin uses the following peer dependencies, which you will have to provide in your nx project.

| Dependency        | Version | Needed for                                                                  |
| ----------------- | ------- | --------------------------------------------------------------------------- |
| js-yaml           | 4.x     | Reading configuration file aka `.phrase.yml`                                |
| form-data         | 4.x     | Used to construct multipart-form-data request for phase api                 |
| @formatjs/cli-lib | 5.x     | Used to extract and compile translations from codebase                      |
| fs-extra          | 10.x    | Convenience features for filesystem operation                               |
| glob              | 8.x     | Globbing library to find the source files to extract translations keys from |
| debug             | 4.x     | Logging library                                                             |

## Running unit tests

Run `nx test nx-phrase` to execute the unit tests via [Jest](https://jestjs.io).

## FAQ

**How would I go about to do extract and upload translations for multiple apps?**

Use `source_root` override in configuration file.

**How would I _really_ go about to do extract and upload translations for multiple apps?**

So you figured out, that this is kind of messy, because you would have to configure the target in both projects? The strategic approach to this would be to create an nx library i.e. my-app-translations and configure the extraction there. This way you only need to configure everything once.
