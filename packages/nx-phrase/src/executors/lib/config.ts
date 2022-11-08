import { existsSync, readFileSync } from "fs-extra"
import { resolve } from "path"

import { NonSensitiveArgs } from "./types"
import { ExecutorContext } from "@nrwl/devkit"
import { load } from "js-yaml"
import { PhraseClientConfig } from "./phrase"
import { BuildExecutorSchema } from "../build/schema"

interface ConfigFileFormat {
    phrase: {
        [appName: string]: {
            access_token: string
        }
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

function validateConfig(config: NonSensitiveArgs, projectName: string, requiredConfigProperties: string[]) {
    let error = false

    requiredConfigProperties
        .filter((requiredProperty) => !config[requiredProperty])
        .forEach((requiredProperty) => {
            console.info(
                `Configuration property '${requiredProperty}' not set for translation target in project.json of project '${projectName}'.`
            )
            error = true
        })

    return !error
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
    const { sourceRoot, root } = projects[projectName]

    const rawConfig = readConfig(context)
    // get output first, so it does not get overwritten
    const output = resolve(
        root,
        // use from project.json -> config file -> fallback
        options.output ?? "./translations"
    )
    const config = {
        output,
        branch: options.branch,
        fileFormat: options.fileFormat ?? "react_simple_json",
        ignoreGlob: options.ignoreGlob ?? "**/*.d.ts",
        projectId: options.projectId,
        sourceRoot: options.sourceRoot ?? sourceRoot,
        sourceGlob: options.sourceGlob ?? "**/*.{ts,tsx}",
        uploadLanguageId: options.uploadLanguageId || "default",
        sourceKeyTransformer: options.sourceKeyTransformer,
        phraseKeyTransformer: options.phraseKeyTransformer,
        sourceKeyFilter: options.sourceKeyFilter,
        phraseKeyFilter: options.phraseKeyFilter,
        useFallbackLocale: options.useFallbackLocale,
        useSourceLocaleAsFallback: options.useSourceLocaleAsFallback,
    } as NonSensitiveArgs

    if (!validateConfig(config, projectName, requiredConfigurationProperties)) {
        throw new Error("Invalid configuration")
    }

    const phraseClientConfig: PhraseClientConfig = { token: rawConfig.access_token }

    return {
        phraseClientConfig,
        ...config,
    }
}
