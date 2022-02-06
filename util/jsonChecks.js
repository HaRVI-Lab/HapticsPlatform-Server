export function jsonValidate(dataStr) {
    try {
        let data = JSON.parse(dataStr);
        return [true, data];
    } catch(e) {
        return [false, {}];
    }
}