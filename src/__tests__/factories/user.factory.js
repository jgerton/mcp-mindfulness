"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockUser = void 0;
const faker_1 = require("@faker-js/faker");
const mongoose_1 = require("mongoose");
const mockUser = (input = {}) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
    const _id = new mongoose_1.Types.ObjectId(input._id || faker_1.faker.database.mongodbObjectId());
    const defaultUser = {
        _id,
        username: input.username || faker_1.faker.internet.username(),
        email: input.email || faker_1.faker.internet.email(),
        password: input.password || faker_1.faker.internet.password(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        __v: 0,
        preferences: {
            stressManagement: {
                reminders: (_c = (_b = (_a = input.preferences) === null || _a === void 0 ? void 0 : _a.stressManagement) === null || _b === void 0 ? void 0 : _b.reminders) !== null && _c !== void 0 ? _c : true,
                frequency: (_f = (_e = (_d = input.preferences) === null || _d === void 0 ? void 0 : _d.stressManagement) === null || _e === void 0 ? void 0 : _e.frequency) !== null && _f !== void 0 ? _f : 'daily',
                preferredTime: (_j = (_h = (_g = input.preferences) === null || _g === void 0 ? void 0 : _g.stressManagement) === null || _h === void 0 ? void 0 : _h.preferredTime) !== null && _j !== void 0 ? _j : '09:00'
            },
            meditation: {
                duration: (_m = (_l = (_k = input.preferences) === null || _k === void 0 ? void 0 : _k.meditation) === null || _l === void 0 ? void 0 : _l.duration) !== null && _m !== void 0 ? _m : 15,
                style: (_q = (_p = (_o = input.preferences) === null || _o === void 0 ? void 0 : _o.meditation) === null || _p === void 0 ? void 0 : _p.style) !== null && _q !== void 0 ? _q : 'mindfulness',
                background: (_t = (_s = (_r = input.preferences) === null || _r === void 0 ? void 0 : _r.meditation) === null || _s === void 0 ? void 0 : _s.background) !== null && _t !== void 0 ? _t : 'nature'
            },
            notifications: {
                email: (_w = (_v = (_u = input.preferences) === null || _u === void 0 ? void 0 : _u.notifications) === null || _v === void 0 ? void 0 : _v.email) !== null && _w !== void 0 ? _w : true,
                push: (_z = (_y = (_x = input.preferences) === null || _x === void 0 ? void 0 : _x.notifications) === null || _y === void 0 ? void 0 : _y.push) !== null && _z !== void 0 ? _z : true,
                sms: (_2 = (_1 = (_0 = input.preferences) === null || _0 === void 0 ? void 0 : _0.notifications) === null || _1 === void 0 ? void 0 : _1.sms) !== null && _2 !== void 0 ? _2 : false
            }
        }
    };
    const mockDoc = Object.assign(Object.assign({}, defaultUser), { toObject: () => (Object.assign(Object.assign({}, defaultUser), { _id: _id.toString() })), toJSON: () => (Object.assign(Object.assign({}, defaultUser), { _id: _id.toString() })), save: jest.fn().mockResolvedValue(defaultUser), comparePassword: jest.fn().mockResolvedValue(true), $isDeleted: jest.fn().mockReturnValue(false), $isValid: jest.fn().mockReturnValue(true), $set: jest.fn(), delete: jest.fn(), deleteOne: jest.fn(), depopulate: jest.fn(), directModifiedPaths: jest.fn(), equals: jest.fn(), get: jest.fn(), init: jest.fn(), inspect: jest.fn(), invalidate: jest.fn(), isDirectModified: jest.fn(), isInit: jest.fn(), isModified: jest.fn(), isSelected: jest.fn(), markModified: jest.fn(), modifiedPaths: jest.fn(), populate: jest.fn(), populated: jest.fn(), remove: jest.fn(), set: jest.fn(), unmarkModified: jest.fn(), update: jest.fn(), updateOne: jest.fn(), validate: jest.fn(), validateSync: jest.fn() });
    return mockDoc;
};
exports.mockUser = mockUser;
