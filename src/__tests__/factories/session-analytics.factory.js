"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionAnalyticsTestFactory = void 0;
const faker_1 = require("@faker-js/faker");
const mongoose_1 = require("mongoose");
const mock_factories_1 = require("../utils/mock-factories");
class SessionAnalyticsTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const _id = new mongoose_1.Types.ObjectId();
        const startTime = faker_1.faker.date.recent();
        const duration = faker_1.faker.number.int({ min: 5, max: 60 });
        const durationCompleted = faker_1.faker.number.int({ min: 0, max: duration });
        return Object.assign(Object.assign({ _id, userId: new mongoose_1.Types.ObjectId(), sessionId: new mongoose_1.Types.ObjectId(), meditationId: new mongoose_1.Types.ObjectId(), startTime, endTime: faker_1.faker.helpers.maybe(() => new Date(startTime.getTime() + duration * 60 * 1000)), duration,
            durationCompleted, completed: durationCompleted === duration, focusScore: faker_1.faker.helpers.maybe(() => faker_1.faker.number.int({ min: 1, max: 10 })), moodBefore: faker_1.faker.helpers.arrayElement(['anxious', 'stressed', 'neutral', 'calm', 'peaceful']), moodAfter: faker_1.faker.helpers.maybe(() => faker_1.faker.helpers.arrayElement(['anxious', 'stressed', 'neutral', 'calm', 'peaceful'])), interruptions: faker_1.faker.number.int({ min: 0, max: 5 }), notes: faker_1.faker.helpers.maybe(() => faker_1.faker.lorem.paragraph()), tags: faker_1.faker.helpers.maybe(() => Array.from({ length: faker_1.faker.number.int({ min: 1, max: 3 }) }, () => faker_1.faker.lorem.word())), maintainedStreak: faker_1.faker.datatype.boolean(), createdAt: startTime, updatedAt: startTime }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'SessionAnalytics', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'SessionAnalytics', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    completed() {
        const startTime = faker_1.faker.date.recent();
        const duration = faker_1.faker.number.int({ min: 10, max: 30 });
        return this.create({
            startTime,
            endTime: new Date(startTime.getTime() + duration * 60 * 1000),
            duration,
            durationCompleted: duration,
            completed: true,
            focusScore: faker_1.faker.number.int({ min: 7, max: 10 }),
            moodBefore: 'stressed',
            moodAfter: 'peaceful',
            interruptions: 0,
            maintainedStreak: true
        });
    }
    incomplete() {
        const startTime = faker_1.faker.date.recent();
        const duration = 20;
        const durationCompleted = faker_1.faker.number.int({ min: 1, max: 19 });
        return this.create({
            startTime,
            endTime: new Date(startTime.getTime() + durationCompleted * 60 * 1000),
            duration,
            durationCompleted,
            completed: false,
            moodBefore: 'anxious',
            interruptions: faker_1.faker.number.int({ min: 1, max: 3 }),
            maintainedStreak: false
        });
    }
    withMoodImprovement() {
        return this.create({
            moodBefore: 'stressed',
            moodAfter: 'peaceful',
            focusScore: faker_1.faker.number.int({ min: 8, max: 10 }),
            interruptions: 0
        });
    }
    withHighFocus() {
        return this.create({
            focusScore: faker_1.faker.number.int({ min: 9, max: 10 }),
            interruptions: 0,
            maintainedStreak: true
        });
    }
    withTags(tags) {
        return this.create({ tags });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.SessionAnalyticsTestFactory = SessionAnalyticsTestFactory;
