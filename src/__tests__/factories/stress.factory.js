"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPreferencesTestFactory = exports.StressAssessmentTestFactory = void 0;
const faker_1 = require("@faker-js/faker");
const mongoose_1 = require("mongoose");
const stress_types_1 = require("../../types/stress.types");
const mock_factories_1 = require("../utils/mock-factories");
class StressAssessmentTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const _id = new mongoose_1.Types.ObjectId();
        return Object.assign(Object.assign({ _id, userId: new mongoose_1.Types.ObjectId().toString(), level: faker_1.faker.helpers.arrayElement(Object.values(stress_types_1.StressLevel)), timestamp: faker_1.faker.date.recent(), physicalSymptoms: faker_1.faker.number.int({ min: 0, max: 10 }), emotionalSymptoms: faker_1.faker.number.int({ min: 0, max: 10 }), behavioralSymptoms: faker_1.faker.number.int({ min: 0, max: 10 }), cognitiveSymptoms: faker_1.faker.number.int({ min: 0, max: 10 }), score: faker_1.faker.number.int({ min: 0, max: 10 }), triggers: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 3 }) }, () => faker_1.faker.lorem.word()) }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'StressAssessment', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'StressAssessment', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    withLevel(level) {
        return this.create({ level });
    }
    withHighSymptoms() {
        return this.create({
            physicalSymptoms: 8,
            emotionalSymptoms: 9,
            behavioralSymptoms: 8,
            cognitiveSymptoms: 9,
            score: 9
        });
    }
    withLowSymptoms() {
        return this.create({
            physicalSymptoms: 2,
            emotionalSymptoms: 1,
            behavioralSymptoms: 2,
            cognitiveSymptoms: 1,
            score: 1
        });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.StressAssessmentTestFactory = StressAssessmentTestFactory;
class UserPreferencesTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const _id = new mongoose_1.Types.ObjectId();
        return Object.assign(Object.assign({ _id, userId: new mongoose_1.Types.ObjectId().toString(), preferredTechniques: faker_1.faker.helpers.arrayElements(Object.values(stress_types_1.TechniqueType), faker_1.faker.number.int({ min: 1, max: 4 })), preferredDuration: faker_1.faker.number.int({ min: 1, max: 60 }), timePreferences: {
                reminderFrequency: faker_1.faker.helpers.arrayElement(['DAILY', 'WEEKLY', 'ON_HIGH_STRESS']),
                preferredTimes: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 3 }) }, () => faker_1.faker.date.soon().toLocaleTimeString())
            } }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'UserPreferences', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'UserPreferences', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    withTechniques(techniques) {
        return this.create({ preferredTechniques: techniques });
    }
    withDailyReminders() {
        return this.create({
            timePreferences: {
                reminderFrequency: 'DAILY',
                preferredTimes: ['09:00:00', '15:00:00', '20:00:00']
            }
        });
    }
    withWeeklyReminders() {
        return this.create({
            timePreferences: {
                reminderFrequency: 'WEEKLY',
                preferredTimes: ['10:00:00']
            }
        });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.UserPreferencesTestFactory = UserPreferencesTestFactory;
