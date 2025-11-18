"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseWellnessSessionTestFactory = void 0;
const faker_1 = require("@faker-js/faker");
const mongoose_1 = require("mongoose");
const base_wellness_session_model_1 = require("../../models/base-wellness-session.model");
const mock_factories_1 = require("../utils/mock-factories");
class BaseWellnessSessionTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const startTime = faker_1.faker.date.recent();
        const _id = new mongoose_1.Types.ObjectId();
        return Object.assign(Object.assign({ _id, userId: new mongoose_1.Types.ObjectId(), startTime, duration: faker_1.faker.number.int({ min: 300, max: 3600 }), status: base_wellness_session_model_1.WellnessSessionStatus.Active, moodBefore: faker_1.faker.helpers.arrayElement(Object.values(base_wellness_session_model_1.WellnessMoodState)), moodAfter: faker_1.faker.helpers.arrayElement(Object.values(base_wellness_session_model_1.WellnessMoodState)), notes: faker_1.faker.lorem.paragraph() }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'BaseWellnessSession', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'BaseWellnessSession', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    withStatus(status) {
        return this.create({ status });
    }
    withMood(moodBefore, moodAfter) {
        return this.create({ moodBefore, moodAfter });
    }
    withDuration(duration) {
        return this.create({ duration });
    }
    withEndTime(endTime) {
        return this.create({ endTime });
    }
    completed(moodAfter) {
        const startTime = faker_1.faker.date.recent();
        return this.create({
            startTime,
            endTime: new Date(startTime.getTime() + 600000), // 10 minutes later
            status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
            moodAfter
        });
    }
    paused() {
        return this.create({
            status: base_wellness_session_model_1.WellnessSessionStatus.Paused
        });
    }
    abandoned() {
        return this.create({
            status: base_wellness_session_model_1.WellnessSessionStatus.Abandoned
        });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.BaseWellnessSessionTestFactory = BaseWellnessSessionTestFactory;
