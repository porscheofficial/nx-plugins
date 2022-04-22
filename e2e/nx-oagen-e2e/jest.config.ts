module.exports = {
    displayName: "nx-oagen-e2e",
    preset: "../../jest.preset.ts",
    globals: {
        "ts-jest": {
            tsconfig: "<rootDir>/tsconfig.spec.json",
        },
    },
    transform: {
        "^.+\\.[tj]s$": "ts-jest",
    },
    moduleFileExtensions: ["ts", "js", "html"],
    coverageDirectory: "../../coverage/e2e/nx-oagen-e2e",
}
