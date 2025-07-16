document.addEventListener('DOMContentLoaded', () => {


    // function to validate the input expression
    function validateExpression(expression) {

        // removes spaces
        const cleanExpression = expression.replace(/\s+/g, '');


        if (cleanExpression === '') {
            return {
                valid: false,
                error: `Expression can't be empty`;
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
})