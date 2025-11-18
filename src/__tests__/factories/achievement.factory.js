"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAchievementTestFactory = exports.AchievementTestFactory = void 0;
const faker_1 = require("@faker-js/faker");
const mongoose_1 = require("mongoose");
const achievement_model_1 = require("../../models/achievement.model");
const mock_factories_1 = require("../utils/mock-factories");
class AchievementTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const _id = new mongoose_1.Types.ObjectId();
        const createdAt = faker_1.faker.date.recent();
        return Object.assign(Object.assign({ _id, name: faker_1.faker.lorem.words(2), description: faker_1.faker.lorem.sentence(), category: faker_1.faker.helpers.arrayElement(Object.values(achievement_model_1.AchievementCategory)), criteria: faker_1.faker.lorem.sentence(), icon: faker_1.faker.system.fileName(), points: faker_1.faker.number.int({ min: 10, max: 100 }), progress: faker_1.faker.number.int({ min: 0, max: 100 }), target: faker_1.faker.number.int({ min: 100, max: 1000 }), completed: faker_1.faker.datatype.boolean(), completedAt: faker_1.faker.helpers.maybe(() => faker_1.faker.date.recent()), type: faker_1.faker.helpers.arrayElement(Object.values(achievement_model_1.AchievementType)), userId: new mongoose_1.Types.ObjectId(), createdAt, updatedAt: createdAt }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'Achievement', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'Achievement', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    completed() {
        const completedAt = faker_1.faker.date.recent();
        return this.create({
            completed: true,
            completedAt,
            progress: 100
        });
    }
    inProgress(progress = faker_1.faker.number.int({ min: 1, max: 99 })) {
        return this.create({
            completed: false,
            completedAt: undefined,
            progress
        });
    }
    meditation() {
        return this.create({
            category: achievement_model_1.AchievementCategory.MEDITATION,
            type: achievement_model_1.AchievementType.DURATION,
            name: 'Meditation Master',
            description: 'Complete 100 hours of meditation',
            target: 6000, // 100 hours in minutes
        });
    }
    streak() {
        return this.create({
            category: achievement_model_1.AchievementCategory.CONSISTENCY,
            type: achievement_model_1.AchievementType.STREAK,
            name: 'Streak Master',
            description: 'Maintain a 30-day meditation streak',
            target: 30,
        });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.AchievementTestFactory = AchievementTestFactory;
class UserAchievementTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const _id = new mongoose_1.Types.ObjectId();
        const createdAt = faker_1.faker.date.recent();
        return Object.assign(Object.assign({ _id, userId: new mongoose_1.Types.ObjectId(), achievementId: new mongoose_1.Types.ObjectId(), progress: faker_1.faker.number.int({ min: 0, max: 100 }), isCompleted: faker_1.faker.datatype.boolean(), dateEarned: faker_1.faker.helpers.maybe(() => faker_1.faker.date.recent()), createdAt, updatedAt: createdAt }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'UserAchievement', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'UserAchievement', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    completed() {
        return this.create({
            progress: 100,
            isCompleted: true,
            dateEarned: faker_1.faker.date.recent()
        });
    }
    inProgress(progress = faker_1.faker.number.int({ min: 1, max: 99 })) {
        return this.create({
            progress,
            isCompleted: false,
            dateEarned: undefined
        });
    }
    forUser(userId) {
        return this.create({ userId });
    }
    forAchievement(achievementId) {
        return this.create({ achievementId });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.UserAchievementTestFactory = UserAchievementTestFactory;
