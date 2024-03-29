import { readFileSync } from "fs"
import { InternalPhraseConfig } from "./config"
import { PhraseClient } from "./phrase"
import debug from "debug"

const logger = debug("nx-plugins.nx-phrase.lib.delete")

export async function deleteKeys(file: string, config: InternalPhraseConfig): Promise<void> {
    const keysToDelete = JSON.parse(readFileSync(file).toString())

    // ask for confirmation?
    const phrase = new PhraseClient(config.phraseClientConfig)
    for (const key of keysToDelete) {
        // resolve keyIds for key name
        const keyIds = await phrase.keysSearchByName({
            projectId: config.projectId,
            keyName: key,
            branch: config.branch,
        })
        // delete keyIds
        for (const keyId of keyIds) {
            try {
                await phrase.deleteKey({ projectId: config.projectId, keyId, branch: config.branch })
            } catch (e) {
                logger(`Could not delete key with id '${keyId}' for name '${key}', ${e}`)
            }
        }
    }
}
