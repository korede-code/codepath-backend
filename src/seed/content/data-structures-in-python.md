# Data Structures in Python

Python provides powerful **built-in data structures** to organize data.

## Lists

**Ordered, mutable** collections.

```python
fruits = ["apple", "banana", "orange"]

fruits[0]                 # "apple"
fruits[-1]                # "orange"
fruits.append("grape")    # Add to end
fruits.insert(0, "kiwi")  # Insert at index
fruits.remove("banana")   # Remove by value
fruits.pop()              # Remove last

# List comprehension
squares = [x**2 for x in range(5)]
```

## Tuples

**Ordered, immutable** collections.

```python
point = (3, 5)
colors = ("red", "green", "blue")
single = (42,)  # Note the comma!

x, y = point    # Unpacking
```

**When to use tuples:**
- Immutable data (can't change)
- Faster than lists
- Can be dictionary keys
- Returning multiple values

## Dictionaries

**Key-value pairs**.

```python
person = {
    "name": "Alice",
    "age": 25,
    "city": "NYC"
}

person["name"]         # "Alice"
person.get("age")      # 25
person.get("email", "")  # Default value

person["email"] = "alice@example.com"
del person["city"]

for key, value in person.items():
    print(f"{key}: {value}")

# Dict comprehension
squares = {x: x**2 for x in range(5)}
```

## Sets

**Unordered, unique** elements.

```python
fruits = {"apple", "banana", "orange"}
numbers = set([1, 2, 3, 3, 3])  # {1, 2, 3}

fruits.add("grape")
fruits.remove("apple")

# Operations
a = {1, 2, 3}
b = {3, 4, 5}

a | b           # Union: {1, 2, 3, 4, 5}
a & b           # Intersection: {3}
a - b           # Difference: {1, 2}
a ^ b           # Symmetric difference
```

## When to Use What

| Structure | Use When |
|-----------|----------|
| **List** | Ordered data, will change |
| **Tuple** | Fixed data, won't change |
| **Dict** | Key-value lookup |
| **Set** | Unique items, membership tests |

## Practical Examples

### Count Word Frequency

```python
from collections import Counter

text = "the quick brown fox jumps over the lazy dog the fox"
words = text.split()

Counter(words).most_common(3)
# [('the', 3), ('fox', 2), ('quick', 1)]
```

### Group by Category

```python
from collections import defaultdict

products = [
    {"name": "Laptop", "category": "Electronics"},
    {"name": "Shirt", "category": "Clothing"}
]

by_category = defaultdict(list)
for product in products:
    by_category[product["category"]].append(product["name"])
```

### Find Duplicates

```python
def find_duplicates(items):
    seen = set()
    duplicates = set()
    for item in items:
        if item in seen:
            duplicates.add(item)
        else:
            seen.add(item)
    return duplicates
```

## Performance

| Operation | List | Dict/Set | Tuple |
|-----------|------|----------|-------|
| Index | O(1) | O(1) | O(1) |
| Search | O(n) | O(1) | O(n) |
| Insert | O(n) | O(1) | N/A |

**Rule of thumb:**
- Need fast lookup? → Set/Dict
- Need ordered? → List/Tuple
- Need immutable? → Tuple
- Need unique? → Set

## Best Practices

1. **Choose the right structure**
2. **Use comprehensions**
3. **Prefer tuples for fixed data**
4. **Use sets for membership tests**
5. **Use `dict.get()` for safety**