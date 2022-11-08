export interface NonSensitiveArgs {
    projectId: string
    branch: string
    fileFormat: string
    output: string
    uploadLanguageId: string
    sourceRoot: string
    sourceGlob: string
    ignoreGlob: string
    sourceKeyTransformer: string
    phraseKeyTransformer: string
    sourceKeyFilter: string
    phraseKeyFilter: string
    useSourceLocaleAsFallback: boolean
    useFallbackLocale: boolean
    inputFile: string
    workingDirectory: string
}
