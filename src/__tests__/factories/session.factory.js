"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompletedTestSessionData = exports.createTestSessionData = void 0;
const base_wellness_session_model_1 = require("../../models/base-wellness-session.model");
const db_1 = require("../helpers/db");
const createTestSessionData = (overrides = {}) => {
    const now = new Date();
    const defaultSession = {
        userId: (0, db_1.getTestObjectId)(),
        startTime: now,
        duration: 600, // 10 minutes
        status: base_wellness_session_model_1.WellnessSessionStatus.Active,
        moodBefore: base_wellness_session_model_1.WellnessMoodState.Neutral,
        moodAfter: undefined,
        notes: undefined,
        endTime: undefined
    };
    return Object.assign(Object.assign({}, defaultSession), overrides);
};
exports.createTestSessionData = createTestSessionData;
const createCompletedTestSessionData = (overrides = {}) => {
    const now = new Date();
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
    return (0, exports.createTestSessionData)(Object.assign({ startTime: thirtyMinsAgo, endTime: now, status: base_wellness_session_model_1.WellnessSessionStatus.Completed, moodAfter: base_wellness_session_model_1.WellnessMoodState.Peaceful }, overrides));
};
exports.createCompletedTestSessionData = createCompletedTestSessionData;
