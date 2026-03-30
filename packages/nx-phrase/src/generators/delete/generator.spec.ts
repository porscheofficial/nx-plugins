import { createTree } from "@nrwl/devkit/testing"
import { Tree } from "@nrwl/devkit"
import { default as generator } from "./generator"

const appOrLibName = "app-or-lib"
const targetName = "target"
const configurationName = "configuration"

describe("delete generator", () => {
    let tree: Tree
    beforeEach(() => {
        tree = createTree()
        tree.write(
            "apps/app-or-lib/project.json",
            JSON.stringify({
                targets: {
                    [targetName]: {
                        options: {
                            projectId: "phraseProjectId",
                        },
                        configurations: {
                            [configurationName]: {
                                projectId: "actualProjectId",
                            },
                        },
                    },
                },
            })
        )
    })

    it("deletes", async () => {
        await generator(tree, { config: `${appOrLibName}:${targetName}:${configurationName}`, file: "" })
    })
})
