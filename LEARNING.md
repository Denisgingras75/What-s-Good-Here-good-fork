# Learning Guide: Performance Optimizations

This file explains the technical terms and optimizations applied to What's Good Here in plain English.

---

## What We Fixed & Why

### 1. Deferred Analytics Loading

**What it was:** PostHog and Sentry were loading immediately when the page started, blocking everything else.

**What we did:** Made them load AFTER the page is visible to the user.

**Real-world analogy:** Imagine you're opening a restaurant. Before, you were making customers wait outside while you set up the security cameras. Now, you let customers in first, then set up the cameras in the background.

**Impact:** Page loads ~100ms faster because we're not downloading analytics code before showing content.

---

### 2. Removed Barrel File Imports

**What's a barrel file?** A file that re-exports everything from a folder. Like `src/api/index.js` that exports all APIs.

**The problem:** When you import ONE thing from a barrel file, JavaScript loads EVERYTHING in that file, even stuff you don't need.

```javascript
// BAD - loads ALL APIs even though we only need dishesApi
import { dishesApi } from '../api'

// GOOD - only loads what we need
import { dishesApi } from '../api/dishesApi'
```

**Real-world analogy:** It's like ordering a single burger but the kitchen prepares the entire menu "just in case." Direct imports mean the kitchen only makes what you ordered.

**Impact:** Smaller JavaScript bundles, faster page loads.

---

### 3. Memoized DishCard Component

**What's memoization?** Telling React "don't rebuild this component unless its data actually changed."

**The problem:** Every time the parent component updates, React was rebuilding every DishCard from scratch, even if nothing changed.

```javascript
// Before - rebuilds every time parent renders
export function DishCard({ dish }) { ... }

// After - only rebuilds if 'dish' actually changed
export const DishCard = memo(function DishCard({ dish }) { ... })
```

**Real-world analogy:** Imagine a chef who throws away a perfectly good dish and remakes it from scratch every time a new order comes in for a DIFFERENT table. `memo()` tells the chef "if this dish hasn't changed, don't remake it."

**Impact:** Smoother scrolling through dish lists, less CPU work.

---

### 4. Memoized AuthContext Value

**What's Context?** A way to share data (like user login info) across your whole app without passing it through every component.

**The problem:** Every time AuthContext updated, it created a new object `{ user, loading, signOut }`. React saw "new object!" and re-rendered EVERYTHING that uses auth, even if the actual values didn't change.

```javascript
// Before - new object every render, everything re-renders
return <AuthContext.Provider value={{ user, loading, signOut }}>

// After - same object unless values change
const value = useMemo(() => ({ user, loading, signOut }), [user, loading, signOut])
return <AuthContext.Provider value={value}>
```

**Real-world analogy:** Imagine a PA system that announces "ATTENTION EVERYONE" every 5 seconds, even when there's nothing new. Now it only announces when something actually changes.

**Impact:** Fewer unnecessary re-renders across the entire app.

---

### 5. Combined Array Iterations

**The problem:** We were looping through the dishes list TWICE - once to find "ranked" dishes, once to find "unranked" dishes.

```javascript
// Before - loops through dishes TWICE
const ranked = dishes.filter(d => d.votes >= 5)    // Loop 1
const unranked = dishes.filter(d => d.votes < 5)   // Loop 2

// After - ONE loop that sorts into two buckets
const ranked = []
const unranked = []
for (const dish of dishes) {
  if (dish.votes >= 5) ranked.push(dish)
  else unranked.push(dish)
}
```

**Real-world analogy:** You're sorting mail. Before, you went through the entire pile looking for bills, then went through it AGAIN looking for personal letters. Now you sort everything in one pass.

**Impact:** Faster list rendering, especially with many dishes.

---

### 6. Used `toSorted()` Instead of `[...arr].sort()`

**The problem:** To sort an array without modifying the original, we were creating a copy first.

```javascript
// Before - creates a copy, THEN sorts it (two operations)
const sorted = [...dishes].sort((a, b) => b.rating - a.rating)

// After - creates a sorted copy in one step
const sorted = dishes.toSorted((a, b) => b.rating - a.rating)
```

**Real-world analogy:** Instead of photocopying a document and then highlighting the copy, you use a machine that makes a highlighted copy directly.

**Impact:** Slightly faster, cleaner code, more memory efficient.

---

### 7. Passive Event Listeners

**What's an event listener?** Code that waits for something to happen (like a click or scroll).

**What's "passive"?** A promise to the browser: "I won't try to cancel or modify this event, so don't wait for me."

```javascript
// Before - browser waits to see if we'll cancel the event
document.addEventListener('mousedown', handleClick)

// After - browser knows it can proceed immediately
document.addEventListener('mousedown', handleClick, { passive: true })
```

**Real-world analogy:** It's like telling airport security "I'm just watching planes, not boarding any." They don't need to check your ticket.

**Impact:** Smoother scrolling on mobile devices.

---

### 8. CSS content-visibility

**What it does:** Tells the browser "don't bother rendering things that aren't on screen yet."

