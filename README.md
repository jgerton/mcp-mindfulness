# MCP Stress Management and Mindfulness Practices Platform

![Project Status](https://img.shields.io/badge/status-in_development-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-20.x-brightgreen)
![Next.js](https://img.shields.io/badge/next.js-15.x-black)

## 🧘‍♂️ About

The MCP Stress Management and Mindfulness Practices Platform is a comprehensive digital wellness solution that seamlessly integrates stress management and mindfulness practices. Designed specifically for busy individuals seeking to improve their mental well-being, our platform offers an accessible and efficient approach to managing stress while developing mindfulness skills. Built with modern web technologies, it provides personalized experiences that adapt to your schedule and needs.

## 🎯 Core Focus Areas

### Stress Management
- **Quick Relief Techniques**: Short, effective exercises for immediate stress reduction
- **Stress Analytics**: AI-powered tracking of stress patterns and triggers
- **Adaptive Programs**: Personalized stress management strategies based on your lifestyle
- **Progress Monitoring**: Track your stress levels and management effectiveness
- **Emergency Tools**: Instant access to calming techniques during high-stress moments

### Mindfulness Practices
- **Guided Meditations**: Structured sessions for all experience levels
- **Mindful Moments**: Brief mindfulness exercises for busy schedules
- **Skill Development**: Progressive learning path for deepening mindfulness
- **Practice Tracking**: Detailed insights into your meditation journey
- **Community Support**: Connect with others on similar paths

## 🚀 Key Features

- **Integrated Wellness Journey**: Seamlessly combine stress management and mindfulness practices
- **Smart Scheduling**: AI-powered recommendations for optimal practice times
- **Progress Analytics**: Comprehensive tracking of both stress levels and mindfulness development
- **Personalized Experience**: Adaptive content based on your stress patterns and mindfulness progress
- **Community Engagement**: Connect with fellow practitioners and share experiences
- **Cross-Platform Access**: Consistent experience across all your devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **AI Integration**: Claude 3 Sonnet
- **Deployment**: Vercel, Docker

## 📚 Project Documentation

### Planning Documents

Each document begins with an introduction explaining core concepts and includes helpful resources for new team members.

1. [User Journey](project-planning/features/user-journey-plan.md)
   - User onboarding flow
   - Stress assessment process
   - Mindfulness path selection
   - Progress tracking
   - *Introduction to integrated wellness journey design*

2. [Learning Path Management](project-planning/workflows/learning-path-management-plan.md)
   - Stress management techniques
   - Mindfulness progression paths
   - Combined practice flows
   - Personalization strategy
   - *Explains dual-focus learning approach*

3. [Learning Analytics](project-planning/workflows/learning-analytics-plan.md)
   - Stress reduction metrics
   - Mindfulness progress tracking
   - Combined wellness insights
   - Impact measurement
   - *Overview of wellness analytics*

4. [Frontend Interface](project-planning/features/frontend-interface-plan.md)
   - Stress management tools
   - Meditation interfaces
   - Integrated dashboard
   - Accessibility standards
   - *Covers dual-purpose UI/UX design*

5. [Document Grounding](project-planning/workflows/document-grounding-plan.md)
   - Content organization
   - Practice resources
   - Technique documentation
   - Integration guidelines
   - *Content management for dual practices*

6. [Architecture Plan](project-planning/architecture/architecture-plan.md)
   - System design
   - Technical foundation
   - Integration patterns
   - Scalability approach
   - *Technical implementation of dual features*

7. [Coding Standards](project-planning/standards/coding-standards.md)
   - Development guidelines
   - Component patterns
   - Feature integration
   - Quality practices
   - *Standards for wellness platform code*

8. [Testing Standards](project-planning/standards/testing-standards.md)
   - Feature validation
   - Integration testing
   - User experience testing
   - Performance metrics
   - *Testing dual-purpose functionality*

9. [Work Flow](project-planning/workflows/work-flow.md)
   - Development process
   - Feature planning
   - Release strategy
   - Quality assurance
   - *Balanced feature development flow*

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/jgerton/mcp-mindfulness.git
   cd mcp-mindfulness
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

## 🤝 Contributing

Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting pull requests. All contributions should follow our established [Coding Standards](project-planning/standards/coding-standards.md) and [Testing Standards](project-planning/standards/testing-standards.md).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Test Setup Improvements

The test setup has been improved to properly handle database connections and server cleanup:

1. **Connection Management**:
   - Added proper connection handling in `test-db.ts` with connection options for stability
   - Ensured connections are properly closed after tests
   - Added delays to allow async operations to complete

2. **Server Cleanup**:
   - Added a `close` method to the `SocketManager` class to properly clean up socket connections
   - Enhanced the `closeServer` function to close both HTTP server and socket connections

3. **Test Configuration**:
   - Updated Jest configuration with better timeout settings
   - Added `detectOpenHandles` to identify resource leaks
   - Set `maxWorkers: 1` to run tests sequentially and avoid connection conflicts

4. **Index Management**:
   - Fixed duplicate index warnings by ensuring indexes are properly defined
   - Added clear comments to explain index patterns

These improvements help ensure tests run reliably and resources are properly cleaned up between tests.

## 🔧 Development

### Error Handling Guidelines

The application implements a comprehensive error handling strategy to ensure consistent error responses, appropriate logging, and a smooth user experience when issues occur.

#### Error Response Format

All API errors follow this standardized format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Technical error message",
    "category": "VALIDATION|SECURITY|BUSINESS|TECHNICAL",
    "timestamp": "ISO timestamp",
    "requestId": "Request ID for tracing",
    "userMessage": "User-friendly message",
    "details": { 
      // Additional contextual information
    },
    "retryable": true|false
  }
}
```

#### Error Categories

Errors are categorized into four types:

- **VALIDATION**: User input or request format issues
- **SECURITY**: Authentication and authorization failures
- **BUSINESS**: Business logic violations or invalid operations
- **TECHNICAL**: System/infrastructure issues or unexpected errors

#### Best Practices

1. **Use AppError class**: Create errors with the `AppError` class to ensure proper categorization and severity.

```typescript
throw new AppError(
  'Resource not found',
  ErrorCodes.NOT_FOUND,
  ErrorCategory.BUSINESS
);
```

2. **Include Context**: Add relevant context to errors for debugging and logging.

```typescript
throw new AppError(
  'User profile update failed',
  ErrorCodes.DATABASE_ERROR,
  ErrorCategory.TECHNICAL,
  ErrorSeverity.ERROR,
  { userId: id, operation: 'update' }
);
```

3. **User-Friendly Messages**: Always provide clear, non-technical messages for end users.

4. **Logging Level Appropriateness**: Use the correct severity level for logging:
   - `ERROR`: Unexpected failures requiring attention
   - `WARNING`: Handled issues that might need investigation
   - `INFO`: Normal but notable events
   - `DEBUG`: Detailed development information

5. **Safe Error Details**: Never expose sensitive information in error responses.

6. **Retryable Indication**: Indicate if an operation can be retried successfully.

See `src/middleware/error-handler.middleware.ts` for implementation details.

---

*Built with ❤️ by the MCP Stress Management and Mindfulness Team*