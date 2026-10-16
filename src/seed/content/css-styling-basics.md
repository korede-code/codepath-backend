# CSS Styling Basics

CSS (**Cascading Style Sheets**) makes your HTML beautiful.

## Three Ways to Add CSS

1. **Inline** (avoid)
2. **Internal** (inside `<style>` tag)
3. **External** (best practice!)

```html
<link rel="stylesheet" href="styles.css">
```

## CSS Syntax

```css
selector {
    property: value;
}
```

## Selectors

```css
p { color: blue; }         /* Element */
.btn { color: blue; }       /* Class */
#header { color: blue; }    /* ID */
* { margin: 0; }            /* Universal */
```

## The Box Model

Every element has:
- **Content** — the text or image
- **Padding** — space inside the border
- **Border** — the edge of the element
- **Margin** — space outside the border

```css
.box {
    width: 200px;
    padding: 20px;
    border: 2px solid black;
    margin: 10px;
}
```

**Box sizing trick:**

```css
* {
    box-sizing: border-box;
}
```

## Colors

```css
color: red;                    /* Named */
color: #ff0000;                /* Hex */
color: rgb(255, 0, 0);         /* RGB */
color: rgba(255, 0, 0, 0.5);   /* With opacity */
```

## Layout with Flexbox

```css
.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
}
```

## Layout with Grid

```css
.grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
}
```

## Responsive Design

```css
.container {
    width: 100%;
    padding: 16px;
}

@media (min-width: 768px) {
    .container {
        max-width: 720px;
        margin: 0 auto;
    }
}
```

## Best Practices

1. Use **external CSS** — keep styles separate
2. **Mobile-first** — start with mobile styles
3. Use **classes** — not IDs for styling
4. **Consistent naming** — BEM or similar
5. Avoid **!important** — use specificity properly