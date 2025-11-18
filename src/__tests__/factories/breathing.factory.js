"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreathingSessionTestFactory = exports.BreathingPatternTestFactory = void 0;
const faker_1 = require("@faker-js/faker");
const mongoose_1 = require("mongoose");
const mock_factories_1 = require("../utils/mock-factories");
class BreathingPatternTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const _id = new mongoose_1.Types.ObjectId();
        return Object.assign(Object.assign({ _id, name: faker_1.faker.lorem.words(2), inhale: faker_1.faker.number.int({ min: 2, max: 6 }), hold: faker_1.faker.helpers.maybe(() => faker_1.faker.number.int({ min: 2, max: 8 })), exhale: faker_1.faker.number.int({ min: 2, max: 8 }), postExhaleHold: faker_1.faker.helpers.maybe(() => faker_1.faker.number.int({ min: 1, max: 4 })), cycles: faker_1.faker.number.int({ min: 3, max: 10 }) }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'BreathingPattern', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'BreathingPattern', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    boxBreathing() {
        return this.create({
            name: 'Box Breathing',
            inhale: 4,
            hold: 4,
            exhale: 4,
            postExhaleHold: 4,
            cycles: 4
        });
    }
    relaxedBreathing() {
        return this.create({
            name: 'Relaxed Breathing',
            inhale: 4,
            exhale: 6,
            cycles: 5
        });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.BreathingPatternTestFactory = BreathingPatternTestFactory;
class BreathingSessionTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const _id = new mongoose_1.Types.ObjectId();
        const startTime = faker_1.faker.date.recent();
        return Object.assign(Object.assign({ _id, userId: new mongoose_1.Types.ObjectId().toString(), patternName: faker_1.faker.lorem.words(2), startTime, endTime: faker_1.faker.helpers.maybe(() => faker_1.faker.date.between({ from: startTime, to: new Date() })), completedCycles: faker_1.faker.number.int({ min: 0, max: 10 }), targetCycles: faker_1.faker.number.int({ min: 5, max: 10 }), stressLevelBefore: faker_1.faker.helpers.maybe(() => faker_1.faker.number.int({ min: 0, max: 10 })), stressLevelAfter: faker_1.faker.helpers.maybe(() => faker_1.faker.number.int({ min: 0, max: 10 })) }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'BreathingSession', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'BreathingSession', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    completed() {
        const startTime = faker_1.faker.date.recent();
        return this.create({
            startTime,
            endTime: faker_1.faker.date.between({ from: startTime, to: new Date() }),
            completedCycles: 5,
            targetCycles: 5,
            stressLevelBefore: 7,
            stressLevelAfter: 3
        });
    }
    inProgress() {
        return this.create({
            endTime: undefined,
            completedCycles: 2,
            targetCycles: 5
        });
    }
    withStressReduction() {
        return this.create({
            stressLevelBefore: 8,
            stressLevelAfter: 4
        });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.BreathingSessionTestFactory = BreathingSessionTestFactory;
