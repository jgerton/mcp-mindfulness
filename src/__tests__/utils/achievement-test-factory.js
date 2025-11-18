"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementTestFactory = void 0;
const faker_1 = require("@faker-js/faker");
const base_test_factory_1 = require("./base-test-factory");
class AchievementTestFactory extends base_test_factory_1.BaseTestFactory {
    create(overrides = {}) {
        return Object.assign({ _id: this.generateId(), title: faker_1.faker.company.catchPhrase(), description: faker_1.faker.lorem.paragraph(), userId: this.generateId(), criteria: {
                type: 'SESSION_COUNT',
                target: faker_1.faker.number.int({ min: 5, max: 100 }),
                progress: 0
            }, isCompleted: false, createdAt: new Date(), updatedAt: new Date() }, overrides);
    }
    withProgress(progress) {
        const achievement = this.create();
        achievement.criteria.progress = progress;
        return achievement;
    }
    completed() {
        const achievement = this.create();
        achievement.isCompleted = true;
        achievement.completedAt = new Date();
        achievement.criteria.progress = achievement.criteria.target;
        return achievement;
    }
    withCriteriaType(type, target = 10) {
        return this.create({
            criteria: {
                type,
                target,
                progress: 0
            }
        });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.AchievementTestFactory = AchievementTestFactory;
