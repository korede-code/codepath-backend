# Python Introduction

Python is a **versatile, beginner-friendly** programming language.

## Why Python?

- **Easy to learn** — clean, readable syntax
- **Versatile** — web, data science, AI, automation
- **Huge community** — tons of libraries
- **In-demand** — top jobs require Python

## Installing Python

Download from [python.org](https://python.org). Check "Add Python to PATH" during install.

Verify:

```bash
python --version
```

## Your First Program

```python
print("Hello, World!")
```

## Variables

```python
name = "Alice"
age = 25
price = 19.99
is_active = True

# Multiple assignment
x, y, z = 1, 2, 3

# Constants (convention — uppercase)
PI = 3.14159
```

## Data Types

```python
text = "Hello"       # String
number = 42          # Integer
decimal = 3.14       # Float
flag = True          # Boolean
nothing = None       # None

type(text)      # <class 'str'>
type(number)    # <class 'int'>
```

## Strings

```python
name = "Alice"

# f-strings (modern)
greeting = f"Hello, {name}!"
print(greeting)  # "Hello, Alice!"

# Common methods
name.upper()           # "ALICE"
name.lower()           # "alice"
name.replace("A", "E") # "Elice"
len(name)              # 5
```

## Numbers

```python
x = 10
y = 3

x + y      # 13
x - y      # 7
x * y      # 30
x / y      # 3.3333...
x // y     # 3 (integer division)
x % y      # 1 (remainder)
x ** y     # 1000 (exponent)
```

## Input & Output

```python
print("Hello")

# Input (always returns string)
name = input("Enter your name: ")
age = int(input("Enter your age: "))
```

## Conditionals

```python
age = 18

if age >= 18:
    print("Adult")
elif age >= 13:
    print("Teenager")
else:
    print("Child")
```

## Loops

```python
# For loop
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# Loop through list
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(fruit)

# While loop
count = 0
while count < 5:
    print(count)
    count += 1
```

## Lists

```python
fruits = ["apple", "banana", "orange"]

fruits[0]                # "apple"
fruits[-1]               # "orange"
fruits.append("grape")   # Add to end
fruits.remove("banana")  # Remove by value

# List comprehension
squares = [x**2 for x in range(5)]
```

## Dictionaries

```python
person = {
    "name": "Alice",
    "age": 25,
    "city": "NYC"
}

person["name"]         # "Alice"
person.get("age")      # 25
person.get("email", "")  # Default value

for key, value in person.items():
    print(key, value)
```

## Best Practices (PEP 8)

1. Use **snake_case** — `my_variable`
2. **4 spaces** for indentation
3. **Descriptive names**
4. Use `#` for comments
5. Use triple quotes for docstrings