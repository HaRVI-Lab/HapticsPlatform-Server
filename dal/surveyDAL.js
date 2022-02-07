export async function setSurveyLinkDAL(client, survey_id, link) {
    try {
        let reply = await client.set(survey_id, link);
        return reply === "OK" ? true : false;
    } catch(err) {
        throw err;
    }
}

export async function getSurveyLinkDAL(client, survey_id) {
    try {
        let reply = await client.get(survey_id);
        let success = reply !== null ? true : false;
        return { success, reply };
    } catch(err) {
        throw err;
    }
}