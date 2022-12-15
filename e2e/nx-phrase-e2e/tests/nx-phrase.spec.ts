import { ProjectConfiguration } from "@nrwl/devkit"
import {
    ensureNxProject,
    runNxCommandAsync,
    readJson,
    updateFile,
    runPackageManagerInstall,
    runCommand,
    runNxCommand,
    readFile,
} from "@nrwl/nx-plugin/testing"
import serve, { buffer, send } from "micro"
import { load, dump } from "js-yaml"
import { IncomingMessage, Server } from "http"
import { AddressInfo } from "net"

const testProject = "translation-project"

function preparePhraseYmlSetup() {
    // adjust phrase config file
    const phraseConfig = load(readFile(".phrase.yml")) as { phrase: Record<string, Record<string, string>> }
    const newPhraseConfig = {
        phrase: {
            [testProject]: {
                ...phraseConfig.phrase[testProject],
                project_id: "project_id",
                upload_language_id: "upload_language_id",
                output: "tmp/delete/me",
            },
        },
    }
    updateFile(".phrase.yml", dump(newPhraseConfig))

    // clear project.json options
    const projectJson = readJson(`apps/${testProject}/project.json`)
    projectJson.targets.translation.options = {}
    updateFile(`apps/${testProject}/project.json`, JSON.stringify(projectJson, null, 2))
}

function prepareProjectJsonSetup() {
    // clear .phrase.yml
    const phraseConfig = load(readFile(".phrase.yml")) as { phrase: Record<string, Record<string, string>> }
    const newPhraseConfig = {
        phrase: {
            [testProject]: {
                access_token: phraseConfig.phrase[testProject].access_token,
            },
        },
    }
    updateFile(".phrase.yml", dump(newPhraseConfig))

    // adjust project.json options
    const projectJson = readJson(`apps/${testProject}/project.json`)
    projectJson.targets.translation.options = {
        ...projectJson.targets.translation.options,
        projectId: "project_id",
        uploadLanguageId: "upload_language_id",
        output: "tmp/delete/me",
    }
    updateFile(`apps/${testProject}/project.json`, JSON.stringify(projectJson, null, 2))
}

async function startMockServer(cb: (req: IncomingMessage, body: string | Buffer) => void = () => {}) {
    const server = serve(async (req, res) => {
        const buf = await buffer(req)
        cb(req, buf)
        send(res, 201, {})
    }) as unknown as Server

    const port = await new Promise<number>((resolve) => {
        server.listen({ port: 0, host: "127.0.0.1" }, () => {
            const address = server.address() as AddressInfo
            resolve(address.port)
        })
    })
    const url = `http://127.0.0.1:${port}`
    console.log(`phrase mock listening on ${url}`)

    // configure env so that this url will be used
    updateFile(".env", `PHRASE_API_BASE_URL=${url}`)

    return server
}

async function setupTestProject() {
    ensureNxProject("@porscheofficial/nx-phrase", "dist/packages/nx-phrase")

    const { devDependencies } = readJson("package.json")
    runCommand(`yarn add -D @nrwl/react@${devDependencies["nx"]}`)

    await runNxCommandAsync(`generate @nrwl/react:application ${testProject}`)
    const projectJson = readJson(`apps/${testProject}/project.json`) as ProjectConfiguration
    expect(projectJson).toBeTruthy()

    // add translation actions to project configuration
    await runNxCommand(`generate @porscheofficial/nx-phrase:configuration ${testProject}`)
    runPackageManagerInstall()
}

describe("nx-phrase e2e", () => {
    const postMock = jest.fn()
    let mockserver: Awaited<ReturnType<typeof startMockServer>>

    beforeAll(async () => {
        await setupTestProject()
        mockserver = await startMockServer(postMock)
        prepareProjectJsonSetup()
    }, 120000)

    afterAll(async () => {
        mockserver.close()
    }, 120000)

    beforeEach(async () => {
        jest.clearAllMocks()
    })

    it("should successfully push translations", async () => {
        await runNxCommandAsync(`run ${testProject}:translation:push`)

        expect(postMock).toHaveBeenCalledTimes(1)
    }, 120000)

    it.todo(
        "should successfully pull translations"
        // , async () => {
        //     const { stderr, stdout } = await runNxCommandAsync(`run ${testProject}:translation:pull`)
        //     console.log(stdout, stderr)
        // }
    )
})
