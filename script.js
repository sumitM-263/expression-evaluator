document.addEventListener('DOMContentLoaded', () => {
    let calculationHistory = [];
    let calculationSteps = [];

    const expressionInput = document.getElementById('expressionInput');
    const evaluateBtn = document.getElementById('evaluateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultDisplay = document.getElementById('resultDisplay');
    const resultValueDisplay = document.getElementById('resultValue');
    const errorMessage = document.getElementById('errorMessage');
    const stepsSection = document.getElementById('stepsSection');
    const stepsHeader = document.getElementById('stepsHeader');
    const stepsToggle = document.getElementById('stepsToggle');
    const stepsContent = document.getElementById('stepsContent');
    const stepsList = document.getElementById('stepsList');
    const historyList = document.getElementById('historyList');
    const clearHistory = document.getElementById('clearHistory');

    // function to validate the input expression
    function validateExpression(expression) {

        // removes spaces
        const cleanExpression = expression.replace(/\s+/g, '');


        if (cleanExpression === '') {
            return {
                valid: false,
                error: `Expression can't be empty`
            }
        }


        const validChars = /^[0-9+\-*/().]+$/;
        if (!validChars.test(cleanExpression)) {
            return {
                valid: false,
                error: 'Invalid characters found'
            }
        }

        let parenthesesCount = 0;
        for (let char of cleanExpression) {
            if (char === '(') parenthesesCount++;
            if (char === ')') parenthesesCount--;
            if (parenthesesCount < 0) {
                return { valid: false, error: 'Unmatched closing parenthesis' };
            }
        }

        if (parenthesesCount !== 0) {
            return { valid: false, error: 'Unmatched opening parenthesis' };
        }

        // check for consecutive operators
        if (/[+\-*/]{2,}/.test(cleanExpression)) {
            return { valid: false, error: 'Consecutive operators not allowed' };
        }

        // check for operators at start or end
        if (/^[+\-*/]/.test(cleanExpression) || /[+\-*/]$/.test(cleanExpression)) {
            return { valid: false, error: 'Expression cannot start or end with an operator' };
        }

        return { valid: true, error: null };

    }


    // function to tokenize the input expression
    function tokenize(expression) {
        const tokens = [];
        const cleanExpression = expression.replace(/\s+/g, '');
        let currentNumber = '';

        for (let i = 0; i < cleanExpression.length; i++) {
            const char = cleanExpression[i];

            if (char >= '0' && char <= '9' || char === '.') {
                currentNumber += char;
            } else {
                if (currentNumber !== '') {
                    tokens.push({ type: 'number', value: parseFloat(currentNumber) });
                    currentNumber = '';
                }

                if (char === '+' || char === '-' || char === '*' || char === '/') {
                    tokens.push({ type: 'operator', value: char });
                } else if (char === '(' || char === ')') {
                    tokens.push({ type: 'parentheses', value: char });
                }
            }
        }

        if (currentNumber !== '') {
            tokens.push({ type: 'number', value: parseFloat(currentNumber) });
        }

        return tokens;
    }



    function getPrecedence(operator) {
        switch (operator) {
            case '+':
            case '-':
                return 1;
            case '*':
            case '/':
                return 2;
            default:
                return 0;
        }
    }


    // infix to postfix conversion
    function infixToPostfix(tokens) {
        const output = [];
        const operators = [];

        for (let token of tokens) {
            if (token.type === 'number') {
                output.push(token);
            } else if (token.type === 'operator') {
                while (operators.length > 0 &&
                    operators[operators.length - 1].type === 'operator' &&
                    getPrecedence(operators[operators.length - 1].value) >= getPrecedence(token.value)) {
                    output.push(operators.pop());
                }
                operators.push(token);
            } else if (token.value === '(') {
                operators.push(token);
            } else if (token.value === ')') {
                while (operators.length > 0 && operators[operators.length - 1].value !== '(') {
                    output.push(operators.pop());
                }
                operators.pop();
            }
        }

        while (operators.length > 0) {
            output.push(operators.pop());
        }

        return output;
    }


    // function to record each step
    function recordStep(expression, description, result = '') {
        calculationSteps.push({
            expression: expression,
            description: description,
            result: result
        });
    }

    function evaluatePostfixWithSteps(postfixTokens) {
        const stack = [];

        for (let token of postfixTokens) {
            if (token.type === 'number') {
                stack.push(token.value);
                recordStep(`Push ${token.value}`, `Stack: [${stack.join(', ')}]`);
            } else if (token.type === 'operator') {
                const b = stack.pop();
                const a = stack.pop();

                let result;
                switch (token.value) {
                    case '+': result = a + b; break;
                    case '-': result = a - b; break;
                    case '*': result = a * b; break;
                    case '/':
                        if (b === 0) throw new Error('Division by zero');
                        result = a / b;
                        break;
                    default:
                        throw new Error('Unknown operator: ' + token.value);
                }

                stack.push(result);
                recordStep(`${a} ${token.value} ${b} = ${result}`, `Stack: [${stack.join(', ')}]`, result);
            }
        }

        return stack[0];
    }

    function evaluateWithSteps(expression) {
        calculationSteps = [];

        recordStep(expression, 'Original expression');

        const tokens = tokenize(expression);
        recordStep(tokens.map(t => t.value).join(' '), 'Tokenized expression');

        const postfixTokens = infixToPostfix(tokens);
        recordStep(postfixTokens.map(t => t.value).join(' '), 'Converted to postfix notation');

        const result = evaluatePostfixWithSteps(postfixTokens);
        recordStep('Final Result', 'Calculation complete!', result);

        return result;
    }


    // to display steps
    function displaySteps() {
        stepsList.innerHTML = '';

        calculationSteps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'step-item';
            stepElement.style.animationDelay = `${index * 0.1}s`;

            stepElement.innerHTML = `
                    <div class="step-number">${index + 1}</div>
                    <div class="step-details">
                        <div class="step-expression">${step.expression}</div>
                        <div class="step-description">${step.description}</div>
                    </div>
                    ${step.result !== '' ? `<div class="step-result">= ${step.result}</div>` : ''}
                `;

            stepsList.appendChild(stepElement);
        });

        stepsSection.style.display = 'block';
    }

    function addToHistory(expression, result) {
        calculationHistory.unshift({
            expression: expression,
            result: result,
            timestamp: new Date()
        });

        if (calculationHistory.length > 10) {
            calculationHistory.pop();
        }

        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        historyList.innerHTML = '';

        if (calculationHistory.length === 0) {
            historyList.innerHTML = '<div class="empty-history">No calculations yet. Start by entering an expression above!</div>';
            return;
        }

        calculationHistory.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';

            const timeString = item.timestamp.toLocaleTimeString();

            historyElement.innerHTML = `
                    <div class="history-expression">${item.expression}</div>
                    <div class="history-result">= ${item.result}</div>
                    <div class="history-timestamp">${timeString}</div>
                `;

            historyElement.addEventListener('click', function () {
                expressionInput.value = item.expression;
                expressionInput.focus();
            });

            historyList.appendChild(historyElement);
        });
    }

})

