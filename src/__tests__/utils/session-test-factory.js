"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionTestFactory = void 0;
const mock_factories_1 = require("./mock-factories");
const mongoose_1 = require("mongoose");
class SessionTestFactory extends mock_factories_1.BaseTestDataFactory {
    defaultData() {
        return {
            _id: new mongoose_1.Types.ObjectId().toString(),
            userId: new mongoose_1.Types.ObjectId().toString(),
            techniqueId: new mongoose_1.Types.ObjectId().toString(),
            startTime: new Date(),
            duration: 300, // 5 minutes in seconds
            completed: false,
            mood: {
                before: 3,
                after: null
            },
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    completed(afterMood = 4) {
        const startTime = new Date(Date.now() - 300000); // 5 minutes ago
        return this.create({
            overrides: {
                startTime,
                completed: true,
                mood: {
                    before: 3,
                    after: afterMood
                }
            }
        });
    }
    inProgress() {
        return this.create({
            overrides: {
                startTime: new Date(),
                completed: false
            }
        });
    }
    withDuration(minutes) {
        return this.create({
            overrides: {
                duration: minutes * 60
            }
        });
    }
    withNotes(notes) {
        return this.create({
            overrides: { notes }
        });
    }
    forUserAndTechnique(userId, techniqueId) {
        return this.create({
            overrides: { userId, techniqueId }
        });
    }
}
exports.SessionTestFactory = SessionTestFactory;
