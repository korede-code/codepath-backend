# Introduction to HTML

HTML (**HyperText Markup Language**) is the **skeleton** of every website.

## What is HTML?

HTML uses **tags** to structure content. Tags tell the browser what each element is.

```html
<tagname>Content goes here</tagname>
```

## Basic HTML Structure

Every HTML page follows this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
```

## Essential HTML Tags

### Headings
```html
<h1>Largest Heading</h1>
<h2>Second Largest</h2>
<h3>Third</h3>
```

### Paragraphs & Text
```html
<p>This is a paragraph.</p>
<strong>Bold text</strong>
<em>Italic text</em>
<br>
```

### Links
```html
<a href="https://google.com">Visit Google</a>
<a href="/about">About Us</a>
```

### Images
```html
<img src="photo.jpg" alt="Description" width="300">
```

**Always include alt text** for accessibility!

### Lists
```html
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
</ul>
```

## Semantic HTML

Use meaningful tags instead of generic divs:

| Tag | Purpose |
|-----|---------|
| `<header>` | Page header |
| `<nav>` | Navigation menu |
| `<main>` | Main content |
| `<article>` | Article/blog post |
| `<section>` | Section of content |
| `<aside>` | Sidebar |
| `<footer>` | Page footer |

## Practical Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Portfolio</title>
</head>
<body>
    <header>
        <h1>John Doe</h1>
        <nav>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
        </nav>
    </header>

    <main>
        <section id="about">
            <h2>About Me</h2>
            <p>I'm a <strong>web developer</strong> learning HTML.</p>
        </section>
    </main>
</body>
</html>
```

## Common Mistakes

- ❌ Unclosed tags
- ❌ Wrong nesting
- ❌ Missing alt attributes

## Best Practices

1. Use **semantic HTML** — it improves accessibility and SEO
2. Always add **alt text** to images
3. Use **lowercase** for tag names
4. **Indent** your code for readability