export function sendResponse(res, status, msg) {
    res.status(status);
    res.send(msg);
}