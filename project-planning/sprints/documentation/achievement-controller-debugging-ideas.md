# **Workflow Document: Debugging AchievementController**

## **Objective**
This document provides a structured approach to debugging the `AchievementController` to identify and resolve potential issues causing API test failures or timeouts. It is designed for developers of all experience levels.

---

## **Step 1: Verify Controller Method Execution**
### **1.1 Check if Methods Are Being Called**
Add console logs inside each controller method to confirm execution:
```ts
async getUserAchievements(req, res) {
  console.log("getUserAchievements called");
  try {
    const achievements = await AchievementModel.find({ userId: req.user.id });
    res.status(200).json(achievements);
  } catch (error) {
    console.error("Database fetch error:", error);
    res.status(500).json({ message: "Error retrieving achievements" });
  }
}
```
✅ **Ensures the method is actually running when the test executes.**

---

## **Step 2: Debug Asynchronous Operations**
### **2.1 Identify Hanging Promises**
If the method uses async operations, ensure they resolve properly. Modify the function to enforce timeouts for debugging:
```ts
async getUserAchievements(req, res) {
  try {
    console.time("getUserAchievements fetch");
    const achievements = await AchievementModel.find({ userId: req.user.id });
    console.timeEnd("getUserAchievements fetch");
    res.status(200).json(achievements);
  } catch (error) {
    console.error("Database fetch error:", error);
    res.status(500).json({ message: "Error retrieving achievements" });
  }
}
```
✅ **Helps determine if the database query is causing delays.**

---

## **Step 3: Validate Request Handling**
### **3.1 Check Middleware Impact**
Middleware can sometimes prevent requests from reaching the controller.
- Ensure `authenticateToken` calls `next()` properly.
- Log request flow:
```ts
app.use((req, res, next) => {
  console.log("Incoming request: ", req.method, req.url);
  next();
});
```
✅ **Verifies whether the request reaches the controller.**

---

## **Step 4: Confirm Proper Response Handling**
### **4.1 Ensure All Paths Return a Response**
A missing `res.send()` or `res.json()` can cause tests to hang. Add an explicit fallback:
```ts
async getUserAchievements(req, res) {
  try {
    const achievements = await AchievementModel.find({ userId: req.user.id });
    if (!achievements) {
      return res.status(404).json({ message: "No achievements found" });
    }
    res.status(200).json(achievements);
  } catch (error) {
    console.error("Database fetch error:", error);
    res.status(500).json({ message: "Error retrieving achievements" });
  }
}
```
✅ **Prevents tests from timing out due to missing responses.**

---

## **Step 5: Isolate Database Issues**
### **5.1 Test Controller with a Mocked Database**
Modify Jest tests to mock database calls and avoid real queries:
```ts
jest.mock("../models/achievement.model", () => ({
  find: jest.fn().mockResolvedValue([{ id: "123", name: "Test Achievement" }]),
}));
```
✅ **Determines if the database is the root cause of slow tests.**

---

## **Step 6: Run Tests with Debugging Enabled**
Run Jest with verbose logging:
```sh
jest --runInBand --detectOpenHandles --verbose
```
✅ **Helps track unclosed connections or unresolved promises.**

---

## **Conclusion**
Following these steps will help identify and fix performance or timeout issues in `AchievementController`. If problems persist, further debugging of dependencies such as middleware and WebSockets may be required.

