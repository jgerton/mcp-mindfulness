# Contributing to MCP Mindfulness

First off, thank you for considering contributing to MCP Mindfulness! It's people like you that help make this platform a valuable tool for integrated stress management and mindfulness practices.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before proceeding.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Describe the behavior you observed and what you expected to happen
- Include screenshots if possible
- Include your environment details (OS, browser, etc.)
- Specify which feature area was affected (stress management, mindfulness, or both)

### Suggesting Enhancements

We welcome suggestions for enhancements! When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a detailed description of the proposed functionality
- Explain why this enhancement would be useful to users
- Include mockups or examples if applicable
- Consider both stress management and mindfulness aspects in your proposal

### Development Process

1. Fork the repository
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-fix-name
   ```
3. Make your changes
4. Run the test suite:
   ```bash
   pnpm test
   ```
5. Commit your changes using conventional commits:
   ```bash
   git commit -m "feat: add new meditation timer"
   git commit -m "fix: resolve session analytics bug"
   ```
6. Push to your fork
7. Create a Pull Request

### Pull Request Guidelines

- Fill in the provided PR template
- Include tests for new features
- Update documentation as needed
- Ensure all tests pass
- Follow our coding standards
- Keep PRs focused and atomic

## Development Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

## Coding Standards

We follow strict coding standards to maintain code quality:

### TypeScript
- Use TypeScript for all new code
- Maintain strict type checking
- Document complex types

### Testing
- Write tests for new features
- Maintain test coverage
- Follow test naming conventions
- See [testing-standards.md](project-planning/testing-standards.md)

### Documentation
- Document new features
- Update relevant documentation
- Use JSDoc for function documentation
- Keep README.md updated

### Commit Messages
Follow conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `test:` for test changes
- `refactor:` for refactoring
- `style:` for formatting
- `chore:` for maintenance

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions
├── hooks/           # Custom React hooks
├── styles/          # Global styles
├── types/           # TypeScript types
└── utils/           # Helper functions
```

## Feature Guidelines

### Integrated Wellness Features
- Focus on seamless user experience across both practice types
- Include accessibility considerations
- Support multiple meditation and stress management techniques
- Consider offline capabilities
- Ensure features complement both stress management and mindfulness goals

### Stress Management Features
- Implement evidence-based stress reduction techniques
- Include comprehensive progress tracking
- Ensure user privacy and data security
- Support customization of stress management tools
- Integrate with mindfulness features where appropriate

### Mindfulness Features
- Support various meditation styles and approaches
- Provide clear guidance for different experience levels
- Include progress tracking and insights
- Enable community interaction where appropriate
- Connect with stress management tools for holistic wellness

## Getting Help

- Check our [documentation](project-planning/)
- Join our [Discord community](#)
- Ask in GitHub issues
- Contact maintainers
- Review our integrated feature guides

## Review Process

1. Code review by maintainers
2. Test coverage verification
3. Documentation review
4. UX/UI review for frontend changes
5. Final maintainer approval

## Recognition

Contributors will be:
- Listed in our [CONTRIBUTORS.md](CONTRIBUTORS.md)
- Acknowledged in release notes
- Invited to our contributor program

Thank you for contributing to MCP Mindfulness!

---

For more detailed information, check our [project documentation](project-planning/). 