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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const glob = __importStar(require("glob"));
const chalk_1 = __importDefault(require("chalk"));
const globPattern = 'src/__tests__/**/*.test.ts';
const ignorePatterns = ['src/__tests__/templates/**', 'src/__tests__/utils/**'];
function validateTestFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = {
        errors: [],
        warnings: [],
    };
    // Check for top-level describe block
    const hasTopLevelDescribe = /describe\(['"][^'"]+['"],\s*\(\)\s*=>\s*{/.test(content);
    if (!hasTopLevelDescribe) {
        result.errors.push('Missing top-level describe block');
    }
    // Check for beforeEach setup
    const hasBeforeEach = /beforeEach\(\s*(?:async\s*)?\(\)\s*=>\s*{/.test(content);
    if (!hasBeforeEach) {
        result.errors.push('Missing beforeEach setup');
    }
    // Check for afterEach cleanup
    const hasAfterEach = /afterEach\(\s*(?:async\s*)?\(\)\s*=>\s*{/.test(content);
    if (!hasAfterEach) {
        result.warnings.push('Missing afterEach cleanup');
    }
    // Check for success test cases
    const successTestCases = content.match(/describe\(['"]Success Cases['"].*?{([\s\S]*?)}\);/g);
    const hasSuccessTests = successTestCases && successTestCases.some(block => /it\(['"]/.test(block));
    if (!hasSuccessTests) {
        result.warnings.push('No success test cases found');
    }
    // Check for error test cases
    const errorTestCases = content.match(/describe\(['"]Error Cases['"].*?{([\s\S]*?)}\);/g);
    const hasErrorTests = errorTestCases && errorTestCases.some(block => /it\(['"]/.test(block));
    if (!hasErrorTests) {
        result.warnings.push('No error test cases found');
    }
    // Check for edge test cases
    const edgeTestCases = content.match(/describe\(['"]Edge Cases['"].*?{([\s\S]*?)}\);/g);
    const hasEdgeTests = edgeTestCases && edgeTestCases.some(block => /it\(['"]/.test(block));
    if (!hasEdgeTests) {
        result.warnings.push('No edge cases tested');
    }
    // Count total test cases
    const testCaseCount = (content.match(/it\(['"][^'"]+['"],/g) || []).length;
    if (testCaseCount < 2) {
        result.warnings.push('Insufficient test coverage (less than 2 test cases)');
    }
    // Check for error expectations
    const hasErrorExpectations = /expect\s*\([^)]+\)\s*\.\s*(?:toThrow|rejects|toBe|toEqual|toMatch|toContain|toHaveBeenCalled|toHaveBeenCalledWith|toHaveBeenCalledTimes|toHaveBeenLastCalledWith|toHaveBeenNthCalledWith|toHaveReturned|toHaveReturnedTimes|toHaveReturnedWith|toHaveLastReturnedWith|toHaveNthReturnedWith|toHaveLength|toHaveProperty|toBeDefined|toBeUndefined|toBeNull|toBeTruthy|toBeFalsy|toBeGreaterThan|toBeGreaterThanOrEqual|toBeLessThan|toBeLessThanOrEqual|toBeInstanceOf|toBeCloseTo|toBeNaN|toBePositive|toBeNegative|toContainEqual|toContainKey|toContainKeys|toContainValue|toContainValues|toContainEntry|toContainEntries|toMatchObject|toMatchSnapshot|toMatchInlineSnapshot|toThrowError|toThrowErrorMatchingSnapshot|toThrowErrorMatchingInlineSnapshot|resolves|rejects)/
        .test(content);
    if (!hasErrorExpectations) {
        result.warnings.push('No error expectations found');
    }
    // Check for mock implementations
    const hasMocks = /jest\.spyOn|jest\.mock|mockResolvedValue|mockRejectedValue|mockImplementation/.test(content);
    if (!hasMocks) {
        result.warnings.push('No mock implementations found');
    }
    return result;
}
// Find and validate test files
const files = glob.sync(globPattern, { ignore: ignorePatterns });
let hasErrors = false;
files.forEach(file => {
    const result = validateTestFile(file);
    if (result.errors.length > 0 || result.warnings.length > 0) {
        console.log(`\nValidating ${file}:\n`);
        if (result.errors.length > 0) {
            console.log('Errors:');
            result.errors.forEach(error => {
                console.log(chalk_1.default.red(`  ✖ ${error}`));
            });
        }
        if (result.warnings.length > 0) {
            console.log('\nWarnings:');
            result.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow(`  ⚠ ${warning}`));
            });
        }
        if (result.errors.length > 0) {
            hasErrors = true;
        }
    }
});
if (hasErrors) {
    console.log(chalk_1.default.red('\n❌ Test validation failed. Please fix the errors above.'));
    process.exit(1);
}
else {
    console.log(chalk_1.default.green('\n✓ All tests passed validation.'));
    process.exit(0);
}
