"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StressManagementSessionTestFactory = void 0;
const faker_1 = require("@faker-js/faker");
const mongoose_1 = require("mongoose");
const stress_management_session_model_1 = require("../../models/stress-management-session.model");
const base_wellness_session_model_1 = require("../../models/base-wellness-session.model");
const base_wellness_session_factory_1 = require("./base-wellness-session.factory");
class StressManagementSessionTestFactory extends base_wellness_session_factory_1.BaseWellnessSessionTestFactory {
    create(overrides = {}) {
        const baseSession = super.create();
        return Object.assign(Object.assign(Object.assign({}, baseSession), { technique: faker_1.faker.helpers.arrayElement(Object.values(stress_management_session_model_1.StressManagementTechnique)), stressLevelBefore: faker_1.faker.number.int({ min: 1, max: 10 }), stressLevelAfter: faker_1.faker.helpers.maybe(() => faker_1.faker.number.int({ min: 1, max: 10 })), guidedSessionId: faker_1.faker.helpers.maybe(() => new mongoose_1.Types.ObjectId()), triggers: Array.from({ length: faker_1.faker.number.int({ min: 0, max: 5 }) }, () => faker_1.faker.lorem.words(3)), physicalSymptoms: Array.from({ length: faker_1.faker.number.int({ min: 0, max: 10 }) }, () => faker_1.faker.lorem.words(2)), emotionalSymptoms: Array.from({ length: faker_1.faker.number.int({ min: 0, max: 10 }) }, () => faker_1.faker.lorem.words(2)), effectiveness: faker_1.faker.helpers.maybe(() => faker_1.faker.number.int({ min: 1, max: 5 })) }), overrides);
    }
    withTechnique(technique) {
        return this.create({ technique });
    }
    withStressLevels(before, after) {
        return this.create({
            stressLevelBefore: before,
            stressLevelAfter: after
        });
    }
    withGuidedSession() {
        return this.create({
            guidedSessionId: new mongoose_1.Types.ObjectId(),
            technique: stress_management_session_model_1.StressManagementTechnique.GuidedImagery
        });
    }
    completed(overrides = {}) {
        const startTime = faker_1.faker.date.recent();
        const duration = faker_1.faker.number.int({ min: 300, max: 3600 });
        const stressLevelBefore = faker_1.faker.number.int({ min: 5, max: 10 });
        return this.create(Object.assign({ startTime, endTime: new Date(startTime.getTime() + duration * 1000), duration, status: base_wellness_session_model_1.WellnessSessionStatus.Completed, stressLevelBefore, stressLevelAfter: faker_1.faker.number.int({ min: 1, max: stressLevelBefore }), effectiveness: faker_1.faker.number.int({ min: 3, max: 5 }), moodAfter: faker_1.faker.helpers.arrayElement(Object.values(base_wellness_session_model_1.WellnessMoodState)) }, overrides));
    }
    withFeedback(overrides = {}) {
        const feedback = Object.assign({ effectivenessRating: faker_1.faker.number.int({ min: 1, max: 5 }), stressReductionRating: faker_1.faker.number.int({ min: 1, max: 5 }), comments: faker_1.faker.lorem.paragraph(), improvements: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 5 }) }, () => faker_1.faker.lorem.sentence()) }, overrides);
        return this.create({
            status: base_wellness_session_model_1.WellnessSessionStatus.Completed,
            feedback
        });
    }
    withSymptoms(physical, emotional) {
        return this.create({
            physicalSymptoms: physical,
            emotionalSymptoms: emotional
        });
    }
    withTriggers(triggers) {
        return this.create({ triggers });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.StressManagementSessionTestFactory = StressManagementSessionTestFactory;
