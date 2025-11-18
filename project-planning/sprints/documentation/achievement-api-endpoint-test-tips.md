# **Workflow Document: Fixing Jest Test Timeouts for Achievement Routes**

## **Objective**
This document provides a step-by-step guide to diagnose and fix test timeouts related to API tests for achievement routes in our Express.js application. The goal is to ensure Jest tests run reliably without timing out due to unresolved promises, unclosed sockets, or middleware issues.

---

## **Step 1: Identify the Root Cause of Timeout**
Run Jest with the `--detectOpenHandles` flag to check for unclosed connections:
```sh
jest --detectOpenHandles
```

Common causes of test timeouts:
- **Authentication middleware does not call `next()`**
- **Unresolved promises in controller methods**
- **Hanging socket connections**
- **Server not closing properly after tests**

---

## **Step 2: Mock the Authentication Middleware**
If `authenticateToken` interacts with a database or external service, mock it in the test file to prevent hanging requests.

### **Modify the Jest Test Setup**
Add this mock at the beginning of the test file:
```ts
jest.mock("../middleware/auth.middleware", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: "test-user-id", name: "Test User" }; // Mock user
    next();
  }
}));
```
✅ **This ensures tests do not rely on real authentication logic.**

---

## **Step 3: Fix Route Handlers to Always Resolve Requests**
Modify the `achievement.routes.ts` file to ensure all requests complete with a response:
```ts
router.get('/', async (req, res) => {
  try {
    await achievementController.getUserAchievements(req, res);
  } catch (error) {
    console.error("Error in getUserAchievements:", error);
    res.status(500).json({ message: error.message });
  }
});
```
✅ **This prevents hanging due to unhandled promise rejections.**

---

## **Step 4: Ensure Controller Methods Resolve Properly**
Inspect `AchievementController` methods. If they rely on async operations, ensure they always return a response or call `next(error)`.

Example Fix:
```ts
async getUserAchievements(req, res) {
  try {
    const achievements = await AchievementModel.find({ userId: req.user.id });
    res.status(200).json(achievements);
  } catch (error) {
    console.error("Database fetch error:", error);
    res.status(500).json({ message: "Error retrieving achievements" });
  }
}
```
✅ **Prevents unresolved promises that could cause Jest to hang.**

---

## **Step 5: Mock Socket Connections for Tests**
If WebSockets are used, ensure the test does not rely on the app’s live socket connections.

### **Create a Mock Socket Server**
Create a `mockSocket.ts` file:
```ts
import { Server } from "socket.io";
import { createServer } from "http";
import { io as Client } from "socket.io-client";

export function createMockSocketServer() {
  const httpServer = createServer();
  const io = new Server(httpServer);

  const mockClient = Client("http://localhost:4000", {
    autoConnect: false,
  });

  return { io, httpServer, mockClient };
}
```
✅ **This allows API tests to run without requiring a real WebSocket connection.**

---

## **Step 6: Ensure Server Closes After Tests**
Modify Jest `afterAll` to clean up resources:
```ts
afterAll(async () => {
  server.close();
  await new Promise(resolve => setTimeout(resolve, 500)); // Delay for cleanup
});
```
✅ **Ensures Jest does not hang due to open handles.**

---

## **Step 7: Run Tests Again**
After implementing the fixes, rerun tests with:
```sh
jest --runInBand --detectOpenHandles
```
If tests still time out, review logs and check if additional middleware or services are causing delays.

---

## **Conclusion**
Following these steps should resolve Jest test timeouts and improve test reliability. If the issue persists, further debugging of the `AchievementController` may be needed to ensure all async operations resolve properly.

