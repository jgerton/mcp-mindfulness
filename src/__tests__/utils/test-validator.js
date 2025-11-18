"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestValidator = void 0;
const fs_1 = require("fs");
const ts = __importStar(require("typescript"));
class TestValidator {
    validateTestFile(filePath) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };
        const sourceFile = this.parseFile(filePath);
        if (!sourceFile) {
            result.errors.push('Could not parse test file');
            result.isValid = false;
            return result;
        }
        this.validateTestStructure(sourceFile, result);
        this.validateMockSetup(sourceFile, result);
        this.validateTestCases(sourceFile, result);
        this.validateTypeAssertions(sourceFile, result);
        this.validateAsyncHandling(sourceFile, result);
        this.validateErrorHandling(sourceFile, result);
        this.validateTestNaming(sourceFile, result);
        this.validateMockImplementations(sourceFile, result);
        this.validateTestIsolation(sourceFile, result);
        result.isValid = result.errors.length === 0;
        return result;
    }
    parseFile(filePath) {
        try {
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
        }
        catch (_a) {
            return null;
        }
    }
    validateTestStructure(sourceFile, result) {
        let hasBeforeEach = false;
        let hasDescribe = false;
        let hasMockSetup = false;
        let hasAfterEach = false;
        ts.forEachChild(sourceFile, node => {
            if (ts.isCallExpression(node)) {
                const name = node.expression.getText();
                if (name === 'describe')
                    hasDescribe = true;
                if (name === 'beforeEach')
                    hasBeforeEach = true;
                if (name === 'afterEach')
                    hasAfterEach = true;
            }
            if (node.getText().includes('setupModelMocks'))
                hasMockSetup = true;
        });
        if (!hasDescribe)
            result.errors.push('Missing top-level describe block');
        if (!hasBeforeEach)
            result.errors.push('Missing beforeEach setup');
        if (!hasMockSetup)
            result.warnings.push('No mock setup detected');
        if (!hasAfterEach)
            result.warnings.push('Missing afterEach cleanup');
    }
    validateMockSetup(sourceFile, result) {
        let hasTestFactory = false;
        let hasMockReq = false;
        let hasMockRes = false;
        let hasMockReset = false;
        ts.forEachChild(sourceFile, node => {
            const text = node.getText();
            if (text.includes('TestFactory'))
                hasTestFactory = true;
            if (text.includes('mockReq'))
                hasMockReq = true;
            if (text.includes('mockRes'))
                hasMockRes = true;
            if (text.includes('jest.clearAllMocks') || text.includes('mockReset'))
                hasMockReset = true;
        });
        if (!hasTestFactory)
            result.errors.push('Missing test factory');
        if (!hasMockReq)
            result.errors.push('Missing mock request');
        if (!hasMockRes)
            result.errors.push('Missing mock response');
        if (!hasMockReset)
            result.warnings.push('No mock reset detected in cleanup');
    }
    validateTestCases(sourceFile, result) {
        let hasSuccessCase = false;
        let hasErrorCase = false;
        let hasEdgeCase = false;
        let testCount = 0;
        ts.forEachChild(sourceFile, node => {
            if (ts.isCallExpression(node) && node.expression.getText() === 'it') {
                testCount++;
                const testName = node.arguments[0].getText().toLowerCase();
                if (testName.includes('should') && !testName.includes('error')) {
                    hasSuccessCase = true;
                }
                if (testName.includes('error') || testName.includes('fail')) {
                    hasErrorCase = true;
                }
                if (testName.includes('edge') || testName.includes('boundary')) {
                    hasEdgeCase = true;
                }
            }
        });
        if (!hasSuccessCase)
            result.warnings.push('No success test cases found');
        if (!hasErrorCase)
            result.warnings.push('No error test cases found');
        if (!hasEdgeCase)
            result.warnings.push('No edge cases tested');
        if (testCount < 2)
            result.warnings.push('Insufficient test coverage (less than 2 test cases)');
    }
    validateTypeAssertions(sourceFile, result) {
        let assertionCount = 0;
        let hasTypeDefinition = false;
        ts.forEachChild(sourceFile, node => {
            if (node.getText().includes(' as ')) {
                assertionCount++;
            }
            if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
                hasTypeDefinition = true;
            }
        });
        if (assertionCount > 3) {
            result.warnings.push(`High number of type assertions (${assertionCount})`);
        }
        if (!hasTypeDefinition) {
            result.warnings.push('No type definitions found');
        }
    }
    validateAsyncHandling(sourceFile, result) {
        let asyncFunctionCount = 0;
        let awaitCount = 0;
        let hasTryCatch = false;
        ts.forEachChild(sourceFile, node => {
            var _a;
            if (ts.isFunctionDeclaration(node) && ((_a = node.modifiers) === null || _a === void 0 ? void 0 : _a.some(m => m.kind === ts.SyntaxKind.AsyncKeyword))) {
                asyncFunctionCount++;
            }
            if (node.getText().includes('await ')) {
                awaitCount++;
            }
            if (node.getText().includes('try {')) {
                hasTryCatch = true;
            }
        });
        if (asyncFunctionCount > awaitCount) {
            result.warnings.push('Possible missing await statements');
        }
        if (asyncFunctionCount > 0 && !hasTryCatch) {
            result.warnings.push('Async functions without try-catch blocks');
        }
    }
    validateErrorHandling(sourceFile, result) {
        let hasErrorExpect = false;
        let hasErrorCode = false;
        let hasErrorCategory = false;
        ts.forEachChild(sourceFile, node => {
            const text = node.getText();
            if (text.includes('expect') && text.includes('toThrow')) {
                hasErrorExpect = true;
            }
            if (text.includes('ErrorCode.')) {
                hasErrorCode = true;
            }
            if (text.includes('ErrorCategory.')) {
                hasErrorCategory = true;
            }
        });
        if (!hasErrorExpect)
            result.warnings.push('No error expectations found');
        if (!hasErrorCode)
            result.warnings.push('No error code validations found');
        if (!hasErrorCategory)
            result.warnings.push('No error category validations found');
    }
    validateTestNaming(sourceFile, result) {
        ts.forEachChild(sourceFile, node => {
            if (ts.isCallExpression(node) && node.expression.getText() === 'it') {
                const testName = node.arguments[0].getText().toLowerCase();
                if (!testName.includes('should')) {
                    result.warnings.push('Test case name should start with "should"');
                }
                if (testName.length < 10) {
                    result.warnings.push('Test case name too short, be more descriptive');
                }
            }
        });
    }
    validateMockImplementations(sourceFile, result) {
        let hasMockImplementation = false;
        let hasReturnValue = false;
        ts.forEachChild(sourceFile, node => {
            const text = node.getText();
            if (text.includes('mockImplementation')) {
                hasMockImplementation = true;
            }
            if (text.includes('mockReturnValue') || text.includes('mockResolvedValue')) {
                hasReturnValue = true;
            }
        });
        if (!hasMockImplementation && !hasReturnValue) {
            result.warnings.push('No mock implementations found');
        }
    }
    validateTestIsolation(sourceFile, result) {
        let hasSharedState = false;
        let hasBeforeAll = false;
        ts.forEachChild(sourceFile, node => {
            const text = node.getText();
            if (text.includes('let') && !text.includes('beforeEach')) {
                hasSharedState = true;
            }
            if (text.includes('beforeAll')) {
                hasBeforeAll = true;
            }
        });
        if (hasSharedState && !hasBeforeAll) {
            result.warnings.push('Possible shared state without proper setup');
        }
    }
}
exports.TestValidator = TestValidator;
