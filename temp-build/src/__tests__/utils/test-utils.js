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
exports.expectValidationError = expectValidationError;
exports.findDocumentById = findDocumentById;
exports.createTestUser = createTestUser;
exports.createTestDocument = createTestDocument;
exports.cleanupTestDocuments = cleanupTestDocuments;
exports.compareObjectIds = compareObjectIds;
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
/**
 * Type-safe error handler for testing validation errors
 */
function expectValidationError(action, expectedErrorFields) {
    return __awaiter(this, void 0, void 0, function* () {
        let error;
        try {
            yield action();
            fail('Expected validation error but none was thrown');
        }
        catch (err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error.name).toBe('ValidationError');
        for (const field of expectedErrorFields) {
            expect(error.errors[field]).toBeDefined();
        }
    });
}
/**
 * Type-safe document finder with proper typing
 */
function findDocumentById(model, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const document = yield model.findById(id);
        if (!document) {
            throw new Error(`Document not found with id: ${id}`);
        }
        return document;
    });
}
/**
 * Create a test user with authentication token
 */
function createTestUser(overrides = {}) {
    const userId = overrides._id || new mongoose_1.default.Types.ObjectId().toString();
    const username = overrides.username || 'testuser';
    const user = {
        _id: userId,
        username
    };
    const authToken = jsonwebtoken_1.default.sign(user, config_1.default.jwtSecret || 'test-secret', { expiresIn: '1h' });
    return {
        user,
        userId,
        authToken
    };
}
/**
 * Type-safe method to create a test document
 */
function createTestDocument(model, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const document = new model(data);
        yield document.save();
        return document;
    });
}
/**
 * Type-safe method to clean up test documents
 */
function cleanupTestDocuments(model, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        yield model.deleteMany(filter);
    });
}
/**
 * Type-safe method to compare ObjectIds
 */
function compareObjectIds(id1, id2) {
    return id1.toString() === id2.toString();
}
