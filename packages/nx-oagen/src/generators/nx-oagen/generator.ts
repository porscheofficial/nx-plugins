import { installPackagesTask, addDependenciesToPackageJson, Tree } from "@nrwl/devkit"
import { NxOagenGeneratorSchema } from "./schema"
import { libraryGenerator } from "../../index"
import { AdditionalProperties } from "../../types"

function parseAdditionalProperties(additionalProperties: string[]): AdditionalProperties {
    const props: AdditionalProperties = {}

    if (additionalProperties) {
        additionalProperties.forEach((arg) => {
            const [name, value] = arg.split("=")
            try {
                props[name] = JSON.parse(value)
            } catch {
                props[name] = value
            }
        })
    }

    return props
}

export default async function (tree: Tree, options: NxOagenGeneratorSchema) {
    const parsedOptions = { ...options, additionalProperties: parseAdditionalProperties(options.additionalProperties) }

    // create library
    await libraryGenerator(tree, parsedOptions)

    // Add dependencies
    switch (parsedOptions.generator) {
        case "typescript-axios":
            addDependenciesToPackageJson(tree, { axios: "^0.x" }, {})
            break
        case "typescript-fetch":
            // TODO: Add note-fetch and polyfills (e.g. form-data)
            // addDependenciesToPackageJson(tree, {}, {})
            break
        case "typescript":
            // TODO: tricky as this client can potentially use node-fetch or other mechanisms
            break
        default:
    }

    return async () => {
        installPackagesTask(tree)

        console.log(`Generator ran for ${parsedOptions.projectName}`, parsedOptions)
    }
}
