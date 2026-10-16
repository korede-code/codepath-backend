# Build a Calculator

Apply everything you've learned to build a working calculator.

## What You'll Build

A calculator with:
- Number buttons (0–9)
- Operator buttons (+, −, ×, ÷)
- Equals button (=)
- Clear button (C)
- Display screen

## Step 1: HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Calculator</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="calculator">
        <div class="display" id="display">0</div>
        <div class="buttons">
            <button onclick="clearDisplay()">C</button>
            <button onclick="appendNumber('7')">7</button>
            <button onclick="appendNumber('8')">8</button>
            <button onclick="appendNumber('9')">9</button>
            <button onclick="setOperator('/')">÷</button>
            <!-- ... more buttons -->
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

## Step 2: JavaScript Logic

```javascript
let display = '0';
let firstOperand = null;
let operator = null;
let waitingForSecond = false;

const displayEl = document.getElementById('display');

function appendNumber(num) {
    if (waitingForSecond) {
        display = num;
        waitingForSecond = false;
    } else {
        display = display === '0' ? num : display + num;
    }
    displayEl.textContent = display;
}

function setOperator(op) {
    if (operator !== null) calculate();
    firstOperand = parseFloat(display);
    operator = op;
    waitingForSecond = true;
}

function calculate() {
    if (operator === null || waitingForSecond) return;

    const secondOperand = parseFloat(display);
    let result;

    switch (operator) {
        case '+': result = firstOperand + secondOperand; break;
        case '-': result = firstOperand - secondOperand; break;
        case '*': result = firstOperand * secondOperand; break;
        case '/':
            if (secondOperand === 0) {
                display = 'Error';
                displayEl.textContent = display;
                return;
            }
            result = firstOperand / secondOperand;
            break;
    }

    display = String(Math.round(result * 1e8) / 1e8);
    firstOperand = result;
    operator = null;
    waitingForSecond = true;
    displayEl.textContent = display;
}

function clearDisplay() {
    display = '0';
    firstOperand = null;
    operator = null;
    waitingForSecond = false;
    displayEl.textContent = display;
}
```

## Testing Checklist

- [ ] Add: 5 + 3 = 8
- [ ] Subtract: 10 − 4 = 6
- [ ] Multiply: 6 × 7 = 42
- [ ] Divide: 20 ÷ 4 = 5
- [ ] Division by zero shows "Error"
- [ ] Clear resets everything

## What You've Learned

- HTML structure
- CSS layout
- JavaScript functions
- DOM manipulation
- Event handling
- State management