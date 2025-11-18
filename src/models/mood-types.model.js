"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moodValues = exports.MoodTypes = void 0;
var MoodTypes;
(function (MoodTypes) {
    MoodTypes["VERY_NEGATIVE"] = "VERY_NEGATIVE";
    MoodTypes["NEGATIVE"] = "NEGATIVE";
    MoodTypes["NEUTRAL"] = "NEUTRAL";
    MoodTypes["POSITIVE"] = "POSITIVE";
    MoodTypes["VERY_POSITIVE"] = "VERY_POSITIVE";
    MoodTypes["ANXIOUS"] = "ANXIOUS";
    MoodTypes["STRESSED"] = "STRESSED";
    MoodTypes["CALM"] = "CALM";
    MoodTypes["PEACEFUL"] = "PEACEFUL";
})(MoodTypes || (exports.MoodTypes = MoodTypes = {}));
exports.moodValues = {
    [MoodTypes.VERY_NEGATIVE]: 1,
    [MoodTypes.NEGATIVE]: 2,
    [MoodTypes.NEUTRAL]: 3,
    [MoodTypes.POSITIVE]: 4,
    [MoodTypes.VERY_POSITIVE]: 5,
    [MoodTypes.ANXIOUS]: 2,
    [MoodTypes.STRESSED]: 1,
    [MoodTypes.CALM]: 4,
    [MoodTypes.PEACEFUL]: 5
};
