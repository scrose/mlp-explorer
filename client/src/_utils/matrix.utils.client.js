/*!
 * MLP.Client.Utilities.Matrix
 * File: matrix.utils.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * Adapted from IAT web application
 * MIT Licensed
 */


/**
 * Utility functions
 */

/**
 * Swap pairs of control points.
 * - used to help make invese transforms for the alignment functions
 *
 * @param P
 */

export function swapPts( P )
{
    let i,t,n=P.length;
    for ( i=0; i<n; i+=2 ) {
        t = P[i];
        P[i] = P[i + 1]
        P[i + 1] = t;
    };
}

/**
 *  Matrix transformations
 *  Reference: (Rosetta)
 *  http://rosettacode.org/wiki/Gaussian_elimination#JavaScript
 *  See also for determinant: http://www.aip.de/groups/soe/local/numres/bookcpdf/c2-3.pdf
 *  MJW: This code shouldn't be needed anymore, but I need to work on Cramer and 2 3x3 systems yet
 *  Also missing: what to do with 4 control points or more. Best numerical stability?
*/

/**
 * Lower Upper Solver
 *
 * @param A
 * @param b
 * @param update
 * @return {any[]}
 */

export function lusolve(A, b, update) {
    let lu = ludcmp(A, update)
    if (lu === undefined) return null // Singular Matrix!
    for (let i=0,j=lu.d?1:-1; i<lu.A.length; i++ ) j*=lu.A[i][i]/100;
    return lubksb(lu, b, update)
}

/**
 * Lower Upper Decomposition
 *
 * @param A
 * @param update
 * @return {{A: any[], d: boolean, idx: any[]}}
 */

export function ludcmp(A, update) {
    // A is a matrix that we want to decompose into Lower and Upper matrices.
    let d = true // MJW: I think d says if det(A) is positive or negative
    let n = A.length
    let idx = new Array(n) // Output vector with row permutations from partial pivoting
    let vv = new Array(n)  // Scaling information

    for (let i=0; i<n; i++) {
        let max = 0
        for (let j=0; j<n; j++) {
            let temp = Math.abs(A[i][j])
            if (temp > max) max = temp
        }
        if (max === 0) return {A: null, d: false, idx:[]} // Singular Matrix!
        vv[i] = 1 / max // Scaling
    }

    if (!update) { // make a copy of A
        let Acpy = new Array(n)
        for (let i=0; i<n; i++) {
            let Ai = A[i]
            let Acpyi = new Array(Ai.length)
            for (let j=0; j<Ai.length; j+=1) Acpyi[j] = Ai[j]
            Acpy[i] = Acpyi
        }
        A = Acpy
    }

    let tiny = 1e-20 // in case pivot element is zero
    for (let i=0; ; i++) {
        for (let j=0; j<i; j++) {
            let sum = A[j][i]
            for (let k=0; k<j; k++) sum -= A[j][k] * A[k][i];
            A[j][i] = sum
        }
        let jmax = 0
        let max = 0;
        for (let j=i; j<n; j++) {
            let sum = A[j][i]
            for (let k=0; k<i; k++) sum -= A[j][k] * A[k][i];
            A[j][i] = sum
            let temp = vv[j] * Math.abs(sum)
            if (temp >= max) {
                max = temp
                jmax = j
            }
        }
        if (i <= jmax) {
            for (let j=0; j<n; j++) {
                let temp = A[jmax][j]
                A[jmax][j] = A[i][j]
                A[i][j] = temp
            }
            d = !d;
            vv[jmax] = vv[i]
        }
        idx[i] = jmax;
        if (i === n-1) break;
        let temp = A[i][i]
        if (temp === 0) A[i][i] = temp = tiny
        temp = 1 / temp
        for (let j=i+1; j<n; j++) A[j][i] *= temp
    }
    return {A:A, idx:idx, d:d}
}

/**
 * Lower Upper Back Substitution
 *
 * @param lu
 * @param b
 * @param update
 * @return {any[]}
 */

export function lubksb(lu, b, update) {
    // solves the set of n linear equations A*x = b.
    // lu is the object containing A, idx and d as determined by the routine ludcmp.
    let A = lu.A
    let idx = lu.idx
    let n = idx.length

    if (!update) { // make a copy of b
        let bcpy = new Array(n)
        for (let i=0; i<b.length; i+=1) bcpy[i] = b[i]
        b = bcpy
    }

    for (let ii=-1, i=0; i<n; i++) {
        let ix = idx[i]
        let sum = b[ix]
        b[ix] = b[i]
        if (ii > -1)
            for (let j=ii; j<i; j++) sum -= A[i][j] * b[j]
        else if (sum)
            ii = i
        b[i] = sum
    }
    for (let i=n-1; i>=0; i--) {
        let sum = b[i]
        for (let j=i+1; j<n; j++) sum -= A[i][j] * b[j]
        b[i] = sum / A[i][i]
    }
    return b // solution vector x
}

/**
 * Homographic projection.
 *
 * @param X8
 * @param A
 * @param B
 * @param w
 * @param h
 */

export function homography( X8, A, B, w, h )
{
    let x,y;
    let c=0;
    let u,v,d;

    let h0=X8[0],h1=X8[1],h2=X8[2],h3=X8[3],
        h4=X8[4],h5=X8[5],h6=X8[6],h7=X8[7];

    for ( y=0; y<h; y++ )
    {
        let yw=y*w,y7=y*h7+1,y1=y*h1+h2,y4=y*h4+h5;
        for ( d=y7,x=0; x<w; y1+=h0,y4+=h3,d+=h6,x++ )
        {
            u = y1/d;
            u >>= 0;

            v = y4/d;
            v >>= 0;

            // When would we need these dumb conditions??
            // We already know that x and y are within range
            // Should transform 4 corners and see ahead of time (sufficient?)
            // If out-of-bounds assign 0x00000000?
            if (u>=0&&u<w) if (v>=0&&v<h)
                ///{ B[v*w+u] = A[yw+x]; c++; } // under/overflow?
            { B[yw+x] = A[v*w+u]; c++; } // inverse: under/overflow?
        }
    }
    console.log('homography: '+(w*h)+' pixels, '+c+' pixels processed');

} // homography
