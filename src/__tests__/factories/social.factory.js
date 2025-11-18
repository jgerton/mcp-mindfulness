"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessageTestFactory = exports.FriendRequestTestFactory = exports.FriendTestFactory = void 0;
const faker_1 = require("@faker-js/faker");
const mongoose_1 = require("mongoose");
const mock_factories_1 = require("../utils/mock-factories");
class FriendTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const _id = new mongoose_1.Types.ObjectId();
        const createdAt = faker_1.faker.date.recent();
        return Object.assign(Object.assign({ _id, requesterId: new mongoose_1.Types.ObjectId(), recipientId: new mongoose_1.Types.ObjectId(), status: faker_1.faker.helpers.arrayElement(['pending', 'accepted', 'blocked']), createdAt, updatedAt: createdAt }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'Friend', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'Friend', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    accepted() {
        return this.create({
            status: 'accepted'
        });
    }
    pending() {
        return this.create({
            status: 'pending'
        });
    }
    blocked() {
        return this.create({
            status: 'blocked'
        });
    }
    between(requesterId, recipientId) {
        return this.create({
            requesterId,
            recipientId
        });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.FriendTestFactory = FriendTestFactory;
class FriendRequestTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const _id = new mongoose_1.Types.ObjectId();
        const createdAt = faker_1.faker.date.recent();
        const requesterId = new mongoose_1.Types.ObjectId();
        const recipientId = new mongoose_1.Types.ObjectId();
        return Object.assign(Object.assign({ _id,
            requesterId,
            recipientId, requester: requesterId, recipient: recipientId, status: faker_1.faker.helpers.arrayElement(['pending', 'accepted', 'rejected']), createdAt, updatedAt: createdAt }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'FriendRequest', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'FriendRequest', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    pending() {
        return this.create({
            status: 'pending'
        });
    }
    accepted() {
        return this.create({
            status: 'accepted'
        });
    }
    rejected() {
        return this.create({
            status: 'rejected'
        });
    }
    from(requesterId) {
        return this.create({
            requesterId,
            requester: requesterId
        });
    }
    to(recipientId) {
        return this.create({
            recipientId,
            recipient: recipientId
        });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.FriendRequestTestFactory = FriendRequestTestFactory;
class ChatMessageTestFactory extends mock_factories_1.BaseTestFactory {
    create(overrides = {}) {
        const _id = new mongoose_1.Types.ObjectId();
        const createdAt = faker_1.faker.date.recent();
        const senderId = new mongoose_1.Types.ObjectId();
        return Object.assign(Object.assign({ _id, sessionId: new mongoose_1.Types.ObjectId(), senderId, content: faker_1.faker.lorem.sentence(), type: faker_1.faker.helpers.arrayElement(['text', 'system']), createdAt, updatedAt: createdAt, userId: senderId.toString() }, overrides), { 
            // Mongoose document methods
            $assertPopulated: jest.fn(), $clearModifiedPaths: jest.fn(), $clone: jest.fn(), $getAllSubdocs: jest.fn(), $getPopulatedDocs: jest.fn(), $ignore: jest.fn(), $inc: jest.fn(), $isDefault: jest.fn(), $isDeleted: jest.fn(), $isEmpty: jest.fn(), $isModified: jest.fn(), $isSelected: jest.fn(), $isValid: jest.fn(), $locals: {}, $markValid: jest.fn(), $model: jest.fn(), $op: null, $parent: jest.fn(), $session: jest.fn(), $set: jest.fn(), $toObject: jest.fn(), $where: jest.fn(), baseModelName: 'ChatMessage', collection: {}, db: {}, delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), errors: {}, get: jest.fn(), getChanges: jest.fn(), increment: jest.fn(), init: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isDirectSelected: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isNew: false, isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), modelName: 'ChatMessage', overwrite: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), replaceOne: jest.fn(), save: jest.fn(), schema: {}, set: jest.fn(), toJSON: jest.fn(), toObject: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    }
    text() {
        return this.create({
            type: 'text',
            content: faker_1.faker.lorem.sentence()
        });
    }
    system() {
        return this.create({
            type: 'system',
            content: faker_1.faker.lorem.sentence()
        });
    }
    fromUser(senderId) {
        return this.create({
            senderId,
            userId: senderId.toString()
        });
    }
    inSession(sessionId) {
        return this.create({
            sessionId
        });
    }
    withContent(content) {
        return this.create({
            content
        });
    }
    batch(count) {
        return Array.from({ length: count }, () => this.create());
    }
}
exports.ChatMessageTestFactory = ChatMessageTestFactory;
