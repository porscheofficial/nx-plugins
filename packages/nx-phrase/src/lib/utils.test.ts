import { DEFAULT_PHRASE_LANGUAGE_NAME } from "./consts"
import { getLanguageAndRegion } from "./utils"

describe("utils", () => {
    it.each`
        locale                          | expectedLanguage                | expectedRegion
        ${DEFAULT_PHRASE_LANGUAGE_NAME} | ${DEFAULT_PHRASE_LANGUAGE_NAME} | ${undefined}
        ${"blabla"}                     | ${DEFAULT_PHRASE_LANGUAGE_NAME} | ${undefined}
        ${undefined}                    | ${DEFAULT_PHRASE_LANGUAGE_NAME} | ${undefined}
        ${"en"}                         | ${"en"}                         | ${undefined}
        ${"EN"}                         | ${"en"}                         | ${undefined}
        ${"en-US"}                      | ${"en"}                         | ${"US"}
        ${"en-us"}                      | ${"en"}                         | ${"US"}
        ${"EN-us"}                      | ${"en"}                         | ${"US"}
    `(
        "should get language '$expectedLanguage' & region '$expectedRegion' for locale '$locale'",
        ({ locale, expectedLanguage, expectedRegion }) => {
            const { language, region } = getLanguageAndRegion(locale)
            expect(language).toEqual(expectedLanguage)
            expect(region).toEqual(expectedRegion)
        }
    )

    it.each`
        locale
        ${""}
        ${"en-US-CA"}
        ${"en-DDD"}
        ${"blub-US"}
    `("should throw an error for invalid locale '$locale'", ({ locale }) => {
        expect(() => {
            getLanguageAndRegion(locale)
        }).toThrowError(new Error("Incorrect locale information provided"))
    })
})
