# Python Functions

Functions are **reusable blocks of code** that perform specific tasks.

## Why Functions?

- **DRY Principle** — Don't Repeat Yourself
- **Organization** — Break code into pieces
- **Testing** — Easier to test small units
- **Reusability** — Use same function many times

## Defining Functions

```python
def greet():
    print("Hello!")

greet()
```

## Parameters & Arguments

```python
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")  # "Hello, Alice!"

def add(a, b):
    return a + b

result = add(5, 3)  # 8
```

## Return Values

```python
def add(a, b):
    return a + b

# Return multiple values
def get_user():
    return "Alice", 25

name, age = get_user()
```

## Default Parameters

```python
def greet(name="World"):
    print(f"Hello, {name}!")

greet()          # "Hello, World!"
greet("Alice")   # "Hello, Alice!"
```

## Keyword Arguments

```python
def create_user(name, age, city):
    return {"name": name, "age": age, "city": city}

create_user(name="Alice", age=25, city="NYC")
```

## *args and **kwargs

```python
# *args — variable positional arguments
def sum_all(*numbers):
    return sum(numbers)

sum_all(1, 2, 3, 4, 5)  # 15

# **kwargs — variable keyword arguments
def print_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=25)
```

## Scope

```python
global_var = "I'm global"

def my_func():
    local_var = "I'm local"
    print(global_var)
    print(local_var)

# Modifying globals (avoid)
count = 0

def increment():
    global count
    count += 1
```

## Lambda Functions

```python
# Regular function
def square(x):
    return x ** 2

# Lambda equivalent
square = lambda x: x ** 2

# Common use — sort with key
users.sort(key=lambda u: u["age"])
```

## Docstrings

```python
def calculate_area(length, width):
    """
    Calculate the area of a rectangle.

    Args:
        length (float): The length
        width (float): The width

    Returns:
        float: The area
    """
    return length * width
```

## Common Mistakes

- ❌ **Mutable default arguments** — use `None` as default
- ❌ **Forgetting return** — function returns `None`
- ❌ **Shadowing built-ins** — don't name a variable `list`

## Best Practices

1. **Single responsibility** — one job per function
2. **Descriptive names** — `calculate_total` not `calc`
3. **Keep short** — under 20 lines
4. **Use docstrings**
5. **Type hints** for readability