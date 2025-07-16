document.addEventListener('DOMContentLoaded', () => {

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
})