/* eslint-disable */
export default {
    displayName: "nx-oagen",

    globals: {},
    testEnvironment: "node",
    transform: {
        "^.+\\.[tj]sx?$": [
            "ts-jest",
            {
                tsconfig: "<rootDir>/tsconfig.spec.json",
            },
        ],
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    coverageDirectory: "../../coverage/packages/nx-oagen",
    preset: "../../jest.preset.js",
}
