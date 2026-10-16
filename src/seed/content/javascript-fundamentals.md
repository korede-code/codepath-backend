# JavaScript Fundamentals

JavaScript makes your websites **interactive**.

## Variables

```javascript
let name = "Alice";        // Can be reassigned
const age = 25;            // Cannot be reassigned
var old = "avoid";         // Old way, avoid using
```

## Data Types

```javascript
let string = "Hello";           // String
let number = 42;                // Number
let boolean = true;             // Boolean
let nothing = null;             // Null
let notDefined = undefined;     // Undefined
let array = [1, 2, 3];          // Array
let object = { name: "Alice" }; // Object
```

## Operators

```javascript
// Arithmetic
5 + 3   // 8
5 - 3   // 2
5 * 3   // 15
5 / 3   // 1.666...
5 % 3   // 2 (remainder)
5 ** 3  // 125 (exponent)

// Comparison
5 == "5"    // true (loose — avoid)
5 === "5"   // false (strict — use this!)
```

## Conditionals

```javascript
const age = 18;

if (age >= 18) {
    console.log("Adult");
} else if (age >= 13) {
    console.log("Teenager");
} else {
    console.log("Child");
}

// Ternary
const status = age >= 18 ? "Adult" : "Minor";
```

## Loops

```javascript
// For
for (let i = 0; i < 5; i++) {
    console.log(i);
}

// For...of (arrays)
const fruits = ["apple", "banana"];
for (const fruit of fruits) {
    console.log(fruit);
}
```

## Functions

```javascript
// Regular function
function greet(name) {
    return "Hello, " + name;
}

// Arrow function (modern)
const greet = (name) => "Hello, " + name;
```

## Arrays

```javascript
const fruits = ["apple", "banana", "orange"];

fruits[0];              // "apple"
fruits.length;          // 3
fruits.push("grape");   // Add to end
fruits.pop();           // Remove from end

// Common methods
const numbers = [1, 2, 3, 4, 5];
numbers.map(n => n * 2);           // [2, 4, 6, 8, 10]
numbers.filter(n => n > 2);        // [3, 4, 5]
numbers.reduce((a, b) => a + b);   // 15
```

## Objects

```javascript
const person = {
    name: "Alice",
    age: 25,
    greet() {
        return "Hi, I'm " + this.name;
    }
};

person.name;         // "Alice"
person["age"];       // 25

// Destructuring
const { name, age } = person;
```

## Async/Await

```javascript
async function fetchData() {
    try {
        const response = await fetch("https://api.example.com/data");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
    }
}
```

## Best Practices

1. Use **const by default**
2. Use **=== always**
3. Write **descriptive names**
4. Keep functions **small**
5. **Handle errors** with try/catch