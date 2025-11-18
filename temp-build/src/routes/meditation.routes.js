"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const meditation_controller_1 = require("../controllers/meditation.controller");
const router = express_1.default.Router();
// Get all meditations
router.get('/', (req, res) => {
    meditation_controller_1.MeditationController.getAllMeditations(req, res);
});
// Get meditation by ID
router.get('/:id', (req, res) => {
    meditation_controller_1.MeditationController.getMeditationById(req, res);
});
// Create new meditation
router.post('/', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.createMeditation(req, res);
});
// Update meditation
router.put('/:id', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.updateMeditation(req, res);
});
// Delete meditation
router.delete('/:id', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.deleteMeditation(req, res);
});
// Start meditation session
router.post('/:id/start', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.startSession(req, res);
});
// Complete meditation session
router.post('/:id/complete', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.completeSession(req, res);
});
// Get active session
router.get('/session/active', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.getActiveSession(req, res);
});
// Record interruption
router.post('/session/:id/interrupt', auth_middleware_1.authenticateToken, (req, res) => {
    meditation_controller_1.MeditationController.recordInterruption(req, res);
});
exports.default = router;
