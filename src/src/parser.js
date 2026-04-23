function parseMolecule(formula) {
    const stack = [{}];
    let i = 0;
    const len = formula.length;
    const isDigit = (c) => /[0-9]/.test(c);
    const isLower = (c) => /[a-z]/.test(c);
    const isUpper = (c) => /[A-Z]/.test(c);

    while (i < len) {
        if (formula[i] === '(') {
            stack.push({});
            i++;
        } else if (formula[i] === ')') {
            i++;
            let num = '';
            while (i < len && isDigit(formula[i])) num += formula[i++];
            const multiplier = num === '' ? 1 : parseInt(num, 10);
            const top = stack.pop();
            const current = stack[stack.length - 1];
            for (const [el, cnt] of Object.entries(top)) {
                current[el] = (current[el] || 0) + cnt * multiplier;
            }
        } else if (isUpper(formula[i])) {
            let el = formula[i++];
            while (i < len && isLower(formula[i])) el += formula[i++];
            let num = '';
            while (i < len && isDigit(formula[i])) num += formula[i++];
            const count = num === '' ? 1 : parseInt(num, 10);
            const current = stack[stack.length - 1];
            current[el] = (current[el] || 0) + count;
        } else if (formula[i] === '·') {
            i++;
        } else {
            i++;
        }
    }

    while (stack.length > 1) {
        const top = stack.pop();
        const current = stack[stack.length - 1];
        for (const [el, cnt] of Object.entries(top)) {
            current[el] = (current[el] || 0) + cnt;
        }
    }
    return stack[0];
}

function parseTerm(term) {
    const match = term.match(/^(\d+)(.+)$/);
    let coeff = 1;
    let formula = term;
    if (match) {
        coeff = parseInt(match[1], 10);
        formula = match[2];
    }
    const atoms = parseMolecule(formula);
    const result = {};
    for (const [el, cnt] of Object.entries(atoms)) {
        result[el] = cnt * coeff;
    }
    return result;
}

module.exports = { parseMolecule, parseTerm };