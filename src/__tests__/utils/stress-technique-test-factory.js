"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StressTechniqueTestFactory = void 0;
const mock_factories_1 = require("./mock-factories");
const mongoose_1 = require("mongoose");
class StressTechniqueTestFactory extends mock_factories_1.BaseTestDataFactory {
    defaultData() {
        return {
            _id: new mongoose_1.Types.ObjectId().toString(),
            name: 'Test Technique',
            description: 'Test technique description',
            duration: 300, // 5 minutes in seconds
            type: 'BREATHING',
            difficulty: 'BEGINNER',
            instructions: ['Step 1', 'Step 2', 'Step 3'],
            benefits: ['Reduces stress', 'Improves focus'],
            category: 'MEDITATION',
            imageUrl: 'https://example.com/technique.jpg',
            audioUrl: 'https://example.com/technique.mp3',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    withDifficulty(difficulty) {
        return this.create({ overrides: { difficulty } });
    }
    withType(type) {
        return this.create({ overrides: { type } });
    }
    withDuration(minutes) {
        return this.create({ overrides: { duration: minutes * 60 } });
    }
    withoutAudio() {
        const technique = this.create();
        const { audioUrl } = technique, techniqueWithoutAudio = __rest(technique, ["audioUrl"]);
        return techniqueWithoutAudio;
    }
}
exports.StressTechniqueTestFactory = StressTechniqueTestFactory;
