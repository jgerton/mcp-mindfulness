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
const supertest_1 = __importDefault(require("supertest"));
const achievement_controller_1 = require("../../controllers/achievement.controller");
const server_1 = require("../../utils/server");
const error_codes_1 = require("../../utils/error-codes");
jest.mock('../../controllers/achievement.controller');
describe('Achievement Routes', () => {
    let app;
    let authToken;
    const mockAchievement = {
        _id: 'achievement123',
        name: 'Meditation Master',
        description: 'Complete 100 meditation sessions',
        category: 'milestone',
        criteria: {
            type: 'sessions_completed',
            value: 100
        },
        icon: 'meditation_master.png',
        points: 500,
        progress: 75,
        target: 100,
        completed: false,
        completedAt: null
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        app = yield (0, server_1.createServer)();
        authToken = 'valid.jwt.token';
    }));
    beforeEach(() => {
        jest.clearAllMocks();
        achievement_controller_1.AchievementController.prototype.getUserAchievements = jest.fn();
        achievement_controller_1.AchievementController.prototype.getAchievementById = jest.fn();
    });
    describe('GET /', () => {
        it('should get user achievements successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            achievement_controller_1.AchievementController.prototype.getUserAchievements.mockImplementation((req, res) => {
                res.status(200).json([mockAchievement]);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/achievements')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body[0]).toEqual(mockAchievement);
        }));
        it('should handle empty achievements list', () => __awaiter(void 0, void 0, void 0, function* () {
            achievement_controller_1.AchievementController.prototype.getUserAchievements.mockImplementation((req, res) => {
                res.status(200).json([]);
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/achievements')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/achievements');
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
        it('should handle server errors', () => __awaiter(void 0, void 0, void 0, function* () {
            achievement_controller_1.AchievementController.prototype.getUserAchievements.mockImplementation((req, res) => {
                res.status(500).json({
                    error: {
                        code: error_codes_1.ErrorCodes.SERVER_ERROR,
                        message: 'Internal server error'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/achievements')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(500);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.SERVER_ERROR);
        }));
    });
    describe('GET /:id', () => {
        it('should get achievement by id successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            achievement_controller_1.AchievementController.prototype.getAchievementById.mockImplementation((req, res) => {
                res.status(200).json(mockAchievement);
            });
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/achievements/${mockAchievement._id}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockAchievement);
        }));
        it('should return 404 for non-existent achievement', () => __awaiter(void 0, void 0, void 0, function* () {
            achievement_controller_1.AchievementController.prototype.getAchievementById.mockImplementation((req, res) => {
                res.status(404).json({
                    error: {
                        code: error_codes_1.ErrorCodes.NOT_FOUND,
                        message: 'Achievement not found'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/achievements/nonexistent')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.NOT_FOUND);
        }));
        it('should validate achievement ID format', () => __awaiter(void 0, void 0, void 0, function* () {
            achievement_controller_1.AchievementController.prototype.getAchievementById.mockImplementation((req, res) => {
                res.status(400).json({
                    error: {
                        code: error_codes_1.ErrorCodes.VALIDATION_ERROR,
                        message: 'Invalid achievement ID format'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/achievements/invalid-id-format')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(400);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.VALIDATION_ERROR);
        }));
        it('should require authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/achievements/${mockAchievement._id}`);
            expect(response.status).toBe(401);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.AUTHENTICATION_ERROR);
        }));
        it('should handle server errors', () => __awaiter(void 0, void 0, void 0, function* () {
            achievement_controller_1.AchievementController.prototype.getAchievementById.mockImplementation((req, res) => {
                res.status(500).json({
                    error: {
                        code: error_codes_1.ErrorCodes.SERVER_ERROR,
                        message: 'Internal server error'
                    }
                });
            });
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/achievements/${mockAchievement._id}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(500);
            expect(response.body.error.code).toBe(error_codes_1.ErrorCodes.SERVER_ERROR);
        }));
    });
    describe('GET /api/achievements', () => {
        it('should get user achievements successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockAchievements = [
                {
                    id: 'ach1',
                    title: 'Meditation Master',
                    description: 'Complete 10 meditation sessions',
                    type: 'meditation',
                    progress: 8,
                    target: 10,
                    status: 'in_progress',
                    rewards: {
                        points: 100,
                        badge: 'meditation_master_bronze'
                    }
                },
                {
                    id: 'ach2',
                    title: 'Stress Buster',
                    description: 'Complete 5 stress management sessions',
                    type: 'stress_management',
                    progress: 5,
                    target: 5,
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                    rewards: {
                        points: 50,
                        badge: 'stress_buster_silver'
                    }
                }
            ];
            achievement_controller_1.AchievementController.prototype.getUserAchievements
                .mockResolvedValue(mockAchievements);
            const response = yield (0, supertest_1.default)(app)
                .get('/api/achievements')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockAchievements);
        }));
        it('should handle achievement type filter', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/achievements')
                .query({ type: 'meditation' })
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(achievement_controller_1.AchievementController.prototype.getUserAchievements)
                .toHaveBeenCalledWith(expect.any(Object), { type: 'meditation' });
        }));
        it('should handle status filter', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/achievements')
                .query({ status: 'completed' })
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(achievement_controller_1.AchievementController.prototype.getUserAchievements)
                .toHaveBeenCalledWith(expect.any(Object), { status: 'completed' });
        }));
    });
    describe('GET /api/achievements/progress', () => {
        it('should get achievement progress successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockProgress = {
                totalAchievements: 10,
                completedAchievements: 5,
                inProgressAchievements: 3,
                lockedAchievements: 2,
                recentProgress: [
                    {
                        achievementId: 'ach1',
                        title: 'Meditation Master',
                        progressDelta: 2,
                        timestamp: new Date().toISOString()
                    }
                ]
            };
            achievement_controller_1.AchievementController.prototype.getAchievementProgress
                .mockResolvedValue(mockProgress);
            const response = yield (0, supertest_1.default)(app)
                .get('/api/achievements/progress')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockProgress);
        }));
    });
    describe('GET /api/achievements/leaderboard', () => {
        it('should get achievement leaderboard successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockLeaderboard = [
                {
                    userId: 'user1',
                    username: 'JohnDoe',
                    totalAchievements: 15,
                    points: 1500,
                    rank: 1
                },
                {
                    userId: 'user2',
                    username: 'JaneSmith',
                    totalAchievements: 12,
                    points: 1200,
                    rank: 2
                }
            ];
            achievement_controller_1.AchievementController.prototype.getLeaderboard
                .mockResolvedValue(mockLeaderboard);
            const response = yield (0, supertest_1.default)(app)
                .get('/api/achievements/leaderboard')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockLeaderboard);
        }));
        it('should handle time period filter', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get('/api/achievements/leaderboard')
                .query({ period: 'weekly' })
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(achievement_controller_1.AchievementController.prototype.getLeaderboard)
                .toHaveBeenCalledWith(expect.any(Object), { period: 'weekly' });
        }));
    });
    describe('GET /api/achievements/badges', () => {
        it('should get user badges successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockBadges = [
                {
                    id: 'badge1',
                    name: 'Meditation Master Bronze',
                    image: 'meditation_master_bronze.png',
                    achievementId: 'ach1',
                    unlockedAt: new Date().toISOString()
                },
                {
                    id: 'badge2',
                    name: 'Stress Buster Silver',
                    image: 'stress_buster_silver.png',
                    achievementId: 'ach2',
                    unlockedAt: new Date().toISOString()
                }
            ];
            achievement_controller_1.AchievementController.prototype.getUserBadges
                .mockResolvedValue(mockBadges);
            const response = yield (0, supertest_1.default)(app)
                .get('/api/achievements/badges')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockBadges);
        }));
    });
    describe('POST /api/achievements/:id/claim-reward', () => {
        it('should claim achievement reward successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockRewardClaim = {
                achievementId: 'ach1',
                rewards: {
                    points: 100,
                    badge: 'meditation_master_bronze'
                },
                claimedAt: new Date().toISOString()
            };
            achievement_controller_1.AchievementController.prototype.claimAchievementReward
                .mockResolvedValue(mockRewardClaim);
            const response = yield (0, supertest_1.default)(app)
                .post('/api/achievements/ach1/claim-reward')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockRewardClaim);
        }));
        it('should return 400 for uncompleted achievement', () => __awaiter(void 0, void 0, void 0, function* () {
            achievement_controller_1.AchievementController.prototype.claimAchievementReward
                .mockRejectedValue({ status: 400, message: 'Achievement not completed' });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/achievements/ach1/claim-reward')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Achievement not completed');
        }));
        it('should return 400 for already claimed reward', () => __awaiter(void 0, void 0, void 0, function* () {
            achievement_controller_1.AchievementController.prototype.claimAchievementReward
                .mockRejectedValue({ status: 400, message: 'Reward already claimed' });
            const response = yield (0, supertest_1.default)(app)
                .post('/api/achievements/ach1/claim-reward')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Reward already claimed');
        }));
    });
});
