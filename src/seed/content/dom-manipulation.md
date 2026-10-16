# DOM Manipulation

The **DOM** (Document Object Model) is your JavaScript interface to HTML.

## Selecting Elements

```javascript
const header = document.getElementById("header");
const firstBtn = document.querySelector(".btn");
const allBtns = document.querySelectorAll(".btn");

// Convert NodeList to Array
const btnArray = [...allBtns];
```

## Reading & Changing Content

```javascript
const el = document.querySelector("#myElement");

el.textContent = "New text";
el.innerHTML = "<strong>Bold</strong>";  // XSS risk!

// Classes
el.classList.add("active");
el.classList.remove("hidden");
el.classList.toggle("open");

// Styles
el.style.color = "red";
```

## Creating & Removing Elements

```javascript
const div = document.createElement("div");
div.textContent = "New element";
div.className = "card";

document.body.appendChild(div);
element.remove();
```

## Events

```javascript
const button = document.querySelector("#myBtn");

button.addEventListener("click", (event) => {
    console.log("Clicked!");
    console.log(event.target);
});

// Once — fires only once
button.addEventListener("click", handler, { once: true });
```

## Common Events

```javascript
// Mouse
element.addEventListener("click", handler);
element.addEventListener("mouseenter", handler);

// Keyboard
document.addEventListener("keydown", (e) => {
    console.log(e.key);
    console.log(e.ctrlKey);
});

// Form
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
});

// Window
window.addEventListener("resize", handler);
```

## Event Delegation

```javascript
document.querySelector(".list").addEventListener("click", (e) => {
    if (e.target.classList.contains("item")) {
        console.log("Item clicked:", e.target.textContent);
    }
});
```

## Performance Tips

1. **Cache selectors** — don't query repeatedly
2. **Use DocumentFragment** for bulk inserts
3. **Debounce** frequent events (scroll, resize)
4. **Event delegation** for dynamic lists
5. **textContent** over `innerHTML` for safety