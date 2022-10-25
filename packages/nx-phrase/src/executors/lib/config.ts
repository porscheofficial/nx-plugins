import { existsSync, readFileSync } from "fs-extra"
import { resolve } from "path"

import { ConfigFileNonSensitiveArgs, NonSensitiveArgs } from "./types"
import { ExecutorContext } from "@nrwl/devkit"
import { load } from "js-yaml"
import { PhraseClientConfig } from "./phrase"
import { BuildExecutorSchema } from "../build/schema"

interface ConfigFileFormat {
    phrase: {
        [appName: string]: {
            access_token: string
        } & ConfigFileNonSensitiveArgs
    }
}

export interface InternalPhraseConfig extends NonSensitiveArgs {
    phraseClientConfig: PhraseClientConfig
}

function readConfig(context: ExecutorContext) {
    const projectName = context.projectName
    if (!projectName) {
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
    const configSection = configFileContent.phrase[projectName]
    if (!configSection) {
        console.info(`Config file has no configuration section for project '${projectName}'`)
        error = true
    }

    if (!configSection.access_token) {
        console.error(
            `'access_token' not set in .phrase.yml for translation target in project.json of project '${projectName}'.`
        )
        error = true
    }

    if (error) {
        process.exit(-1)
    }

    return configSection
}

function validateConfig(config: Record<string, unknown>, projectName: string, requiredConfigProperties: string[]) {
    let error = false

    requiredConfigProperties
        .filter((requiredProperty) => !config[requiredProperty])
        .forEach((requiredProperty) => {
            console.info(
                `Configuration property '${requiredProperty}' not set in .phrase.yml or options for translation target in project.json of project '${projectName}'.`
            )
            error = true
        })

    return error
}

export function getConfig(
    options: BuildExecutorSchema,
    context: ExecutorContext,
    requiredConfigurationProperties: string[]
): InternalPhraseConfig {
    if (!context.projectName) {
        throw new Error("project name not set in context")
    }

    const {
        projectName,
        workspace: { projects },
    } = context
    const { sourceRoot } = projects[projectName]

    const rawConfig = readConfig(context)
    const output = resolve(context.workspace.projects[context.projectName].root, rawConfig.output ?? ".")
    const config = {
        branch: rawConfig.branch,
        fileFormat: rawConfig.file_format ?? "react_simple_json",
        ignoreGlob: rawConfig.ignore_glob ?? "**/*.d.ts",
        output,
        projectId: rawConfig.project_id,
        sourceRoot: rawConfig.source_root ?? sourceRoot,
        sourceGlob: rawConfig.source_glob ?? "**/*.{ts,tsx}",
        uploadLanguageId: rawConfig.upload_language_id || "default",
    }

    // override options from config file / cli with the ones from the project.json
    Object.assign(config, { ...config, ...options })

    validateConfig(config, context.projectName, requiredConfigurationProperties)

    const phraseClientConfig: PhraseClientConfig = { token: rawConfig.access_token }

    return {
        phraseClientConfig,
        ...config,
    }
}
