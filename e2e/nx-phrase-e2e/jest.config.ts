module.exports = {
    displayName: "nx-phrase-e2e",
    preset: "../../jest.preset.js",
    globals: {},
    transform: {
        "^.+\\.[tj]s$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/tsconfig.spec.json",
            },
        ],
    },
    moduleFileExtensions: ["ts", "js", "html"],
    coverageDirectory: "../../coverage/e2e/nx-phrase-e2e",
}
