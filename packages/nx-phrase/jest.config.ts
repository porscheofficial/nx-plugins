/* eslint-disable */
export default {
    displayName: "nx-phrase",

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
    coverageDirectory: "../../coverage/packages/nx-phrase",
    preset: "../../jest.preset.js",
}
