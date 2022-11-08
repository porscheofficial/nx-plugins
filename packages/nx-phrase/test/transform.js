module.exports = (translationKey) => {
    if (typeof translationKey === "string") {
        return translationKey.replace(/\[(.*?)\]/, "")
    } else {
        throw new Error("Input is not a string")
    }
}
