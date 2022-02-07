import { setSurveyLinkDAL, getSurveyLinkDAL } from "../dal/surveyDAL.js";
import { stringType } from "../constant/types.js";
import { sendResponse } from "../util/response.js";

export async function setSurvey(req, res, client) {
    const { survey_id, survey_link } = req.body;
    if(typeof survey_id !== stringType || typeof survey_link !== stringType) {
        sendResponse(res, 200, "survey_id and survey_link must both be strings.");
        return;
    }

    try {
        let success = await setSurveyLinkDAL(client, survey_id, survey_link);
        if(success) {
            sendResponse(res, 200, "Survey link successfully set.");
        } else {
            sendResponse(res, 500, "Internal server error.");
        }
    } catch(err) {
        console.log(err);
    }
}

export async function getSurvey(req, res, client, logs) {
    const { survey_id } = req.body;
    if(typeof survey_id !== stringType) {
        sendResponse(res, 200, "survey_id must be string.");
        return;
    }

    let msg = "";
    try {
        let { success, reply } = await getSurveyLinkDAL(client, survey_id);
        if(success) {
            msg = reply;
        }
        logs.push(msg);
        sendResponse(res, 200, msg);
    } catch(err) {
        console.log(err);
    }
}