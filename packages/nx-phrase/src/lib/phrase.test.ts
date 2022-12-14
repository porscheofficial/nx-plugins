import { PhraseClient } from "./phrase"
import nock from "nock"

xdescribe("PhraseClient", () => {
    let client: PhraseClient
    let config: {
        token: string
        projectId: string
    }

    beforeAll(() => {
        config = {
            token: process.env.PHRASE_TOKEN,
            projectId: process.env.PHRASE_PROJECT_ID,
        }

        client = new PhraseClient({ token: config.token })
    })

    xit("foos", async () => {
        nock("https://api.phrase.com:443", { encodedQueryParams: true })
            .get("/v2/projects/427023c657e0183b62da93f393c946c5/keys")
            .query({ page: "1", per_page: "10" })
            .reply(
                200,
                [
                    {
                        id: "8c78e74b5196369f9db901c742995192",
                        name: "general.back",
                        description: null,
                        name_hash: "2a5fd24f37b982c1c9ff0d124e20a313",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "00d47cedc6fe73aad92b54801d20cf43",
                        name: "general.cancel",
                        description: null,
                        name_hash: "dceba40de5446d1df98a8826dc1798c6",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "c7dd9fb69e3416e654ae9c170af6bec1",
                        name: "general.confirm",
                        description: null,
                        name_hash: "7bbbf8826f1a6f8fdb36536e97d5a991",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "6a2f5a797d83cc5137b0cc93cdacb625",
                        name: "general.destroy",
                        description: null,
                        name_hash: "512d0d70a4831bdf8b6fcbf3aa6e77c7",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "edb8a0bb43299de73339be8590b59fe6",
                        name: "general.edit",
                        description: null,
                        name_hash: "1ce842d922d18a4809f7c89b6fc268c6",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "399996b438617e6f780b28ff8b52c0c0",
                        name: "general.new",
                        description: null,
                        name_hash: "4814e003073ebc8beede68b8a5b02a3a",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "957ba532f65720aba4bebed2e306e1b8",
                        name: "hello",
                        description: null,
                        name_hash: "5d41402abc4b2a76b9719d911017c592",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "a4073f468a2c94b578373042bfe25166",
                        name: "layouts.application.about",
                        description: null,
                        name_hash: "a29babc7e57581576d0f39f2f2c4b05e",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "df0667c825fe2cca45979098c3f41f45",
                        name: "layouts.application.account",
                        description: null,
                        name_hash: "a287f8a2a1d3634c3609aa1210a25af7",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "123c8e7a2465f1de54467d428b47c2ce",
                        name: "layouts.application.app_store",
                        description: null,
                        name_hash: "f78ea636027e6e655457b0acb00d8471",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                ],
                [
                    "Content-Type",
                    "application/json; charset=utf-8",
                    "Link",
                    "<https://api.phrase.com/v2/projects/427023c657e0183b62da93f393c946c5/keys?page=1&per_page=10>; rel=first, <https://api.phrase.com/v2/projects/427023c657e0183b62da93f393c946c5/keys?page=2&per_page=10>; rel=last, <https://api.phrase.com/v2/projects/427023c657e0183b62da93f393c946c5/keys?page=2&per_page=10>; rel=next",
                    "Pagination",
                    '{"total_count":18,"current_page":1,"current_per_page":10,"previous_page":null,"next_page":2}',
                ]
            )
            .get("/v2/projects/427023c657e0183b62da93f393c946c5/keys")
            .query({ page: "2", per_page: "10" })
            .reply(
                200,
                [
                    {
                        id: "7ba6b4cc213eeac091b8c050ad09d632",
                        name: "layouts.application.imprint",
                        description: null,
                        name_hash: "c7b1463f77a3528ac772babc2c413362",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "7c2c5e6e39561d9508b00bad624832bc",
                        name: "layouts.application.logout",
                        description: null,
                        name_hash: "5f76db13ae6825c50185881085fe6019",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "aeb4f6f8cab4a7c248323b821b575295",
                        name: "layouts.application.my_mails",
                        description: null,
                        name_hash: "843fda4ef98ea44d5548b65838fc9841",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "0043d5d77f74f1dc96d7eed243cc6a00",
                        name: "layouts.application.press",
                        description: null,
                        name_hash: "6a93d34fb982019785c48c9a2c572a25",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "d5f40d06f49072015d2b59193cc17c33",
                        name: "layouts.application.preview",
                        description: null,
                        name_hash: "83efa47bfa0e7088ae43781afe3f429f",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "1401a9713fc7bd964ba92060474dd183",
                        name: "layouts.application.profile",
                        description: null,
                        name_hash: "b6e98f1f42d5a70579748640a7431ff6",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "8e65d9d9971d6e28840e7ebd27976df0",
                        name: "layouts.application.sign_in",
                        description: null,
                        name_hash: "00bbee2f3f25c23c28ee8f4b1b7b51b6",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                    {
                        id: "efef7b4a92ee1711fe16c325cf781e7a",
                        name: "layouts.application.sign_up",
                        description: null,
                        name_hash: "8f165881546eb5159ff8634a47704338",
                        plural: false,
                        max_characters_allowed: 0,
                        tags: [],
                        created_at: "2022-12-14T12:51:15Z",
                        updated_at: "2022-12-14T12:51:15Z",
                    },
                ],
                [
                    "Content-Type",
                    "application/json; charset=utf-8",
                    "Link",
                    "<https://api.phrase.com/v2/projects/427023c657e0183b62da93f393c946c5/keys?page=1&per_page=10>; rel=first, <https://api.phrase.com/v2/projects/427023c657e0183b62da93f393c946c5/keys?page=2&per_page=10>; rel=last, <https://api.phrase.com/v2/projects/427023c657e0183b62da93f393c946c5/keys?page=1&per_page=10>; rel=prev",
                    "Pagination",
                    '{"total_count":18,"current_page":2,"current_per_page":10,"previous_page":1,"next_page":null}',
                ]
            )

        const keys = await client.keysListAll({ projectId: config.projectId })
        console.log(keys.length)
    })

    xit("bars", async () => {
        nock.recorder.rec()

        const locales = await client.localesListAll({ projectId: config.projectId })
        console.log(locales.length)
    })
})
