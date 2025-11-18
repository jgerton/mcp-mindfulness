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
// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
// Mock user ID for testing
const testUserId = '507f1f77bcf86cd799439011';
const testUsername = 'test-user';
// Mock the auth middleware
jest.mock('../../middleware/auth.middleware', () => ({
    authenticateToken: jest.fn((req, res, next) => {
        req.user = { _id: testUserId, username: 'test-user' };
        next();
    }),
    authenticateUser: jest.fn((req, res, next) => {
        req.user = { _id: testUserId, username: 'test-user' };
        next();
    })
}));
// Mock the validation middleware
jest.mock('../../middleware/validation.middleware', () => ({
    validateRequest: jest.fn(() => (req, res, next) => {
        next();
    }),
    validateAssessment: jest.fn((req, res, next) => {
        next();
    }),
    validatePreferences: jest.fn((req, res, next) => {
        next();
    })
}));
// Mock the stress management controller
jest.mock('../../controllers/stress-management.controller', () => ({
    StressManagementController: {
        submitAssessment: jest.fn((req, res) => {
            res.status(201).json({ message: 'Assessment submitted' });
        }),
        getStressHistory: jest.fn((req, res) => {
            res.status(200).json({ history: [] });
        }),
        getLatestAssessment: jest.fn((req, res) => {
            res.status(200).json({ assessment: null });
        }),
        updatePreferences: jest.fn((req, res) => {
            res.status(200).json({ preferences: null });
        }),
        getPreferences: jest.fn((req, res) => {
            res.status(200).json({ preferences: null });
        }),
        getStressInsights: jest.fn((req, res) => {
            res.status(200).json({ insights: null });
        })
    }
}));
// Mock the meditation controller
jest.mock('../../controllers/meditation.controller', () => ({
    MeditationController: {
        getAllMeditations: jest.fn((req, res) => {
            res.status(200).json({ meditations: [] });
        }),
        getMeditationById: jest.fn((req, res) => {
            res.status(200).json({ meditation: null });
        }),
        createMeditation: jest.fn((req, res) => {
            res.status(201).json({ meditation: null });
        }),
        updateMeditation: jest.fn((req, res) => {
            res.status(200).json({ meditation: null });
        }),
        deleteMeditation: jest.fn((req, res) => {
            res.status(200).json({ message: 'Deleted' });
        })
    }
}));
// Mock the user controller
jest.mock('../../controllers/user.controller', () => ({
    UserController: {
        register: jest.fn((req, res) => {
            res.status(201).json({ user: null });
        }),
        login: jest.fn((req, res) => {
            res.status(200).json({ token: 'mock-token' });
        }),
        getProfile: jest.fn((req, res) => {
            res.status(200).json({ user: null });
        }),
        updateProfile: jest.fn((req, res) => {
            res.status(200).json({ user: null });
        })
    }
}));
// Mock the auth controller
jest.mock('../../controllers/auth.controller', () => ({
    AuthController: {
        login: jest.fn((req, res) => {
            res.status(200).json({ token: 'mock-token' });
        }),
        register: jest.fn((req, res) => {
            res.status(201).json({ user: null });
        }),
        refreshToken: jest.fn((req, res) => {
            res.status(200).json({ token: 'mock-token' });
        })
    }
}));
// Mock the breathing controller
jest.mock('../../controllers/breathing.controller', () => ({
    BreathingController: {
        getExercises: jest.fn((req, res) => {
            res.status(200).json({ exercises: [] });
        }),
        getExerciseById: jest.fn((req, res) => {
            res.status(200).json({ exercise: null });
        }),
        createExercise: jest.fn((req, res) => {
            res.status(201).json({ exercise: null });
        }),
        updateExercise: jest.fn((req, res) => {
            res.status(200).json({ exercise: null });
        }),
        deleteExercise: jest.fn((req, res) => {
            res.status(200).json({ message: 'Deleted' });
        }),
        getPatterns: jest.fn((req, res) => {
            res.status(200).json({ patterns: [] });
        }),
        startSession: jest.fn((req, res) => {
            res.status(201).json({ session: null });
        }),
        completeSession: jest.fn((req, res) => {
            res.status(200).json({ session: null });
        }),
        getUserSessions: jest.fn((req, res) => {
            res.status(200).json({ sessions: [] });
        }),
        getEffectiveness: jest.fn((req, res) => {
            res.status(200).json({ effectiveness: null });
        })
    }
}));
// Mock the PMR controller
jest.mock('../../controllers/pmr.controller', () => ({
    PMRController: {
        getExercises: jest.fn((req, res) => {
            res.status(200).json({ exercises: [] });
        }),
        getExerciseById: jest.fn((req, res) => {
            res.status(200).json({ exercise: null });
        }),
        createExercise: jest.fn((req, res) => {
            res.status(201).json({ exercise: null });
        }),
        updateExercise: jest.fn((req, res) => {
            res.status(200).json({ exercise: null });
        }),
        deleteExercise: jest.fn((req, res) => {
            res.status(200).json({ message: 'Deleted' });
        }),
        getMuscleGroups: jest.fn((req, res) => {
            res.status(200).json({ muscleGroups: [] });
        }),
        startSession: jest.fn((req, res) => {
            res.status(201).json({ session: null });
        }),
        completeSession: jest.fn((req, res) => {
            res.status(200).json({ session: null });
        }),
        updateProgress: jest.fn((req, res) => {
            res.status(200).json({ session: null });
        }),
        getUserSessions: jest.fn((req, res) => {
            res.status(200).json({ sessions: [] });
        }),
        getEffectiveness: jest.fn((req, res) => {
            res.status(200).json({ effectiveness: null });
        })
    }
}));
// Mock the achievement controller as a class
jest.mock('../../controllers/achievement.controller', () => {
    const mockController = {
        getAllAchievements: jest.fn((req, res) => __awaiter(void 0, void 0, void 0, function* () {
            res.status(200).json({ achievements: [] });
        })),
        getUserAchievements: jest.fn((req, res) => __awaiter(void 0, void 0, void 0, function* () {
            res.status(200).json({ achievements: [] });
        })),
        createAchievement: jest.fn((req, res) => __awaiter(void 0, void 0, void 0, function* () {
            res.status(201).json({ achievement: null });
        })),
        updateAchievement: jest.fn((req, res) => __awaiter(void 0, void 0, void 0, function* () {
            res.status(200).json({ achievement: null });
        })),
        deleteAchievement: jest.fn((req, res) => __awaiter(void 0, void 0, void 0, function* () {
            res.status(200).json({ message: 'Deleted' });
        }))
    };
    return {
        AchievementController: jest.fn().mockImplementation(() => mockController)
    };
});
// Mock the chat controller
jest.mock('../../controllers/chat.controller', () => ({
    ChatController: {
        getMessages: jest.fn((req, res) => {
            res.status(200).json({ messages: [] });
        }),
        sendMessage: jest.fn((req, res) => {
            res.status(201).json({ message: null });
        })
    }
}));
// Mock the friend controller
jest.mock('../../controllers/friend.controller', () => ({
    FriendController: {
        getFriends: jest.fn((req, res) => {
            res.status(200).json({ friends: [] });
        }),
        sendFriendRequest: jest.fn((req, res) => {
            res.status(201).json({ request: null });
        }),
        acceptFriendRequest: jest.fn((req, res) => {
            res.status(200).json({ friend: null });
        }),
        rejectFriendRequest: jest.fn((req, res) => {
            res.status(200).json({ message: 'Rejected' });
        }),
        removeFriend: jest.fn((req, res) => {
            res.status(200).json({ message: 'Removed' });
        })
    }
}));
// Mock the group session controller
jest.mock('../../controllers/group-session.controller', () => ({
    GroupSessionController: {
        getSessions: jest.fn((req, res) => {
            res.status(200).json({ sessions: [] });
        }),
        getSessionById: jest.fn((req, res) => {
            res.status(200).json({ session: null });
        }),
        createSession: jest.fn((req, res) => {
            res.status(201).json({ session: null });
        }),
        joinSession: jest.fn((req, res) => {
            res.status(200).json({ session: null });
        }),
        leaveSession: jest.fn((req, res) => {
            res.status(200).json({ message: 'Left session' });
        })
    }
}));
// Mock the cache stats controller
jest.mock('../../controllers/cache-stats.controller', () => ({
    CacheStatsController: {
        getCurrentStats: jest.fn((req, res) => {
            res.status(200).json({ stats: null });
        }),
        getHistoricalStats: jest.fn((req, res) => {
            res.status(200).json({ stats: null });
        }),
        getCategoryStats: jest.fn((req, res) => {
            res.status(200).json({ stats: null });
        }),
        getHitRates: jest.fn((req, res) => {
            res.status(200).json({ stats: null });
        }),
        getCategoryDetails: jest.fn((req, res) => {
            res.status(200).json({ stats: null });
        }),
        exportStats: jest.fn((req, res) => {
            res.status(200).json({ stats: null });
        }),
        getCacheStats: jest.fn((req, res) => {
            res.status(200).json({ stats: null });
        }),
        clearCache: jest.fn((req, res) => {
            res.status(200).json({ message: 'Cache cleared' });
        })
    }
}));
// Mock the entire meditation session controller
jest.mock('../../controllers/meditation-session.controller', () => {
    return {
        MeditationSessionController: jest.fn().mockImplementation(() => {
            return {
                getUserSessions: jest.fn((req, res) => {
                    res.status(200).json({
                        sessions: [],
                        pagination: {
                            total: 0,
                            page: 1,
                            limit: 10,
                            pages: 0
                        }
                    });
                }),
                getSessionById: jest.fn((req, res) => {
                    res.status(200).json({
                        _id: '507f1f77bcf86cd799439012',
                        userId: testUserId,
                        title: 'Test Session',
                        duration: 15,
                        completed: false
                    });
                }),
                createSession: jest.fn((req, res) => {
                    res.status(201).json({
                        _id: '507f1f77bcf86cd799439012',
                        userId: testUserId,
                        title: req.body.title || 'Test Session',
                        duration: req.body.duration || 15,
                        completed: false
                    });
                }),
                updateSession: jest.fn((req, res) => {
                    res.status(200).json({
                        _id: '507f1f77bcf86cd799439012',
                        userId: testUserId,
                        title: 'Updated Session',
                        duration: 20,
                        completed: false
                    });
                }),
                completeSession: jest.fn((req, res) => {
                    res.status(200).json({
                        _id: '507f1f77bcf86cd799439012',
                        userId: testUserId,
                        title: 'Test Session',
                        duration: 15,
                        completed: true,
                        endTime: new Date()
                    });
                }),
                getUserStats: jest.fn((req, res) => {
                    res.status(200).json({
                        totalSessions: 0,
                        totalTime: 0,
                        totalTimeFormatted: '0h 0m',
                        sessionsByType: []
                    });
                }),
                deleteSession: jest.fn((req, res) => {
                    res.status(200).json({ message: 'Meditation session deleted successfully' });
                })
            };
        })
    };
});
describe('Meditation Session API with Mocked Validation', () => {
    let authToken;
    beforeAll(() => {
        // Create auth token for testing
        authToken = jsonwebtoken_1.default.sign({ _id: testUserId, username: testUsername }, config_1.default.jwtSecret, { expiresIn: '1h' });
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, app_1.closeServer)();
    }));
    it('should get meditation sessions', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app_1.app)
            .get('/api/meditation-sessions')
            .set('Authorization', `Bearer ${authToken}`)
            .timeout(5000);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('sessions');
        expect(response.body).toHaveProperty('pagination');
    }));
    it('should create a meditation session', () => __awaiter(void 0, void 0, void 0, function* () {
        const sessionData = {
            title: 'New Session',
            duration: 15,
            type: 'unguided'
        };
        const response = yield (0, supertest_1.default)(app_1.app)
            .post('/api/meditation-sessions')
            .set('Authorization', `Bearer ${authToken}`)
            .send(sessionData)
            .timeout(5000);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.userId).toBe(testUserId);
    }));
});
