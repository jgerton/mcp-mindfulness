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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob = __importStar(require("glob"));
const globPattern = 'src/__tests__/**/*.test.ts';
const ignorePatterns = ['src/__tests__/templates/**', 'src/__tests__/utils/**'];
const extractTestCases = (content) => {
    const context = {
        imports: [],
        testCases: {
            success: [],
            error: [],
            edge: [],
        },
        beforeEach: [],
        afterEach: [],
        describes: [],
    };
    // Extract imports
    const importRegex = /^import.*?;$/gm;
    const imports = content.match(importRegex) || [];
    context.imports = imports;
    // Extract describe blocks
    const describeRegex = /describe\(['"]([^'"]+)['"].*?,\s*\(\)\s*=>\s*{([\s\S]*?)}\);/g;
    let match;
    while ((match = describeRegex.exec(content)) !== null) {
        const [_, name, body] = match;
        context.describes.push(name);
        // Extract test cases from this describe block
        const testCaseRegex = /it\(['"]([^'"]+)['"],\s*(?:async\s*)?\(\)\s*=>\s*{([\s\S]*?)}\);/g;
        let testMatch;
        while ((testMatch = testCaseRegex.exec(body)) !== null) {
            const [fullMatch, description, testBody] = testMatch;
            const testCase = fullMatch;
            if (description.toLowerCase().includes('success')) {
                context.testCases.success.push(testCase);
            }
            else if (description.toLowerCase().includes('error') || description.toLowerCase().includes('fail')) {
                context.testCases.error.push(testCase);
            }
            else if (description.toLowerCase().includes('edge') || description.toLowerCase().includes('boundary')) {
                context.testCases.edge.push(testCase);
            }
            else {
                // Default to success case if no clear category
                context.testCases.success.push(testCase);
            }
        }
    }
    // Extract beforeEach and afterEach
    const beforeEachRegex = /beforeEach\(\s*(?:async\s*)?\(\)\s*=>\s*{([\s\S]*?)}\);/g;
    const afterEachRegex = /afterEach\(\s*(?:async\s*)?\(\)\s*=>\s*{([\s\S]*?)}\);/g;
    while ((match = beforeEachRegex.exec(content)) !== null) {
        context.beforeEach.push(match[1].trim());
    }
    while ((match = afterEachRegex.exec(content)) !== null) {
        context.afterEach.push(match[1].trim());
    }
    return context;
};
const migrateTestFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const context = extractTestCases(content);
    // Get component name from file path
    const componentName = path.basename(filePath, '.test.ts')
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    // Combine imports, removing duplicates
    const uniqueImports = Array.from(new Set([
        ...context.imports,
        "import { Request, Response } from 'express';",
        "import { TestFactory } from '../utils/test-factory';",
        "import { ErrorCode, ErrorCategory } from '../../errors';",
    ])).join('\n');
    // Add default test cases if none exist
    if (context.testCases.success.length === 0) {
        context.testCases.success.push(`
      it('should successfully process valid input', async () => {
        // Arrange
        const input = context.testFactory.createValidInput();
        context.mockReq.body = input;
        
        const expectedResult = context.testFactory.createExpectedResult();
        jest.spyOn(SomeService.prototype, 'someMethod')
          .mockResolvedValue(expectedResult);

        // Act
        try {
          await controller.handleComponent(context.mockReq, context.mockRes);

          // Assert
          expect(context.mockRes.status).toHaveBeenCalledWith(200);
          expect(context.mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining(expectedResult)
          );
        } catch (error) {
          fail('Should not throw an error');
        }
      });
    `);
    }
    if (context.testCases.error.length === 0) {
        context.testCases.error.push(`
      it('should handle invalid input error', async () => {
        // Arrange
        const invalidInput = context.testFactory.createInvalidInput();
        context.mockReq.body = invalidInput;

        jest.spyOn(SomeService.prototype, 'someMethod')
          .mockRejectedValue({
            code: ErrorCode.INVALID_INPUT,
            category: ErrorCategory.VALIDATION,
            message: 'Invalid input provided',
          });

        // Act & Assert
        try {
          await controller.handleComponent(context.mockReq, context.mockRes);
          fail('Should throw an error');
        } catch (error: any) {
          expect(error.code).toBe(ErrorCode.INVALID_INPUT);
          expect(error.category).toBe(ErrorCategory.VALIDATION);
          expect(context.mockRes.status).not.toHaveBeenCalled();
        }
      });
    `);
    }
    if (context.testCases.edge.length === 0) {
        context.testCases.edge.push(`
      it('should handle boundary conditions', async () => {
        // Arrange
        const edgeInput = context.testFactory.createEdgeCaseInput();
        context.mockReq.body = edgeInput;

        // Mock implementation with specific logic
        jest.spyOn(SomeService.prototype, 'someMethod')
          .mockImplementation(async (input) => {
            if (someEdgeCondition(input)) {
              return specialHandling(input);
            }
            return normalHandling(input);
          });

        // Act
        await controller.handleComponent(context.mockReq, context.mockRes);

        // Assert
        expect(context.mockRes.status).toHaveBeenCalledWith(200);
        expect(context.mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            // Edge case specific assertions
          })
        );
      });
    `);
    }
    // Build test content
    let testContent = `
describe('${componentName} Tests', () => {
  let context: TestContext;

  beforeAll(() => {
    // Setup any test-wide configurations
  });

  beforeEach(() => {
    // Initialize test context
    context = {
      mockReq: {
        params: {},
        body: {},
        query: {},
      } as Request,
      mockRes: {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response,
      testFactory: new TestFactory(),
    };
    ${context.beforeEach.join('\n    ')}
  });

  afterEach(() => {
    // Clean up after each test
    jest.clearAllMocks();
    ${context.afterEach.join('\n    ')}
  });

  describe('Success Cases', () => {
    ${context.testCases.success.join('\n\n    ')}
  });

  describe('Error Cases', () => {
    ${context.testCases.error.join('\n\n    ')}
  });

  describe('Edge Cases', () => {
    ${context.testCases.edge.join('\n\n    ')}
  });
});`;
    // Write the migrated content
    const migrated = `${uniqueImports}

// Define types for better type safety
interface TestContext {
  mockReq: Request;
  mockRes: Response;
  testFactory: TestFactory;
}

${testContent}`;
    fs.writeFileSync(filePath, migrated);
};
// Find and migrate test files
const files = glob.sync(globPattern, { ignore: ignorePatterns });
console.log(`Found ${files.length} test files to migrate...`);
files.forEach(file => {
    console.log(`Migrating ${file}...`);
    migrateTestFile(file);
});
console.log('Migration complete!');
