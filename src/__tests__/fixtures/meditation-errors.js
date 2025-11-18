"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATION_RULES = exports.MEDITATION_STATE_ERRORS = exports.NON_EXISTENT_IDS = exports.INVALID_IDS = exports.INVALID_MEDITATION_INPUTS = void 0;
const mongoose_1 = require("mongoose");
const service_errors_1 = require("./service-errors");
// Invalid Meditation Inputs
exports.INVALID_MEDITATION_INPUTS = {
    NEGATIVE_DURATION: {
        duration: -1,
        userId: service_errors_1.TEST_IDS.USER
    },
    INVALID_MOOD: {
        moodRating: 6,
        userId: service_errors_1.TEST_IDS.USER
    },
    MISSING_REQUIRED: {
        type: 'GUIDED'
    },
    INVALID_TYPE: {
        type: 'INVALID',
        userId: service_errors_1.TEST_IDS.USER
    }
};
// Invalid IDs
exports.INVALID_IDS = {
    SESSION: 'not-an-object-id',
    USER: '123invalid456'
};
// Non-Existent IDs
exports.NON_EXISTENT_IDS = {
    SESSION: new mongoose_1.Types.ObjectId().toString(),
    USER: new mongoose_1.Types.ObjectId().toString(),
    MEDITATION: new mongoose_1.Types.ObjectId().toString()
};
// Meditation State Errors
exports.MEDITATION_STATE_ERRORS = {
    ALREADY_COMPLETED: {
        sessionId: service_errors_1.TEST_IDS.SESSION,
        userId: service_errors_1.TEST_IDS.USER,
        state: 'COMPLETED',
        completedAt: new Date().toISOString()
    },
    ALREADY_STARTED: {
        sessionId: service_errors_1.TEST_IDS.SESSION,
        userId: service_errors_1.TEST_IDS.USER,
        state: 'IN_PROGRESS',
        startedAt: new Date().toISOString()
    },
    INVALID_TRANSITION: {
        sessionId: service_errors_1.TEST_IDS.SESSION,
        userId: service_errors_1.TEST_IDS.USER,
        state: 'CREATED',
        requestedState: 'COMPLETED'
    }
};
// Meditation Validation Rules
exports.VALIDATION_RULES = {
    DURATION: {
        MIN: 1,
        MAX: 60
    },
    MOOD_RATING: {
        MIN: 1,
        MAX: 5
    },
    VALID_TYPES: ['GUIDED', 'UNGUIDED', 'BREATHING', 'BODY_SCAN']
};
