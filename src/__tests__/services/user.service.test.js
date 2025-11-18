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
const mongoose_1 = __importDefault(require("mongoose"));
const user_service_1 = require("../../services/user.service");
const user_model_1 = require("../../models/user.model");
const db_handler_1 = require("../test-utils/db-handler");
const user_model_2 = require("../../models/user.model");
const user_preferences_model_1 = require("../../models/user-preferences.model");
// Mock console.error to avoid cluttering test output
jest.spyOn(console, 'error').mockImplementation(() => { });
jest.mock('../../models/user.model');
/**
 * @group service
 * @group user
 */
describe('UserService', () => {
    let testUser;
    const testUserId = new mongoose_1.default.Types.ObjectId();
    const mockUserId = '507f1f77bcf86cd799439011';
    const mockUser = {
        _id: mockUserId,
        username: 'testuser',
        email: 'test@example.com',
        preferences: {
            techniques: ['breathing', 'meditation'],
            duration: 15,
            time: 'evening',
            notificationFrequency: 'daily'
        }
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_handler_1.dbHandler.connect();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.clearAllMocks();
        yield db_handler_1.dbHandler.clearDatabase();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db_handler_1.dbHandler.closeDatabase();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        testUser = yield user_model_1.User.create({
            _id: testUserId,
            email: 'test@example.com',
            name: 'Test User',
            preferences: {
                techniques: ['meditation', 'breathing'],
                duration: 15,
                time: 'morning',
                notificationFrequency: 'daily'
            }
        });
        jest.spyOn(user_model_2.UserModel, 'findById').mockResolvedValue(testUser);
        jest.spyOn(user_preferences_model_1.UserPreferencesModel, 'findOne').mockResolvedValue(testUser.preferences);
    }));
    describe('Success Cases', () => {
        it('should get user by ID', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield user_service_1.UserService.getUserById(testUserId.toString());
            expect(result).toBeDefined();
            expect(result).toEqual(testUser);
        }));
        it('should get user preferences', () => __awaiter(void 0, void 0, void 0, function* () {
            const preferences = yield user_service_1.UserService.getUserPreferences(testUserId.toString());
            expect(preferences).toBeDefined();
            expect(preferences).toEqual({
                userId: testUserId.toString(),
                preferredTechniques: ['meditation', 'breathing'],
                preferredDuration: 15,
                preferredTime: 'morning',
                notificationFrequency: 'daily'
            });
        }));
    });
    describe('Error Cases', () => {
        it('should throw error for invalid user ID format', () => {
            expect(() => mongoose_1.default.Types.ObjectId('invalid-id')).toThrow();
        });
        it('should reject for undefined user ID', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(user_service_1.UserService.getUserById(undefined)).rejects.toThrow();
        }));
        it('should reject for invalid preferences update', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(user_service_1.UserService.updateUserPreferences('invalid-id', null)).rejects.toThrow();
        }));
    });
    describe('Edge Cases', () => {
        it('should throw error for empty user ID', () => {
            expect(() => mongoose_1.default.Types.ObjectId('')).toThrow();
        });
        it('should handle non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(user_model_2.UserModel, 'findById').mockResolvedValue(null);
            const result = yield user_service_1.UserService.getUserById(new mongoose_1.default.Types.ObjectId().toString());
            expect(result).toBeNull();
        }));
        it('should handle empty preferences update', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(user_model_2.UserModel, 'findByIdAndUpdate').mockResolvedValue(testUser);
            const result = yield user_service_1.UserService.updateUserPreferences(testUserId.toString(), {});
            expect(result.preferences).toEqual(testUser.preferences);
        }));
    });
    describe('getUserPreferences', () => {
        describe('Success Cases', () => {
            /**
             * @test-type success
             */
            it('should return user preferences when user exists', () => __awaiter(void 0, void 0, void 0, function* () {
                const preferences = yield user_service_1.UserService.getUserPreferences(testUserId.toString());
                expect(preferences).toBeDefined();
                expect(preferences).toEqual({
                    userId: testUserId.toString(),
                    preferredTechniques: ['meditation', 'breathing'],
                    preferredDuration: 15,
                    preferredTime: 'morning',
                    notificationFrequency: 'daily'
                });
            }));
            it('should return user preferences', () => __awaiter(void 0, void 0, void 0, function* () {
                const mockPreferences = { theme: 'dark', notifications: true };
                jest.spyOn(user_preferences_model_1.UserPreferencesModel, 'findOne').mockResolvedValue(mockPreferences);
                const userId = new mongoose_1.default.Types.ObjectId().toString();
                const result = yield user_service_1.UserService.getUserPreferences(userId);
                expect(result).toEqual(mockPreferences);
            }));
        });
        describe('Error Cases', () => {
            /**
             * @test-type error
             */
            it('should return null for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
                const nonExistentId = new mongoose_1.default.Types.ObjectId();
                const preferences = yield user_service_1.UserService.getUserPreferences(nonExistentId.toString());
                expect(preferences).toBeNull();
                expect(console.error).not.toHaveBeenCalled();
            }));
            /**
             * @test-type error
             */
            it('should throw error for invalid user ID format', () => {
                expect(() => user_service_1.UserService.getUserPreferences('invalid-id')).toThrow();
            });
        });
        describe('Edge Cases', () => {
            /**
             * @test-type edge
             */
            it('should return default preferences for new user', () => __awaiter(void 0, void 0, void 0, function* () {
                jest.spyOn(user_preferences_model_1.UserPreferencesModel, 'findOne').mockResolvedValue(null);
                const userId = new mongoose_1.default.Types.ObjectId().toString();
                const result = yield user_service_1.UserService.getUserPreferences(userId);
                expect(result).toEqual({ theme: 'light', notifications: true });
            }));
            /**
             * @test-type edge
             */
            it('should return default values for user without preferences', () => __awaiter(void 0, void 0, void 0, function* () {
                yield user_model_1.User.findByIdAndUpdate(testUserId, { $unset: { preferences: 1 } });
                const preferences = yield user_service_1.UserService.getUserPreferences(testUserId.toString());
                expect(preferences).toEqual({
                    userId: testUserId.toString(),
                    preferredTechniques: [],
                    preferredDuration: 10,
                    preferredTime: 'morning',
                    notificationFrequency: 'daily'
                });
            }));
            /**
             * @test-type edge
             */
            it('should handle null preferences fields', () => __awaiter(void 0, void 0, void 0, function* () {
                yield user_model_1.User.findByIdAndUpdate(testUserId, {
                    preferences: {
                        techniques: null,
                        duration: null,
                        time: null,
                        notificationFrequency: null
                    }
                });
                const preferences = yield user_service_1.UserService.getUserPreferences(testUserId.toString());
                expect(preferences).toEqual({
                    userId: testUserId.toString(),
                    preferredTechniques: [],
                    preferredDuration: 10,
                    preferredTime: 'morning',
                    notificationFrequency: 'daily'
                });
            }));
        });
    });
    describe('updateUserPreferences', () => {
        describe('Success Cases', () => {
            /**
             * @test-type success
             */
            it('should update specific preference fields', () => __awaiter(void 0, void 0, void 0, function* () {
                const updates = {
                    preferredDuration: 20,
                    notificationFrequency: 'weekly'
                };
                const updatedUser = yield user_service_1.UserService.updateUserPreferences(testUserId.toString(), updates);
                expect(updatedUser.preferences.duration).toBe(20);
                expect(updatedUser.preferences.notificationFrequency).toBe('weekly');
                // Verify other fields remain unchanged
                expect(updatedUser.preferences.techniques).toEqual(['meditation', 'breathing']);
                expect(updatedUser.preferences.time).toBe('morning');
            }));
            it('should update user preferences', () => __awaiter(void 0, void 0, void 0, function* () {
                const mockPreferences = { theme: 'dark', notifications: false };
                jest.spyOn(user_preferences_model_1.UserPreferencesModel, 'findOneAndUpdate').mockResolvedValue(mockPreferences);
                const userId = new mongoose_1.default.Types.ObjectId().toString();
                const result = yield user_service_1.UserService.updateUserPreferences(userId, mockPreferences);
                expect(result).toEqual(mockPreferences);
            }));
        });
        describe('Error Cases', () => {
            /**
             * @test-type error
             */
            it('should return null for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
                const nonExistentId = new mongoose_1.default.Types.ObjectId();
                const updates = {
                    preferredDuration: 20
                };
                const updatedUser = yield user_service_1.UserService.updateUserPreferences(nonExistentId.toString(), updates);
                expect(updatedUser).toBeNull();
                expect(console.error).not.toHaveBeenCalled();
            }));
            /**
             * @test-type error
             */
            it('should throw error for invalid user ID format', () => {
                expect(() => user_service_1.UserService.updateUserPreferences('invalid-id', { preferredDuration: 20 })).toThrow();
            });
            it('should throw error for invalid preferences', () => {
                expect(() => user_service_1.UserService.updateUserPreferences('user-id', null)).toThrow();
            });
        });
        describe('Edge Cases', () => {
            /**
             * @test-type edge
             */
            it('should handle empty update object', () => __awaiter(void 0, void 0, void 0, function* () {
                const updatedUser = yield user_service_1.UserService.updateUserPreferences(testUserId.toString(), {});
                expect(updatedUser.preferences).toEqual(testUser.preferences);
            }));
            /**
             * @test-type edge
             */
            it('should handle invalid preference values', () => __awaiter(void 0, void 0, void 0, function* () {
                const updates = {
                    preferredDuration: -1, // Invalid duration
                    notificationFrequency: 'invalid' // Invalid frequency
                };
                const updatedUser = yield user_service_1.UserService.updateUserPreferences(testUserId.toString(), updates);
                expect(updatedUser.preferences.duration).toBe(-1); // Service doesn't validate values
                expect(updatedUser.preferences.notificationFrequency).toBe('invalid');
            }));
            /**
             * @test-type edge
             */
            it('should handle undefined user ID', () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    yield user_service_1.UserService.updateUserPreferences(undefined, { preferredDuration: 20 });
                    fail('Expected error to be thrown');
                }
                catch (error) {
                    expect(error).toBeDefined();
                    expect(console.error).toHaveBeenCalled();
                }
            }));
            it('should create preferences if not exist', () => __awaiter(void 0, void 0, void 0, function* () {
                const mockPreferences = { theme: 'dark', notifications: false };
                jest.spyOn(user_preferences_model_1.UserPreferencesModel, 'findOneAndUpdate').mockResolvedValue(mockPreferences);
                const userId = new mongoose_1.default.Types.ObjectId().toString();
                const result = yield user_service_1.UserService.updateUserPreferences(userId, mockPreferences);
                expect(result).toEqual(mockPreferences);
            }));
        });
    });
    describe('getUserById', () => {
        it('should return user when valid ID is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockImplementation(() => ({
                lean: () => Promise.resolve(mockUser)
            }));
            const result = yield user_service_1.UserService.getUserById(mockUserId);
            expect(result).toEqual(mockUser);
            expect(user_model_1.User.findById).toHaveBeenCalledWith(new mongoose_1.default.Types.ObjectId(mockUserId));
        }));
        it('should return null for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockImplementation(() => ({
                lean: () => Promise.resolve(null)
            }));
            const result = yield user_service_1.UserService.getUserById(mockUserId);
            expect(result).toBeNull();
        }));
        it('should throw error for invalid user ID', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidId = 'invalid-id';
            yield expect(user_service_1.UserService.getUserById(invalidId)).rejects.toThrow();
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockImplementation(() => ({
                lean: () => Promise.reject(new Error('Database error'))
            }));
            yield expect(user_service_1.UserService.getUserById(mockUserId)).rejects.toThrow('Database error');
        }));
    });
    describe('getUserPreferences', () => {
        it('should return user preferences when user exists', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockImplementation(() => ({
                lean: () => Promise.resolve(mockUser)
            }));
            const result = yield user_service_1.UserService.getUserPreferences(mockUserId);
            expect(result).toEqual({
                userId: mockUserId,
                preferredTechniques: mockUser.preferences.techniques,
                preferredDuration: mockUser.preferences.duration,
                preferredTime: mockUser.preferences.time,
                notificationFrequency: mockUser.preferences.notificationFrequency
            });
        }));
        it('should return default preferences for user without preferences', () => __awaiter(void 0, void 0, void 0, function* () {
            const userWithoutPrefs = Object.assign(Object.assign({}, mockUser), { preferences: undefined });
            user_model_1.User.findById.mockImplementation(() => ({
                lean: () => Promise.resolve(userWithoutPrefs)
            }));
            const result = yield user_service_1.UserService.getUserPreferences(mockUserId);
            expect(result).toEqual({
                userId: mockUserId,
                preferredTechniques: [],
                preferredDuration: 10,
                preferredTime: 'morning',
                notificationFrequency: 'daily'
            });
        }));
        it('should return null for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockImplementation(() => ({
                lean: () => Promise.resolve(null)
            }));
            const result = yield user_service_1.UserService.getUserPreferences(mockUserId);
            expect(result).toBeNull();
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockImplementation(() => ({
                lean: () => Promise.reject(new Error('Database error'))
            }));
            yield expect(user_service_1.UserService.getUserPreferences(mockUserId)).rejects.toThrow('Database error');
        }));
    });
    describe('updateUserPreferences', () => {
        const mockPreferences = {
            preferredTechniques: ['meditation', 'breathing'],
            preferredDuration: 20,
            preferredTime: 'morning',
            notificationFrequency: 'weekly'
        };
        it('should update all preferences successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findByIdAndUpdate.mockImplementation(() => ({
                lean: () => Promise.resolve(Object.assign(Object.assign({}, mockUser), { preferences: {
                        techniques: mockPreferences.preferredTechniques,
                        duration: mockPreferences.preferredDuration,
                        time: mockPreferences.preferredTime,
                        notificationFrequency: mockPreferences.notificationFrequency
                    } }))
            }));
            const result = yield user_service_1.UserService.updateUserPreferences(mockUserId, mockPreferences);
            expect(result.preferences).toEqual({
                techniques: mockPreferences.preferredTechniques,
                duration: mockPreferences.preferredDuration,
                time: mockPreferences.preferredTime,
                notificationFrequency: mockPreferences.notificationFrequency
            });
        }));
        it('should update partial preferences successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const partialPrefs = {
                preferredDuration: 25,
                preferredTime: 'evening'
            };
            user_model_1.User.findByIdAndUpdate.mockImplementation(() => ({
                lean: () => Promise.resolve(Object.assign(Object.assign({}, mockUser), { preferences: Object.assign(Object.assign({}, mockUser.preferences), { duration: partialPrefs.preferredDuration, time: partialPrefs.preferredTime }) }))
            }));
            const result = yield user_service_1.UserService.updateUserPreferences(mockUserId, partialPrefs);
            expect(result.preferences.duration).toBe(partialPrefs.preferredDuration);
            expect(result.preferences.time).toBe(partialPrefs.preferredTime);
            expect(result.preferences.techniques).toEqual(mockUser.preferences.techniques);
        }));
        it('should handle non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findByIdAndUpdate.mockImplementation(() => ({
                lean: () => Promise.resolve(null)
            }));
            const result = yield user_service_1.UserService.updateUserPreferences(mockUserId, mockPreferences);
            expect(result).toBeNull();
        }));
        it('should handle invalid user ID', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidId = 'invalid-id';
            yield expect(user_service_1.UserService.updateUserPreferences(invalidId, mockPreferences)).rejects.toThrow();
        }));
        it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findByIdAndUpdate.mockImplementation(() => ({
                lean: () => Promise.reject(new Error('Database error'))
            }));
            yield expect(user_service_1.UserService.updateUserPreferences(mockUserId, mockPreferences)).rejects.toThrow('Database error');
        }));
        it('should validate preference values', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidPrefs = {
                preferredDuration: -5, // Invalid duration
                notificationFrequency: 'invalid' // Invalid frequency
            };
            yield expect(user_service_1.UserService.updateUserPreferences(mockUserId, invalidPrefs)).rejects.toThrow();
        }));
    });
});
