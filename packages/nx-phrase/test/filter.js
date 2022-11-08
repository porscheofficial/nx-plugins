module.exports = (translationKey) => {
    // Regexplanation:
    // - key must consist of multiple key fragments (ascii string) joined by '.'
    // - key can contain []-section at end of key
    // - multiple key specifics (ascii string) are joined by ','
    // - whitespaces inside [] are allowed (because they will be trimmed anyway)
    const isMatch = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*(\[\s*[a-zA-Z0-9]+(\s*,\s*[a-zA-Z0-9]+)*\s*\])?$/.test(
        translationKey
    )
    return isMatch
}