```css
.dish-card-virtualized {
  content-visibility: auto;
  contain-intrinsic-size: 0 420px;
}
```

**Real-world analogy:** A theater doesn't build sets for Act 3 while Act 1 is playing. It waits until those scenes are needed.

**Impact:** Faster initial page paint when there are many cards. Browser only renders what's visible.

---

### 9. Cached localStorage Reads

**What's localStorage?** A way to save small bits of data in the browser (like "user prefers dark mode").

**The problem:** Every time we checked localStorage, JavaScript had to stop and ask the browser for the data. This is "synchronous" - everything waits.

```javascript
// Before - asks browser EVERY time
const sort = localStorage.getItem('browse_sort')

// After - remembers the answer
const cache = new Map()
function getStorageItem(key) {
  if (cache.has(key)) return cache.get(key)  // Instant!
  const value = localStorage.getItem(key)     // Only asks once
  cache.set(key, value)
  return value
}
```

**Real-world analogy:** Instead of calling your mom every time to ask what your childhood nickname was, you write it down the first time she tells you.

**Impact:** Faster repeated reads, less blocking.

---

## Glossary of Technical Terms

### A

**API (Application Programming Interface)**
A way for your app to talk to a server. Like a waiter taking your order to the kitchen.

**Async/Await**
A way to write code that waits for something (like data from a server) without freezing the whole page.

### B

**Barrel File**
A file that re-exports multiple things from one place. `index.js` files that do `export { thing } from './thing'`.

**Bundle**
All your JavaScript code combined into one (or a few) files for the browser to download.

### C

**Cache**
Storing something so you don't have to fetch/calculate it again. Like remembering a phone number instead of looking it up every time.

**Chunk**
A piece of your bundle that can be loaded separately. Lets you load only what's needed.

**Code Splitting**
Breaking your app into chunks so users don't download everything at once.

**Component**
A reusable piece of UI. Like a DishCard that shows one dish's info.

**Context (React)**
A way to share data across many components without passing it manually through each one.

**Critical Path**
The stuff that MUST load before users see anything. Shorter = faster perceived load time.

### D

**Dependency**
Something your code needs to work. Like how your app needs React to run.

**Dynamic Import**
Loading code only when it's needed: `import('./HeavyComponent')` instead of `import HeavyComponent from './HeavyComponent'`

### E

**Event Listener**
Code that runs when something happens (click, scroll, keypress).

### H

**Hydration**
When React takes over a server-rendered page and makes it interactive.

**Hook**
A function that lets you use React features (like state) in function components. Examples: `useState`, `useEffect`, `useMemo`.

### I

**Immutable**
Data that doesn't change. Instead of modifying, you create a new copy with changes.

### L

**Lazy Loading**
Loading something only when it's needed. Like not downloading the Admin page until someone visits /admin.

**localStorage**
Browser storage that persists even after closing the tab. Limited to ~5MB of text data.

### M

**Memo/Memoization**
Caching the result of a function or component so you don't recalculate if inputs haven't changed.

**Module**
A JavaScript file that exports code for other files to use.

### P

**Parallel**
Doing multiple things at the same time instead of one after another.

**Passive (Event Listener)**
Telling the browser you won't cancel the event, so it can proceed without waiting for your code.

**Props**
Data passed to a React component. Like arguments to a function.

### R

**Re-render**
When React rebuilds a component because something changed. Too many = slow app.

**RSC (React Server Components)**
Components that run on the server and send HTML to the client. (We don't use these - we're a Vite SPA.)

### S

**SPA (Single Page Application)**
An app that loads once and then updates without full page reloads. What we have.

**SSR (Server-Side Rendering)**
Rendering your app on the server first, then sending HTML. (We don't do this.)

**State**
Data that can change and causes re-renders when it does. `useState` creates state.

**Suspense**
React feature that shows a fallback (like a spinner) while waiting for something to load.

**Synchronous**
Code that runs line-by-line, blocking everything until it's done. Opposite of async.

### T

**Tree Shaking**
Removing unused code from your bundle. Like a shipping company not loading boxes that aren't going anywhere.

**TTI (Time to Interactive)**
How long until a user can actually click/type/interact with your page.

### U

**useMemo**
A Hook that caches a calculated value so it's not recalculated every render.

**useCallback**
A Hook that caches a function so it's not recreated every render.

**useEffect**
A Hook that runs code after render (like fetching data or setting up listeners).

### V

**Vendor Chunk**
A bundle containing third-party libraries (React, Supabase, etc.) separate from your code. These change less often so browsers can cache them longer.

**Virtualization**
Only rendering items that are visible on screen, not the entire list.

### W

**Waterfall**
When things load one after another instead of in parallel. Like: fetch user → THEN fetch dishes → THEN fetch votes. Slow!

---

## Further Reading

- [React Docs](https://react.dev/) - Official React documentation
- [web.dev](https://web.dev/) - Google's web performance guides
- [Vite Docs](https://vitejs.dev/) - Our build tool's documentation
