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

### Adjusting your project.json

To make the executor available via nx commands, add this to your `targets` section in your `project.json`:

```json
"translation": {
  "executor": "@porscheofficial/nx-phrase:build",
    "options": {},
    "configurations": {
      "pull": {
        "operation": "pull"
      },
      "push": {
        "operation": "push"
      }
    }
  }
}
```

Technically the `pull` configuration is unnecessary because pull the the default action of the executor, but it helps to keep things fluid.

You may also specify all but the `access_token` options (see below) in the options of your target.

### The configuration file

The plugin uses a central configuration file that has to be located in your nx project's root folder. The name of the file must be `.phrase.yml`. The file looks like this:

```yaml
phrase:
    my-app-name:
        access_token: phrase_access_token
        project_id: phrase_project_id
        output: src/assets/l10n
        upload_language_id: phrase_language_id
        file_format: react_simple_json       (optional)
        branch: phrase_branch_name           (optional)
        source_root: source_root_override    (optional)
    my-other-app-name:
        access_token: ...
        ...
```

**Description:**

| What | project.json option | Why | Required | Default |
| --- | --- | --- | :-: | :-: |
| phrase | - | document root node | ✅ |  |
| .my-app-name | - | nx project name, as specified under `pojects` in your `workspace.json` | ✅ |  |
| ..access_token | - | Phrase access token. Don't have one yet? Goto [phrase.com -> Access Tokens](https://app.phrase.com/settings/oauth_access_tokens) and create one with read and write scopes. | ✅ | - |
| ..project_id | projectId | Id of the phrase project to use. Can be found in Phrase project settings under API, or the "☁️ ID"-button on the project overview. | ✅ | - |
| ..output | output | Where downloaded translations files will be placed relative to your project's root directory. | ✅ | - |
| ..upload_language_id | uploadLanguageId | Language ID to use when uploading new translations. Can be found in the API section when editing a language. Do yourself a favor and make this a language you will never edit in phrase. | ✅ | - |
| ..file_format | fileFormat | File format to download from phrase. See [supported platforms and formats](https://help.phrase.com/help/supported-platforms-and-formats) | ❌ | react_simple_json |
| ..branch | branch | In case you're working with branches in phrase. | ❌ | - |
| ..source_root | sourceRoot | Source root override, in case some of your sources are not located in your project's sourceRoot. | ❌ | Your project's sourceRoot directory (as specified in project.json) |

All but the `access_token` property can also be specified in the options section of the nx-phrase target in your project.json. The `access_token` should never be committed to the repository, so it's not possible to specify it in the project.json

## Dependencies

This plugin uses the following peer dependencies, which you will have to provide in your nx project.

| Dependency    | Version | Needed for                                                  |
| ------------- | ------- | ----------------------------------------------------------- |
| js-yaml       | 4.x     | Reading configuration file aka `.phrase.yml`                |
| form-data     | 4.x     | Used to construct multipart-form-data request for phase api |
| @formatjs/cli | 4.x     | Used to extract and compile translations from codebase      |
| fs-extra      | 10.x    | Convenience features for filesystem operation               |

## Running unit tests

Run `nx test nx-phrase` to execute the unit tests via [Jest](https://jestjs.io).

## FAQ

**How would I go about to do extract and upload translations for multiple apps?**

Use `source_root` override in configuration file.

**How would I _really_ go about to do extract and upload translations for multiple apps?**

So you figured out, that this is kind of messy, because you would have to configure the target in both projects? The strategic approach to this would be to create an nx library i.e. my-app-translations and configure the extraction there. This way you only need to configure everything once.
