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
const db_handler_1 = require("../test-utils/db-handler");
const user_model_1 = require("../../models/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_factory_1 = require("../factories/user.factory");
describe('User Model Test Suite', () => {
    let userFactory;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.connectToTestDB)();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        userFactory = new user_factory_1.UserTestFactory();
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.clearDatabase)();
        jest.clearAllMocks();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, db_handler_1.disconnectFromTestDB)();
    }));
    describe('Success Cases', () => {
        it('should create a valid user', () => __awaiter(void 0, void 0, void 0, function* () {
            const testData = userFactory.create();
            const user = yield user_model_1.User.create(testData);
            expect(user._id).toBeDefined();
            expect(user.email).toBe(testData.email);
            expect(user.isActive).toBe(true);
        }));
        it('should create user without optional fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const testData = userFactory.withoutOptionalFields();
            const user = yield user_model_1.User.create(testData);
            expect(user._id).toBeDefined();
            expect(user.email).toBeDefined();
            expect(user.name).toBeUndefined();
            expect(user.preferences).toBeUndefined();
        }));
        it('should handle custom preferences', () => __awaiter(void 0, void 0, void 0, function* () {
            const preferences = {
                stressManagement: {
                    preferredCategories: ['pmr', 'breathing'],
                    preferredDuration: 20,
                    difficultyLevel: 'advanced'
                }
            };
            const user = yield user_model_1.User.create(userFactory.withPreferences(preferences));
            expect(user.preferences.stressManagement).toEqual(preferences.stressManagement);
        }));
    });
    describe('Error Cases', () => {
        it('should fail validation when required fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = new user_model_1.User({});
            const validationError = yield user.validateSync();
            expect(validationError).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.email).toBeDefined();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.password).toBeDefined();
        }));
        it('should fail validation with invalid email format', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = new user_model_1.User(userFactory.withInvalidEmail());
            const validationError = yield user.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.email).toBeDefined();
        }));
        it('should fail validation with invalid password', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = new user_model_1.User(userFactory.withInvalidPassword());
            const validationError = yield user.validateSync();
            expect(validationError === null || validationError === void 0 ? void 0 : validationError.errors.password).toBeDefined();
        }));
        it('should fail with duplicate email', () => __awaiter(void 0, void 0, void 0, function* () {
            const testData = userFactory.create();
            yield user_model_1.User.create(testData);
            yield expect(user_model_1.User.create(testData)).rejects.toThrow(mongoose_1.default.Error.MongoServerError);
        }));
    });
    describe('Edge Cases', () => {
        it('should handle empty optional fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_model_1.User.create(userFactory.withoutOptionalFields());
            expect(user.name).toBeUndefined();
            expect(user.preferences).toBeUndefined();
        }));
        it('should handle maximum length email', () => __awaiter(void 0, void 0, void 0, function* () {
            const longEmail = 'a'.repeat(240) + '@example.com'; // Most email servers limit to 254 chars
            const user = yield user_model_1.User.create(userFactory.create({ email: longEmail }));
            expect(user.email).toBe(longEmail);
        }));
        it('should handle concurrent saves', () => __awaiter(void 0, void 0, void 0, function* () {
            const users = userFactory.batch(5).map(data => new user_model_1.User(data));
            yield expect(Promise.all(users.map(u => u.save()))).resolves.toBeDefined();
        }));
        it('should handle special characters in password', () => __awaiter(void 0, void 0, void 0, function* () {
            const specialPasswords = [
                'Pass!@#$%^&*()',
                'Pass~`-_=+[{]}\\|;:\'",<.>/?',
                'Pass™®©€£¥¢₹'
            ];
            for (const password of specialPasswords) {
                const user = yield user_model_1.User.create(userFactory.withCustomPassword(password));
                expect(yield user.comparePassword(password)).toBe(true);
            }
        }));
    });
    describe('Password Hashing', () => {
        it('should hash password before saving', () => __awaiter(void 0, void 0, void 0, function* () {
            const password = 'TestPassword123!';
            const user = yield user_model_1.User.create(userFactory.withCustomPassword(password));
            expect(user.password).not.toBe(password);
            expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
        }));
        it('should not rehash password if not modified', () => __awaiter(void 0, void 0, void 0, function* () {
            const hashSpy = jest.spyOn(bcryptjs_1.default, 'hash');
            const user = yield user_model_1.User.create(userFactory.create());
            hashSpy.mockClear();
            user.email = 'new@example.com';
            yield user.save();
            expect(hashSpy).not.toHaveBeenCalled();
            hashSpy.mockRestore();
        }));
        it('should verify password correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const password = 'TestPassword123!';
            const user = yield user_model_1.User.create(userFactory.withCustomPassword(password));
            expect(yield user.comparePassword(password)).toBe(true);
            expect(yield user.comparePassword('wrongpassword')).toBe(false);
        }));
    });
    describe('Data Integrity', () => {
        it('should convert email to lowercase', () => __awaiter(void 0, void 0, void 0, function* () {
            const mixedCaseEmail = 'Test.User@Example.COM';
            const user = yield user_model_1.User.create(userFactory.create({ email: mixedCaseEmail }));
            expect(user.email).toBe(mixedCaseEmail.toLowerCase());
        }));
        it('should set default preferences', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_model_1.User.create(userFactory.create());
            expect(user.preferences).toEqual({
                stressManagement: {
                    preferredCategories: ['breathing', 'meditation'],
                    preferredDuration: 10,
                    difficultyLevel: 'beginner'
                }
            });
        }));
        it('should set isActive to true by default', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_model_1.User.create(userFactory.create());
            expect(user.isActive).toBe(true);
        }));
        it('should handle inactive users', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_model_1.User.create(userFactory.inactive());
            expect(user.isActive).toBe(false);
        }));
        it('should update timestamps on modification', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_model_1.User.create(userFactory.create());
            const originalUpdatedAt = user.updatedAt;
            yield new Promise(resolve => setTimeout(resolve, 1000)); // ensure time difference
            user.email = 'updated@example.com';
            yield user.save();
            expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        }));
    });
});
