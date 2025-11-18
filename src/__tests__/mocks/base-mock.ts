/**
 * Base Mock Class
 * 
 * This abstract class serves as the foundation for all mock classes in the testing system.
 * It provides common functionality for tracking calls, resetting state, and configuring behavior.
 */

export interface MockOptions {
  throwOnUnexpectedCall?: boolean;
  recordCalls?: boolean;
  defaultReturnValue?: any;
  name?: string;
}

export interface MockCall {
  method: string;
  args: any[];
  timestamp: number;
  returnValue?: any;
  error?: Error;
}

export abstract class BaseMock {
  protected options: MockOptions;
  protected calls: Map<string, MockCall[]> = new Map();
  protected behaviors: Map<string, Function> = new Map();
  protected defaultBehaviors: Map<string, Function> = new Map();
  
  constructor(options: MockOptions = {}) {
    this.options = {
      throwOnUnexpectedCall: false,
      recordCalls: true,
      defaultReturnValue: undefined,
      name: this.constructor.name,
      ...options
    };
    
    this.initializeDefaultBehaviors();
  }
  
  /**
   * Initialize default behaviors for mock methods.
   * Should be implemented by subclasses.
   */
  protected abstract initializeDefaultBehaviors(): void;
  
  /**
   * Record a method call with its arguments and result
   */
  protected recordCall(method: string, args: any[], returnValue?: any, error?: Error): void {
    if (!this.options.recordCalls) return;
    
    if (!this.calls.has(method)) {
      this.calls.set(method, []);
    }
    
    this.calls.get(method)!.push({
      method,
      args,
      timestamp: Date.now(),
      returnValue,
      error
    });
  }
  
  /**
   * Execute a method with call recording and behavior lookup
   */
  protected execute(method: string, ...args: any[]): any {
    // Look for specific behavior
    const behavior = this.behaviors.get(method) || this.defaultBehaviors.get(method);
    
    if (!behavior) {
      if (this.options.throwOnUnexpectedCall) {
        throw new Error(`Unexpected call to ${this.options.name}.${method}()`);
      }
      this.recordCall(method, args, this.options.defaultReturnValue);
      return this.options.defaultReturnValue;
    }
    
    try {
      const result = behavior.apply(this, args);
      this.recordCall(method, args, result);
      return result;
    } catch (error) {
      this.recordCall(method, args, undefined, error as Error);
      throw error;
    }
  }
  
  /**
   * Set a custom behavior for a method
   */
  setBehavior(method: string, behavior: Function): this {
    this.behaviors.set(method, behavior);
    return this;
  }
  
  /**
   * Reset all recorded calls
   */
  resetCalls(): this {
    this.calls.clear();
    return this;
  }
  
  /**
   * Reset all custom behaviors
   */
  resetBehaviors(): this {
    this.behaviors.clear();
    return this;
  }
  
  /**
   * Reset everything (calls and behaviors)
   */
  reset(): this {
    this.resetCalls();
    this.resetBehaviors();
    return this;
  }
  
  /**
   * Get all recorded calls for a method
   */
  getCalls(method?: string): MockCall[] {
    if (method) {
      return this.calls.get(method) || [];
    }
    
    // Flatten all calls into a single array
    return Array.from(this.calls.values()).flat();
  }
  
  /**
   * Check if a method was called
   */
  wasCalled(method: string): boolean {
    const calls = this.calls.get(method);
    return !!calls && calls.length > 0;
  }
  
  /**
   * Get the number of times a method was called
   */
  callCount(method: string): number {
    const calls = this.calls.get(method);
    return calls ? calls.length : 0;
  }
  
  /**
   * Get the arguments from the last call to a method
   */
  lastCallArgs(method: string): any[] | undefined {
    const calls = this.calls.get(method);
    if (!calls || calls.length === 0) return undefined;
    return calls[calls.length - 1].args;
  }
} 