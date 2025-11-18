"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTestFactory = void 0;
const base_test_factory_1 = require("../../utils/base-test-factory");
const user_model_1 = require("../../../models/user.model");
const test_setup_1 = require("../../utils/test-setup");
class UserTestFactory extends base_test_factory_1.BaseTestFactory {
    constructor() {
        super();
        this.model = user_model_1.User;
        this.mockAuthUtils = (0, test_setup_1.createMockAuthUtils)();
    }
    createMockUser(data = {}) {
        return this.createMockDocument(Object.assign({ email: 'test@example.com', password: 'hashedPassword', name: 'Test User', friends: [], achievements: [] }, data));
    }
    setupAuthMocks(options = {}) {
        const { comparePasswordsResult = true, hashPasswordResult = 'hashed-password', generateTokenResult = 'mock-token' } = options;
        this.mockAuthUtils.comparePasswords.mockResolvedValue(comparePasswordsResult);
        this.mockAuthUtils.hashPassword.mockResolvedValue(hashPasswordResult);
        this.mockAuthUtils.generateToken.mockReturnValue(generateTokenResult);
    }
    setupModelMocks(options = {}) {
        const mockUser = this.createMockUser();
        const { findByIdResult = mockUser, findOneResult = mockUser, createResult = mockUser, updateResult = { modifiedCount: 1 }, deleteResult = { deletedCount: 1 } } = options;
        const mockModel = this.createMockModel();
        mockModel.findById.mockResolvedValue(findByIdResult);
        mockModel.findOne.mockResolvedValue(findOneResult);
        mockModel.create.mockResolvedValue(createResult);
        mockModel.updateOne.mockResolvedValue(updateResult);
        mockModel.deleteOne.mockResolvedValue(deleteResult);
        Object.assign(this.model, mockModel);
    }
    getMockAuthUtils() {
        return this.mockAuthUtils;
    }
}
exports.UserTestFactory = UserTestFactory;
