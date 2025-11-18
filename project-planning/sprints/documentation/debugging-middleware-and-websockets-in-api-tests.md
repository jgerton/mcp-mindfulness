# **Workflow Document: Debugging Middleware and WebSockets in API Tests**

## **Objective**
This document outlines steps to diagnose and resolve potential issues in middleware and WebSocket dependencies that may cause Jest test failures, including timeouts and unresponsive routes.

---

## **Step 1: Identify Middleware Issues**

### **Check for Missing `next()` Calls**
Middleware functions must always call `next()` to prevent requests from hanging.

Example Fix:
```ts
export function authenticateToken(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    req.user = verifyToken(token); // Assume verifyToken is defined
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    res.status(403).json({ message: "Invalid token" });
  }
}
```
✅ **Ensures request flows to the next handler.**

---

## **Step 2: Mock Middleware in Tests**

Mocking middleware avoids unnecessary database calls and external service dependencies during tests.

Add this mock in the test file:
```ts
jest.mock("../middleware/auth.middleware", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: "mock-user-id", name: "Mock User" };
    next();
  }
}));
```
✅ **Prevents authentication from blocking tests.**

---

## **Step 3: Debug WebSocket Connection Issues**

### **Ensure Proper WebSocket Initialization**
Check if the WebSocket server is properly set up and handles connections without hanging.

Example Fix:
```ts
import { Server } from "socket.io";

export function initializeSocket(server) {
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);
    socket.on("disconnect", () => console.log("Client disconnected"));
  });

  return io;
}
```
✅ **Ensures WebSocket connections are handled properly.**

---

## **Step 4: Mock WebSocket for Tests**

To prevent dependency on real WebSockets, mock the connection in tests.

Create a `mockSocket.ts` file:
```ts
import { Server } from "socket.io";
import { createServer } from "http";
import { io as Client } from "socket.io-client";

export function createMockSocketServer() {
  const httpServer = createServer();
  const io = new Server(httpServer);
  const mockClient = Client("http://localhost:4000", { autoConnect: false });
  return { io, httpServer, mockClient };
}
```
✅ **This allows tests to run independently of the actual WebSocket server.**

---

## **Step 5: Ensure Server and Connections Close After Tests**

Modify Jest `afterAll` to close open connections and prevent timeouts:
```ts
afterAll(async () => {
  server.close();
  await new Promise(resolve => setTimeout(resolve, 500));
});
```
✅ **Prevents lingering open handles from causing Jest to hang.**

---

## **Step 6: Run Tests Again**

Execute Jest with debugging options:
```sh
jest --runInBand --detectOpenHandles
```
If issues persist, inspect logs and ensure no middleware or WebSocket handlers are left unresolved.

---

## **Conclusion**
Following these steps should resolve middleware and WebSocket-related test failures. If problems continue, further debugging of the middleware logic and WebSocket event handling may be required.

