//By广东肇庆中学 261015 黄炜睿
const { parseTerm } = require('./parser');
const { gcd, lcm } = require('./utils');

function solveMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const A = matrix.map(row => [...row]);

    for (let i = 0; i < rows; i++) {
        let maxRow = i;
        for (let r = i + 1; r < rows; r++) {
            if (Math.abs(A[r][i]) > Math.abs(A[maxRow][i])) maxRow = r;
        }
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        if (Math.abs(A[i][i]) < 1e-12) continue;

        const pivot = A[i][i];
        for (let j = i; j < cols; j++) A[i][j] /= pivot;

        for (let r = 0; r < rows; r++) {
            if (r === i) continue;
            const factor = A[r][i];
            for (let j = i; j < cols; j++) {
                A[r][j] -= factor * A[i][j];
            }
        }
    }

    const solution = new Array(cols - 1).fill(0);
    for (let r = 0; r < rows; r++) {
        let pivotCol = -1;
        for (let c = 0; c < cols - 1; c++) {
            if (Math.abs(A[r][c] - 1) < 1e-9) {
                pivotCol = c;
                break;
            }
        }
        if (pivotCol !== -1) {
            solution[pivotCol] = A[r][cols - 1];
        }
    }

    for (let c = 0; c < solution.length; c++) {
        if (solution[c] === 0) solution[c] = 1;
    }
    return solution;
}

function balanceEquation(equation) {
    try {
        const sides = equation.split('=').map(s => s.trim());
        if (sides.length !== 2) throw new Error('缺少等号');
        const leftTerms = sides[0].split('+').map(s => s.trim());
        const rightTerms = sides[1].split('+').map(s => s.trim());
        const allTerms = [...leftTerms, ...rightTerms];

        const leftAtoms = leftTerms.map(parseTerm);
        const rightAtoms = rightTerms.map(parseTerm);

        const elementsSet = new Set();
        [...leftAtoms, ...rightAtoms].forEach(obj => {
            Object.keys(obj).forEach(el => elementsSet.add(el));
        });
        const elements = Array.from(elementsSet);
        if (elements.length === 0) throw new Error('未识别到元素');

        const varCount = allTerms.length;
        const matrix = [];
        for (const el of elements) {
            const row = new Array(varCount + 1).fill(0);
            leftAtoms.forEach((atom, idx) => { row[idx] = atom[el] || 0; });
            rightAtoms.forEach((atom, idx) => { row[leftTerms.length + idx] = -(atom[el] || 0); });
            matrix.push(row);
        }

        matrix.push(new Array(varCount + 1).fill(0));
        matrix[matrix.length - 1][0] = 1;
        matrix[matrix.length - 1][varCount] = 1;

        const rawCoeff = solveMatrix(matrix);
        let coeff = rawCoeff.map(v => Math.abs(v));

        const fractions = coeff.map(v => {
            const eps = 1e-8;
            let denom = 1;
            while (Math.abs(v * denom - Math.round(v * denom)) > eps && denom < 1000) denom++;
            return { num: Math.round(v * denom), den: denom };
        });

        const commonDenom = fractions.reduce((l, f) => lcm(l, f.den), 1);
        const intCoeff = fractions.map(f => f.num * (commonDenom / f.den));
        const divisor = intCoeff.reduce((g, v) => gcd(g, v), intCoeff[0]);
        coeff = intCoeff.map(v => v / divisor);

        const formatSide = (terms, coeffs) => {
            return terms.map((t, i) => {
                const c = coeffs[i];
                return c === 1 ? t : c + t;
            }).join(' + ');
        };

        const leftResult = formatSide(leftTerms, coeff.slice(0, leftTerms.length));
        const rightResult = formatSide(rightTerms, coeff.slice(leftTerms.length));
        return leftResult + ' = ' + rightResult;
    } catch (err) {
        return '配平失败：' + (err.message || '请检查方程式格式');
    }
}

module.exports = { balanceEquation };