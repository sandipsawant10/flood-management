# Authentication System Testing

This directory contains tests for the authentication system in the Flood Disaster Management application.

## Setup

To run these tests, make sure you have Jest and Testing Library installed:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add the following configuration to your package.json:

```json
"jest": {
  "setupFilesAfterEnv": ["./src/tests/setupTests.js"],
  "testEnvironment": "jsdom"
}
```

## Running Tests

```bash
npm test
```

## Test Files

- **authFlow.test.jsx**: Tests the authentication flow including login, token refresh, and logout.

## Test Coverage

The tests cover:

1. Login with valid credentials
2. "Remember me" functionality
3. Token storage in localStorage vs sessionStorage
4. Token refresh mechanism
5. Handling expired tokens
6. Logout functionality
