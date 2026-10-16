# Advanced JavaScript

Take your JavaScript skills to the next level.

## Closures

A closure is a function that **remembers** its outer scope even after the outer function returns.

```javascript
function counter() {
    let count = 0;
    return function() {
        count++;
        return count;
    };
}

const increment = counter();
increment();  // 1
increment();  // 2
increment();  // 3
```

## The `this` Keyword

```javascript
const obj = {
    name: "Alice",
    greet: function() {
        console.log(this.name);  // "Alice"
    }
};

// Explicit binding
function greet() {
    console.log(this.name);
}

greet.call({ name: "Bob" });     // "Bob"
greet.apply({ name: "Carol" });  // "Carol"

const bound = greet.bind({ name: "Dave" });
bound();  // "Dave"
```

## Promises

```javascript
const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("Success!"), 1000);
});

promise
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log("Done"));

// Promise.all — wait for all
Promise.all([fetchA(), fetchB()])
    .then(([a, b]) => console.log(a, b));
```

## Async/Await

```javascript
async function fetchUser(id) {
    try {
        const response = await fetch('/api/users/' + id);
        if (!response.ok) throw new Error("User not found");
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}
```

## Destructuring

```javascript
// Object
const { name, age, city = "Unknown" } = person;

// Array
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// Function params
function greet({ name, age }) {
    console.log(name + " is " + age);
}
```

## Spread & Rest

```javascript
// Spread
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];

const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 };

// Rest
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}
```

## Map & Set

```javascript
// Map — any key type
const map = new Map();
map.set("key", "value");
map.set(42, "number key");

// Set — unique values
const set = new Set([1, 2, 3, 3, 3]);
set.size;  // 3

// Remove duplicates
const unique = [...new Set([1, 1, 2, 2, 3])];  // [1, 2, 3]
```

## Pro Tips

1. Always use `===`
2. Prefer `const` over `let`
3. Use template literals
4. Async/await over `.then()` chains
5. Spread for immutable updates
6. Optional chaining — `user?.address?.city`
7. Nullish coalescing — `value ?? defaultValue`