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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeditationController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const meditation_service_1 = require("../services/meditation.service");
const meditation_validation_1 = require("../validations/meditation.validation");
/**
 * Example controller demonstrating best practices for error handling
 *
 * This controller follows the standards established in our testing and coding standards:
 * 1. Consistent error response format using { error: message }
 * 2. Proper HTTP status codes for different error scenarios
 * 3. MongoDB ObjectId validation
 * 4. Authorization checks for resource ownership
 * 5. Try/catch blocks for async operations
 */
class MeditationController {
    constructor() {
        /**
         * Get a meditation by ID
         *
         * @param req Express request object
         * @param res Express response object
         */
        this.getMeditationById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Validate ObjectId format
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid meditation ID format' });
                    return;
                }
                const meditation = yield this.meditationService.getMeditationById(id);
                // Handle not found
                if (!meditation) {
                    res.status(404).json({ error: 'Meditation not found' });
                    return;
                }
                res.status(200).json(meditation);
            }
            catch (error) {
                console.error('Error in getMeditationById:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        /**
         * Create a new meditation
         *
         * @param req Express request object
         * @param res Express response object
         */
        this.createMeditation = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                // Validate input
                const { error, value } = (0, meditation_validation_1.validateMeditationInput)(req.body);
                if (error) {
                    res.status(400).json({ error: error.details[0].message });
                    return;
                }
                const meditation = yield this.meditationService.createMeditation(Object.assign(Object.assign({}, value), { createdBy: userId }));
                res.status(201).json(meditation);
            }
            catch (error) {
                console.error('Error in createMeditation:', error);
                // Handle duplicate key error
                if (error instanceof mongoose_1.default.Error.ValidationError) {
                    res.status(400).json({ error: error.message });
                    return;
                }
                // Handle other MongoDB errors
                if (error.code === 11000) { // Duplicate key error
                    res.status(409).json({ error: 'A meditation with this title already exists' });
                    return;
                }
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        /**
         * Update a meditation
         *
         * @param req Express request object
         * @param res Express response object
         */
        this.updateMeditation = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                // Validate ObjectId format
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid meditation ID format' });
                    return;
                }
                // Check if meditation exists
                const existingMeditation = yield this.meditationService.getMeditationById(id);
                if (!existingMeditation) {
                    res.status(404).json({ error: 'Meditation not found' });
                    return;
                }
                // Authorization check - ensure user owns the resource
                if (existingMeditation.createdBy.toString() !== userId.toString()) {
                    res.status(403).json({ error: 'You are not authorized to update this meditation' });
                    return;
                }
                // Validate input
                const { error, value } = (0, meditation_validation_1.validateMeditationInput)(req.body);
                if (error) {
                    res.status(400).json({ error: error.details[0].message });
                    return;
                }
                const updatedMeditation = yield this.meditationService.updateMeditation(id, value);
                res.status(200).json(updatedMeditation);
            }
            catch (error) {
                console.error('Error in updateMeditation:', error);
                // Handle validation errors
                if (error instanceof mongoose_1.default.Error.ValidationError) {
                    res.status(400).json({ error: error.message });
                    return;
                }
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        /**
         * Delete a meditation
         *
         * @param req Express request object
         * @param res Express response object
         */
        this.deleteMeditation = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                // Validate ObjectId format
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    res.status(400).json({ error: 'Invalid meditation ID format' });
                    return;
                }
                // Check if meditation exists
                const existingMeditation = yield this.meditationService.getMeditationById(id);
                if (!existingMeditation) {
                    res.status(404).json({ error: 'Meditation not found' });
                    return;
                }
                // Authorization check - ensure user owns the resource
                if (existingMeditation.createdBy.toString() !== userId.toString()) {
                    res.status(403).json({ error: 'You are not authorized to delete this meditation' });
                    return;
                }
                yield this.meditationService.deleteMeditation(id);
                res.status(204).send();
            }
            catch (error) {
                console.error('Error in deleteMeditation:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        /**
         * Get meditations by user
         *
         * @param req Express request object
         * @param res Express response object
         */
        this.getMeditationsByUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                // Validate pagination parameters
                if (page < 1 || limit < 1 || limit > 100) {
                    res.status(400).json({ error: 'Invalid pagination parameters' });
                    return;
                }
                const { meditations, total } = yield this.meditationService.getMeditationsByUser(userId.toString(), page, limit);
                res.status(200).json({
                    meditations,
                    pagination: {
                        total,
                        page,
                        limit,
                        pages: Math.ceil(total / limit)
                    }
                });
            }
            catch (error) {
                console.error('Error in getMeditationsByUser:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        this.meditationService = new meditation_service_1.MeditationService();
    }
}
exports.MeditationController = MeditationController;
