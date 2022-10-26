export interface ConfigFileNonSensitiveArgs {
    project_id: string
    branch?: string
    file_format?: string
    output: string
    upload_language_id: string
    source_root?: string
    source_glob?: string
    ignore_glob?: string
    source_key_transformer: string
    phrase_key_transformer: string
}

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
}
