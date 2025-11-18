"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestResponseFactory = exports.ResponseMock = exports.RequestMock = void 0;
const base_mock_1 = require("../base-mock");
/**
 * Express Request Mock
 *
 * A mock implementation of Express Request object for testing
 */
class RequestMock extends base_mock_1.BaseMock {
    constructor(options = {}) {
        super(options);
        this.params = options.params || {};
        this.query = options.query || {};
        this.body = options.body || {};
        this.headers = options.headers || {};
        this.user = options.user || null;
        this.cookies = options.cookies || {};
        this.session = options.session || {};
    }
    initializeDefaultBehaviors() {
        this.defaultBehaviors.set('get', this.defaultGet.bind(this));
    }
    // Express Request methods
    get(name) {
        return this.execute('get', name);
    }
    defaultGet(name) {
        return this.headers[name.toLowerCase()];
    }
    // Builder methods for fluent API
    withParams(params) {
        this.params = Object.assign(Object.assign({}, this.params), params);
        return this;
    }
    withQuery(query) {
        this.query = Object.assign(Object.assign({}, this.query), query);
        return this;
    }
    withBody(body) {
        this.body = body;
        return this;
    }
    withHeaders(headers) {
        this.headers = Object.assign(Object.assign({}, this.headers), headers);
        return this;
    }
    withUser(user) {
        this.user = user;
        return this;
    }
    withCookies(cookies) {
        this.cookies = Object.assign(Object.assign({}, this.cookies), cookies);
        return this;
    }
    withSession(session) {
        this.session = Object.assign(Object.assign({}, this.session), session);
        return this;
    }
}
exports.RequestMock = RequestMock;
/**
 * Express Response Mock
 *
 * A mock implementation of Express Response object for testing
 */
class ResponseMock extends base_mock_1.BaseMock {
    constructor(options = {}) {
        super(options);
        this.statusCode = 200;
        this.headersSent = false;
        this.sentData = null;
        this.headers = {};
        this.locals = options.locals || {};
    }
    initializeDefaultBehaviors() {
        this.defaultBehaviors.set('status', this.defaultStatus.bind(this));
        this.defaultBehaviors.set('json', this.defaultJson.bind(this));
        this.defaultBehaviors.set('send', this.defaultSend.bind(this));
        this.defaultBehaviors.set('sendStatus', this.defaultSendStatus.bind(this));
        this.defaultBehaviors.set('setHeader', this.defaultSetHeader.bind(this));
        this.defaultBehaviors.set('cookie', this.defaultCookie.bind(this));
        this.defaultBehaviors.set('clearCookie', this.defaultClearCookie.bind(this));
    }
    // Express Response methods
    status(code) {
        return this.execute('status', code);
    }
    json(data) {
        return this.execute('json', data);
    }
    send(data) {
        return this.execute('send', data);
    }
    sendStatus(code) {
        return this.execute('sendStatus', code);
    }
    setHeader(name, value) {
        return this.execute('setHeader', name, value);
    }
    cookie(name, value, options) {
        return this.execute('cookie', name, value, options);
    }
    clearCookie(name, options) {
        return this.execute('clearCookie', name, options);
    }
    // Default implementations
    defaultStatus(code) {
        this.statusCode = code;
        return this;
    }
    defaultJson(data) {
        this.sentData = data;
        this.headersSent = true;
        return this;
    }
    defaultSend(data) {
        this.sentData = data;
        this.headersSent = true;
        return this;
    }
    defaultSendStatus(code) {
        this.statusCode = code;
        this.headersSent = true;
        return this;
    }
    defaultSetHeader(name, value) {
        this.headers[name] = value;
        return this;
    }
    defaultCookie(name, value, options) {
        return this;
    }
    defaultClearCookie(name, options) {
        return this;
    }
    // Helper methods for assertions
    getSentData() {
        return this.sentData;
    }
    getStatusCode() {
        return this.statusCode;
    }
    isHeadersSent() {
        return this.headersSent;
    }
    getHeader(name) {
        return this.headers[name];
    }
}
exports.ResponseMock = ResponseMock;
/**
 * Factory for creating request and response mocks
 */
class RequestResponseFactory {
    /**
     * Create a request mock
     */
    static createRequest(options = {}) {
        return new RequestMock(options);
    }
    /**
     * Create a response mock
     */
    static createResponse(options = {}) {
        return new ResponseMock(options);
    }
    /**
     * Create both request and response mocks
     */
    static create(reqOptions = {}, resOptions = {}) {
        const reqMock = new RequestMock(reqOptions);
        const resMock = new ResponseMock(resOptions);
        return {
            req: reqMock,
            res: resMock,
            reqMock,
            resMock
        };
    }
}
exports.RequestResponseFactory = RequestResponseFactory;
