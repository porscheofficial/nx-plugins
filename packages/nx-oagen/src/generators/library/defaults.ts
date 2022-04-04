import { Generator } from "../../types"

export const defaults: Record<Generator, Record<string, string | number | boolean>> = {
    "typescript-axios": {
        // supportsES6: true,
        enumPropertyNaming: "original",
    },
    typescript: {
        // supportsES6: true,
        framework: "fetch-api",
        platform: "node",
        useObjectParameters: true,
    },
    "typescript-fetch": {
        // supportsES6: true
        enumPropertyNaming: "original",
        typescriptThreePlus: true,
        useSingleRequestParameter: true,
    },
    "typescript-node": {
        // supportsES6: true,
        enumPropertyNaming: "original",
    },
}
