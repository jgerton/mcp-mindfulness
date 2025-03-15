"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeditationService = void 0;
const meditation_model_1 = require("../models/meditation.model");
class MeditationService {
    static getAllMeditations() {
        return __awaiter(this, void 0, void 0, function* () {
            return meditation_model_1.Meditation.find({ isActive: true });
        });
    }
    static getMeditationById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return meditation_model_1.Meditation.findById(id);
        });
    }
    static createMeditation(meditationData) {
        return __awaiter(this, void 0, void 0, function* () {
            const meditation = new meditation_model_1.Meditation(meditationData);
            return meditation.save();
        });
    }
    static updateMeditation(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return meditation_model_1.Meditation.findByIdAndUpdate(id, updateData, { new: true });
        });
    }
    static deleteMeditation(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return meditation_model_1.Meditation.findByIdAndDelete(id);
        });
    }
}
exports.MeditationService = MeditationService;
