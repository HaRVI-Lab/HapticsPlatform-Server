export function jsonParseValidate(dataStr) {
    try {
        JSON.parse(dataStr);
        return true;
    } catch(e) {
        return false;
    }
}

export function jsonStringifyValidate(data) {
    try {
        JSON.stringify(data);
        return true;
    } catch(e) {
        return false;
    }
}