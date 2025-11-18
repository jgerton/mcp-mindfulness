"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeditationSessionTestFactory = void 0;
const faker_1 = require("@faker-js/faker");
const mongoose_1 = require("mongoose");
const base_wellness_session_model_1 = require("../../models/base-wellness-session.model");
const base_wellness_session_factory_1 = require("./base-wellness-session.factory");
class MeditationSessionTestFactory extends base_wellness_session_factory_1.BaseWellnessSessionTestFactory {
    create(overrides = {}) {
        const baseSession = super.create();
        return Object.assign(Object.assign(Object.assign({}, baseSession), { title: faker_1.faker.lorem.words(3), description: faker_1.faker.lorem.paragraph(), type: faker_1.faker.helpers.arrayElement(['guided', 'unguided', 'timed']), guidedMeditationId: faker_1.faker.helpers.maybe(() => new mongoose_1.Types.ObjectId()), tags: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 5 }) }, () => faker_1.faker.word.sample()), durationCompleted: faker_1.faker.number.int({ min: 0, max: baseSession.duration }), interruptions: faker_1.faker.number.int({ min: 0, max: 5 }), meditationId: faker_1.faker.helpers.maybe(() => new mongoose_1.Types.ObjectId()), completed: false }), overrides);
    }
    guided(overrides = {}) {
        return this.create(Object.assign({ type: 'guided', guidedMeditationId: new mongoose_1.Types.ObjectId() }, overrides));
    }
    unguided(overrides = {}) {
        return this.create(Object.assign({ type: 'unguided', guidedMeditationId: undefined }, overrides));
    }
    timed(overrides = {}) {
        return this.create(Object.assign({ type: 'timed', guidedMeditationId: undefined }, overrides));
    }
    completed(overrides = {}) {
        const startTime = faker_1.faker.date.recent();
        const duration = faker_1.faker.number.int({ min: 300, max: 3600 });
        return this.create(Object.assign({ startTime, endTime: new Date(startTime.getTime() + duration * 1000), duration, durationCompleted: duration, status: base_wellness_session_model_1.WellnessSessionStatus.Completed, completed: true, moodAfter: faker_1.faker.helpers.arrayElement(Object.values(base_wellness_session_model_1.WellnessMoodState)) }, overrides));
    }
    withInterruptions(count) {
        return this.create({
            interruptions: count
        });
    }
    withCompletionPercentage(percentage) {
        const duration = 1800; // 30 minutes
        return this.create({
            duration,
            durationCompleted: Math.floor(duration * (percentage / 100))
        });
    }
    withTags(tags) {
        return this.create({ tags });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.MeditationSessionTestFactory = MeditationSessionTestFactory;
