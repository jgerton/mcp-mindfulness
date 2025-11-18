import { readFileSync } from 'fs';
import * as ts from 'typescript';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class TestValidator {
  validateTestFile(filePath: string): ValidationResult {
    const result: ValidationResult = {
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

  private parseFile(filePath: string): ts.SourceFile | null {
    try {
      const content = readFileSync(filePath, 'utf-8');
      return ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
      );
    } catch {
      return null;
    }
  }

  private validateTestStructure(sourceFile: ts.SourceFile, result: ValidationResult): void {
    let hasBeforeEach = false;
    let hasDescribe = false;
    let hasMockSetup = false;
    let hasAfterEach = false;

    ts.forEachChild(sourceFile, node => {
      if (ts.isCallExpression(node)) {
        const name = node.expression.getText();
        if (name === 'describe') hasDescribe = true;
        if (name === 'beforeEach') hasBeforeEach = true;
        if (name === 'afterEach') hasAfterEach = true;
      }
      if (node.getText().includes('setupModelMocks')) hasMockSetup = true;
    });

    if (!hasDescribe) result.errors.push('Missing top-level describe block');
    if (!hasBeforeEach) result.errors.push('Missing beforeEach setup');
    if (!hasMockSetup) result.warnings.push('No mock setup detected');
    if (!hasAfterEach) result.warnings.push('Missing afterEach cleanup');
  }

  private validateMockSetup(sourceFile: ts.SourceFile, result: ValidationResult): void {
    let hasTestFactory = false;
    let hasMockReq = false;
    let hasMockRes = false;
    let hasMockReset = false;

    ts.forEachChild(sourceFile, node => {
      const text = node.getText();
      if (text.includes('TestFactory')) hasTestFactory = true;
      if (text.includes('mockReq')) hasMockReq = true;
      if (text.includes('mockRes')) hasMockRes = true;
      if (text.includes('jest.clearAllMocks') || text.includes('mockReset')) hasMockReset = true;
    });

    if (!hasTestFactory) result.errors.push('Missing test factory');
    if (!hasMockReq) result.errors.push('Missing mock request');
    if (!hasMockRes) result.errors.push('Missing mock response');
    if (!hasMockReset) result.warnings.push('No mock reset detected in cleanup');
  }

  private validateTestCases(sourceFile: ts.SourceFile, result: ValidationResult): void {
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

    if (!hasSuccessCase) result.warnings.push('No success test cases found');
    if (!hasErrorCase) result.warnings.push('No error test cases found');
    if (!hasEdgeCase) result.warnings.push('No edge cases tested');
    if (testCount < 2) result.warnings.push('Insufficient test coverage (less than 2 test cases)');
  }

  private validateTypeAssertions(sourceFile: ts.SourceFile, result: ValidationResult): void {
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

  private validateAsyncHandling(sourceFile: ts.SourceFile, result: ValidationResult): void {
    let asyncFunctionCount = 0;
    let awaitCount = 0;
    let hasTryCatch = false;

    ts.forEachChild(sourceFile, node => {
      if (ts.isFunctionDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword)) {
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

  private validateErrorHandling(sourceFile: ts.SourceFile, result: ValidationResult): void {
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

    if (!hasErrorExpect) result.warnings.push('No error expectations found');
    if (!hasErrorCode) result.warnings.push('No error code validations found');
    if (!hasErrorCategory) result.warnings.push('No error category validations found');
  }

  private validateTestNaming(sourceFile: ts.SourceFile, result: ValidationResult): void {
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

  private validateMockImplementations(sourceFile: ts.SourceFile, result: ValidationResult): void {
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

  private validateTestIsolation(sourceFile: ts.SourceFile, result: ValidationResult): void {
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