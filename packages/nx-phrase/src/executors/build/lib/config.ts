import { existsSync, readFileSync } from "fs-extra"
import { resolve } from "path"

import { ConfigFileNonSensitiveArgs, NonSensitiveArgs, Operation } from "../types"
import { ExecutorContext } from "@nrwl/devkit"
import { load } from "js-yaml"
import { PhraseClientConfig } from "./phrase"

interface ConfigFileFormat {
    phrase: {
        [appName: string]: {
            access_token: string
        } & ConfigFileNonSensitiveArgs
    }
}

const requiredConfigs: Record<Operation, string[]> = {
    push: ["access_token", "project_id", "upload_language_id"],
    pull: ["access_token", "project_id", "output"],
}

export interface InternalPhraseConfig extends NonSensitiveArgs {
    phraseClientConfig: PhraseClientConfig
}

function readConfig(context: ExecutorContext, operation: Operation) {
    if (!context.projectName) {
        throw new Error("project name not set in context")
    }

    const configFileLocation = resolve(context.root, ".phrase.yml")

    if (!existsSync(configFileLocation)) {
        console.error(`Could not find configuration file at ${configFileLocation}`)
        process.exit(-1)
    }

    const configFileContent = load(readFileSync(configFileLocation, { encoding: "utf8" })) as ConfigFileFormat

    let error = false
    if (!configFileContent.phrase) {
        console.info(`Config file does not have 'phrase' root node.`)
        error = true
    }
    if (!configFileContent.phrase[context.projectName]) {
        console.info(`Config file has no configuration section for project '${context.projectName}'`)
        error = true
    }
    requiredConfigs[operation]
        .filter((requiredProperty) => !configFileContent.phrase[context.projectName][requiredProperty])
        .forEach((requiredProperty) => {
            console.info(
                `Configuration section for project '${context.projectName}' in .phrase.yml is missing configuration value for '${requiredProperty}'`
            )
            error = true
        })

    if (error) {
        process.exit(-1)
    }

    return configFileContent.phrase[context.projectName]
}

export function getConfig(context: ExecutorContext, operation: Operation): InternalPhraseConfig {
    if (!context.projectName) {
        throw new Error("project name not set in context")
    }

    const config = readConfig(context, operation)

    const {
        projectName,
        workspace: { projects },
    } = context
    const { sourceRoot } = projects[projectName]

    const output = resolve(context.workspace.projects[context.projectName].root, config.output)
    const phraseClientConfig: PhraseClientConfig = { token: config.access_token }

    return {
        phraseClientConfig,
        projectId: config.project_id,
        fileFormat: config.file_format ?? "react_simple_json",
        branch: config.branch,
        uploadLanguageId: config.upload_language_id || "default",
        output,
        sourceRoot: config.source_root ?? sourceRoot,
        sourceGlob: config.source_glob ?? "**/*.{ts,tsx}",
        ignoreGlob: config.ignore_glob ?? "**/*.d.ts",
    }
}
