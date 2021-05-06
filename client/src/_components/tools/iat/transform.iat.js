/*!
 * MLP.Client.Utilities.Image
 * File: image.utils.client.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * Adapted from IAT web application
 * MIT Licensed
 */

import { getError } from '../../../_services/schema.services.client';
import * as matrix from '../../../_utils/matrix.utils.client';
import { homography } from '../../../_utils/matrix.utils.client';
import * as UTIF from 'utif';
import { getPos } from './canvas.points.iat';

/**
 * Determines image format based on file signature.
 * Bitmap format .bmp 42 4d BM
 * FITS format .fits 53 49 4d 50 4c 45 SIMPL
 * GIF format .gif 47 49 46 38 GIF
 * Graphics Kernel System .gks 47 4b 53 4d GKS
 * IRIS rgb format .rgb 01 da
 * ITC (CMU WM) format .itc f1 00 40 bb
 * JPEG File Interchange Format .jpg ff d8 ff e0
 * NIFF (Navy TIFF) .nif 49 49 4e 31 IIN
 * PM format .pm 56 49 45 57 VIE
 * PNG format .png 89 50 4e 47 .PN
 * Postscript format .[e]ps 25 21 %
 * Sun Rasterfile .ras 59 a6 6a 95 Y.j
 * Targa format .tga xx xx xx ..
 * TIFF format (Motorola - big endian) .tif 4d 4d 00 2a MM.
 * TIFF format (Intel - little endian) .tif 49 49 2a 00 II*
 * X11 Bitmap format .xbm xx x
 * XCF Gimp file structure .xcf 67 69 6d 70 20 78 63 66 20 76 gimp xc
 * Xfig format .fig 23 46 49 47 #FI
 * XPM format .xpm 2f 2a 20 58 50 4d 20 2a 2f
 * @return {string} image format
 */

export const getImageType = (buffer) => {
    const int8Array = new Uint8Array(buffer);
    const [b0, b1, b2, b3] = int8Array.slice(0, 4);

    console.log(b0, b1, b2, b3);
    const formats = {
        'png': [],
        'gif': [],
        'bmp': [],
        'jpg': [255, 216, 255, 219],
        'tiff-le': [77, 77, 0, 42],
        'tiff-be': [73, 73, 42, 0],
    };
    const detected = Object.keys(formats).find((type) => {
        return b0 === formats[type][0]
            && b1 === formats[type][1]
            && b2 === formats[type][2]
            && b3 === formats[type][3];
    });
    return detected || 'unknown';
};

/**
 * Loads TIFF format image file.
 *
 * @param file
 * @return {Promise<unknown>}
 */

export const loadTIFF = (file) => {

    if (!file) return null;

    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onerror = (err) => {
            console.error(err);
            reader.abort();
            reject({ msg: 'Error occurred during parsing of data stream.', type: 'error' });
        };
        reader.onload = (e) => {
            let buffer = e.target.result;

            // validate TIFF data
            const imgType = getImageType(buffer);
            if (imgType !== 'tiff-le' && imgType !== 'tiff-be') {
                reject({
                    msg: `Problem parsing TIFF data stream: Image is of ${imgType.toUpperCase()} format.`,
                    type: 'error',
                });
                return;
            }

            // decode to Uint8Array of the image in RGBA format, 8 bits per channel
            const ifds = UTIF.decode(buffer);
            UTIF.decodeImage(buffer, ifds[0]);
            let rgba = UTIF.toRGBA8(ifds[0]);  // Uint8Array with RGBA pixels
            resolve({
                data: rgba,
                width: ifds[0].width,
                height: ifds[0].height,
            });
        };
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Transform images data for alignment.
 *
 * @public
 * @param control
 * @param imgData1
 * @param imgData2
 * @param canvas1
 * @param canvas2
 * @param options
 */

export const alignImages = (imgData1, imgData2, canvas1, canvas2, options) => {

    if (!imgData1 || !imgData2) {
        return { data: null, error: { msg: getError('emptyCanvas', 'canvas') } };
    }
    if (canvas1.pts.length < options.controlPtMax || canvas2.pts.length < options.controlPtMax) {
        return { data: null, error: { msg: getError('missingControlPoints', 'canvas') } };
    }
    if (imgData1.width !== imgData2.width) {
        return { data: null, error: { msg: getError('mismatchedDims', 'canvas') } };
    }

    // compute alignment transformation matrix
    const transform = getAlignmentTransform(canvas1.pts, canvas2.pts);

    // prepare data for transform
    let img1 = new Uint32Array(imgData1.data.buffer);
    let img2 = new Uint32Array(imgData2.data.buffer);

    // apply transformation to image 2 (img2) on right-hand canvas
    homography(transform, img1, img2, canvas1.source_dims.x, canvas1.source_dims.y);

    // convert image array from Uint32 to Uint8ClampedArray (for ImageData obj)
    let imgUint8 = new Uint8ClampedArray(img2.buffer);
    const imgData = new ImageData(
        imgUint8,
        canvas2.source_dims.x,
        canvas2.source_dims.y,
    );

    return { data: imgData, error: null };
};

/**
 * compute scale-to-fit image to defined width dimension.
 *
 * @public
 * @return {Object} dimensions
 */

export const scaleToFit = (x_dim, y_dim, maxWidth) => {
    const ratio = (y_dim + 0.1) / (x_dim + 0.1);
    return {
        x: maxWidth,
        y: Math.floor(ratio * maxWidth),
    };
};

/**
 * Get mouse start position on canvas.
 * Reference: https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
 *
 * @public
 * @param e
 * @param layers
 * @param panel
 * @param trigger
 * @param options
 * @param pointer
 */

export function moveStart(e,
                          layers,
                          panel,
                          trigger,
                          pointer,
                          options) {
    const pos = getPos(e, layers.control);
    pointer.select(pos);
}

/**
 * Update canvas offset by cursor position
 * @param e
 * @param layers
 * @param panel
 * @param trigger
 * @param pointer
 * @param options
 */

export function moveAt(e,
                       layers,
                       panel,
                       trigger,
                       pointer,
                       options) {

    // check that mouse start position was selected
    if (!pointer.selected) return;

    e.preventDefault();

    // get current mouse position
    const pos = getPos(e, layers.control);
    // only update move if position is positive
    if (pos.x > 0 && pos.y > 0) {
        const newOffset = {
            x: panel.props.offset.x + Math.sign(pos.x - panel.props.move.x),
            y: panel.props.offset.y + Math.sign(pos.y - panel.props.move.y),
        };
        panel.update({ offset: newOffset, move: pos });
        trigger.redraw();
    }
}

/**
 * Get mouse end position on canvas.
 * Reference: https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
 *
 * @public
 * @param e
 * @param layers
 * @param panel
 * @param trigger
 * @param options
 * @param pointer
 */

export function moveEnd(e,
                          layers,
                          panel,
                          trigger,
                          pointer,
                          options) {
    pointer.reset();
}

/**
 * Update canvas offset by dx/dy
 * @param e
 * @param panel
 * @param trigger
 * @param dx
 * @param dy
 */

export function moveBy(e, panel, trigger, dx = 0, dy = 0) {
    e.preventDefault();
    panel.update({
        offset: {
            x: panel.props.offset.x + dx,
            y: panel.props.offset.y + dy,
        },
    });
    trigger.redraw();
}

/**
 * Returns in-range function for 2D coordinate.
 *
 * @public
 * @param x
 * @param y
 * @param u
 * @param v
 * @param radius
 */

export function inRange(x, y, u, v, radius) {
    return (u - (x + radius)) * (u - (x - radius)) < 0
        && (v - (y + radius)) * (v - (y - radius)) < 0;
}


/**
 * Compute alignment transformation matrix image data.
 * - Uses four control points (x,y) given in each canvas
 * - Solves the linear problem H[x,y] = k[u,v] for h
 * - where  h = [h0, h1, h2, h3, h4, h5, h6, h7]
 *          x = [x0, x1, x2, x3], y = [y0, y1, y2, y3]
 *          u = [u0, u1, u2, u3], v = [v0, v1, v2, v3]
 *          p = [[x0, y0], [u0, v0], [x1, y1], [u1, v1],
 *              [x2, y2], [u2, v2], [x3, y3], [u4, v4]]
 * - The transformation matrix H is then defined as:
 *      H = |h0  h1  0  h2|
 *          |h3  h4  0  h5|
 *          |0   0   1   0|
 *          |h6  h7  0   1|
 *
 * Reference: https://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
 *
 * @public
 * @return {*[]}
 * @param pts1
 * @param pts2
 */

export const getAlignmentTransform = (pts1, pts2) => {

    // convert control points to vector array
    // - interleave [x,y] with [u,v]
    const pts = [pts1[0], pts2[0], pts1[1], pts2[1], pts1[2], pts2[2], pts1[3], pts2[3]];
    let p = pts.reduce((o, pt) => {
        o.push([parseFloat(pt.x), parseFloat(pt.y)]);
        return o;
    }, []);

    let i, j, k, l, m, n = p.length;
    let x, y, u, v, d;
    let s, q, e;
    let dx, dy, dd;

    // Compute percentage
    let getPercent = function(x) {
        return Math.floor((x + .001) * 100) / 100;
    };
    //var pf = function(x){return Math.floor(x*100)/100;};
    //var pf = function(x){return x;};
    let ii, jj; // determinant

    // Note the inverse matrix should be just as easy to compute
    // reversing the roles of [0,2,4,6] with [1,3,5,7]
    //matrix.swapPts( pts );

    let M88 = [
        [p[0][0], p[0][1], 1, 0, 0, 0, -p[0][0] * p[1][0], -p[0][1] * p[1][0]],
        [0, 0, 0, p[0][0], p[0][1], 1, -p[0][0] * p[1][1], -p[0][1] * p[1][1]],
        [p[2][0], p[2][1], 1, 0, 0, 0, -p[2][0] * p[3][0], -p[2][1] * p[3][0]],
        [0, 0, 0, p[2][0], p[2][1], 1, -p[2][0] * p[3][1], -p[2][1] * p[3][1]],
        [p[4][0], p[4][1], 1, 0, 0, 0, -p[4][0] * p[5][0], -p[4][1] * p[5][0]],
        [0, 0, 0, p[4][0], p[4][1], 1, -p[4][0] * p[5][1], -p[4][1] * p[5][1]],
        [p[6][0], p[6][1], 1, 0, 0, 0, -p[6][0] * p[7][0], -p[6][1] * p[7][0]],
        [0, 0, 0, p[6][0], p[6][1], 1, -p[6][0] * p[7][1], -p[6][1] * p[7][1]],
    ];
    let B8 = [p[1][0], p[1][1], p[3][0], p[3][1], p[5][0], p[5][1], p[7][0], p[7][1]];
    let X8 = matrix.lusolve(M88, B8, true);

    // Could put a sanity check here? Run the 4 pairs back through X8
    // So ... could we not do this directly with the other points?

    // Check quality of the above 8x8 matrix (or its parts??)
    // Note M88 has been made diagonal by lusolve()
    for (ii = 0, jj = 1; ii < 8; ii++) {
        x = M88[ii][ii];
        jj *= x / 100;
        console.log('Matrix entry ' + x);
    }
    ///console.log('Align4: Matrix88 determinant '+((jj*100>>0)/100));

    // Code copied from alignfunc3 and modified for 4 points 20180201
    // Figure out best fit among all points by taking 4 at a time
    console.log('');
    console.log('Alignment 4 experiments: ' + n + ' points');
    for (i = m = 0; i < n; i += 2) for (j = i + 2; j < n; j += 2)
        for (k = j + 2; k < n; k += 2) for (l = k + 2; l < n; l += 2, m++) {
            M88 = [
                [p[i][0], p[i][1], 1, 0, 0, 0, -p[i][0] * p[i + 1][0], -p[i][1] * p[i + 1][0]],
                [0, 0, 0, p[i][0], p[i][1], 1, -p[i][0] * p[i + 1][1], -p[i][1] * p[i + 1][1]],
                [p[j][0], p[j][1], 1, 0, 0, 0, -p[j][0] * p[j + 1][0], -p[j][1] * p[j + 1][0]],
                [0, 0, 0, p[j][0], p[j][1], 1, -p[j][0] * p[j + 1][1], -p[j][1] * p[j + 1][1]],
                [p[k][0], p[k][1], 1, 0, 0, 0, -p[k][0] * p[k + 1][0], -p[k][1] * p[k + 1][0]],
                [0, 0, 0, p[k][0], p[k][1], 1, -p[k][0] * p[k + 1][1], -p[k][1] * p[k + 1][1]],
                [p[l][0], p[l][1], 1, 0, 0, 0, -p[l][0] * p[l + 1][0], -p[l][1] * p[l + 1][0]],
                [0, 0, 0, p[l][0], p[l][1], 1, -p[l][0] * p[l + 1][1], -p[l][1] * p[l + 1][1]],
            ];
            B8 = [p[i + 1][0], p[i + 1][1], p[j + 1][0], p[j + 1][1], p[k + 1][0], p[k + 1][1], p[l + 1][0], p[l + 1][1]];
            X8 = matrix.lusolve(M88, B8, true);

            // Check quality of this 8x8 matrix
            // Note M88 has been made diagonal by lusolve()
            for (ii = 0, jj = 1; ii < 8; ii++) jj *= M88[ii][ii] / 100;
            console.log('Matrix ' + (m + 1) + ': (' + (i + 1) + ',' + (j + 1) + ',' + (k + 1) + ',' + (l + 1) + ') determinant ' + ((jj * 100 >> 0) / 100));

            // Run the other (n-4) points through the matrix
            for (s = '', q = e = 0; q < n - 1; q += 2) if (q !== i && q !== j && q !== k && q !== l) {
                x = p[q][0];
                y = p[q][1];
                d = X8[6] * x + X8[7] * y + 1;
                u = X8[0] * x + X8[1] * y + X8[2];
                v = X8[3] * x + X8[4] * y + X8[5];
                u = u / d;
                v = v / d;

                dx = u - p[q + 1][0];
                dy = v - p[q + 1][1];
                dd = dx * dx + dy * dy;
                s += ' ' + (q + 1) + '(' + getPercent(dx) + ',' + getPercent(dy) + ')';
                e += dd;
                ///console.log('Align4: u='+pf(u)+' v='+pf(v));
            }
            let RMSE = Math.sqrt(e / (n / 2 - 4));
            //console.log('Points '+i+','+j+','+k+' e='+pf(e)+' RMSE='+pf(RMSE));
            console.log('   d:' + s);
            console.log('   e=' + getPercent(e) + ' RMSE=' + getPercent(RMSE));
        }

    console.log('Transformation Mat:', X8);
    return X8;

    //
    // // Get the backing canvas
    // let I1 = bmpf && ecv1.width ? ecv1 : img1;
    // // let I2 = bmpf && ecv2.width ? ecv2 : img2; // Unused?!
    //
    // bcv1.width = I1.width;
    // bcv1.height = I1.height;
    // console.log('Alignment 4: bmpf='+bmpf+' w='+bcv1.width);
    //
    // let ctx1 = gctx(bcv1);
    // let ctx2 = gctx(bcv2);
    // ctx1.drawImage( I1, 0,0 ); // Why do this? Perhaps the image had been moved??
    //
    // // Use a SIMD and DIMD global here?? Help JS with memory? (sourceImageData)
    // let src = ctx1.getImageData( 0,0, bcv1.width, bcv1.height ); // 2
    // //var dst = ctx2.getImageData( 0,0, bcv1.width,bcv1.height ); // new/create??
    // let dst = ctx1.createImageData( bcv1.width,bcv1.height ); // BAD!
    //
    // ///if (!DIMD) DIMD = new ImageData( bcv1.width, bcv1.height );
    // ///var dst = DIMD; // Will the JS lose track and delay garbage collect??
    //
    // let A = new Uint32Array( src.data.buffer );
    // let B = new Uint32Array( dst.data.buffer );
    // homography( X8, A, B, bcv1.width, bcv1.height );
    // ctx1.putImageData(dst,0,0); // 2

    //drawimages(); // How much time saved by improving this call? Eg. just left canvas?

    //swappointpairs( CtrlPts );

};

/**
 * Image Processing Utilities
 *
 * CORS and file: * Protocol Summary: (incomplete)  * 20200211
 * postMessage() (Categories - but does not seem to be a problem anymore?)
 * GC: chrome://version AFAFF --allow-file-access-from-files tchf tchrome()
 //    (must not have non-AFAFF version running separately)
 * FF: about:config security.fileuri.strict_origin_policy privacy.file_unique_origin
 //    (both default true); Version 68 changed behaviour
 * corsflag crossOrigin
 * toDataURL() getImageData() toBlob(); tainted canvas; AJAX XMLHttpRequest
 * access-control-allow-origin

 NOTES: Candidates for removal to separate files:
 (1) Geometry
 (2) Linear algebra
 (3) HashSet
 (4) Categories string
 (5) XML/AJAX stuff?
 Should also more strongly separate DOM/HTML/drawing from the rest
 Consider HTML/CSS/panels/canvases with no drawing nor images
 */

/**
 * IAT Constants
 */
//
// const CANVAS_WIDTH = 800;
// const CANVAS_HEIGHT = 500;
// const BORDER	= 1;	// 10 for testing
// const MARGIN = 8;	// HACK! Not used (properly). Coordinate with CSS (top,v):margin in html file.
// const MINWIDTH = 200;	// Minimum canvas width
//
// // See cursors.html for all(?) options
// const CURSNORM	= 'default'; // o.style.cursor
// const CURSDRAG	= 'move'; // move pointer hand default auto grab grabbing copy crosshair cell
// const CURSRECT	= 'cell'; // 'hand'; 'crosshair'; // ... help wait nw-resize wait not-allowed
// const linewid	= 1;
// const ALPHA	= 1.0; // 0.9;		// Used only in drawpoly() pmtr list, for img within
//
// // Note xor does not work?! And chrome is "buggy". (Likely due to 0.5-pixel drawing/aliasing.)
// // Perhaps rearranging parameters or changing "style"?
// // Various options for erasing/redrawing:
// // (1) Entire canvas
// // (2) Encompassing rectangle
// // (3) Special purpose overlaid canvas
// // (4) Stroked rectangle with invertible function
// // (5) Filled rectangle with invertible function **
//
// const INVERTDRAW	= 'difference'; // difference exclusion multiply screen
// const INVERTCOLR	= '#00ffff';	// '#ffff00' // 'black' does not work with 'difference' (=> bitwise xor)
// const INVERTSIZE	= '2';
// const LINECLR1	= '#007f00';	//'black'
// const LINECLR2	= '#00007f';
// const LINEWIDTH	= 1; // 2;
// /** @const */ const SELECTCLR	= '#ff0000'; // const test
//
// // Put these in for changing default control point crosshairs colours // 20200820
// var cp_clr1 = 'red';
// var cp_clr2 = 'green';
//
//
// // Big words
// var win=window;
// var doc=document;
// var AL='addEventListener';
// var RL='removeEventListener';
// var SI='selectedIndex';
//
// // endian: false if rrggbbaa, true if aabbggrr (normal? on iMac and Win at home)
// var endian=(function(){var b=new Uint8Array([255,0]);return((new Uint16Array(b,b.buffer))[0]===255);})();
//
// //https://gist.github.com/TooTallNate/4750953
// //var isBigEndian = new Uint8Array(new Uint32Array([0x12345678]).buffer)[0] === 0x12;
// //var isLittleEndian = new Uint8Array(new Uint32Array([0x12345678]).buffer)[0] === 0x78;
//
//
// // Baby functions
// function gid(x) {return doc.getElementById(x);}
// function gis(x) {return gid(x).style;}
//
// // Timestamp
// function ts() {return Date.now?Date.now():new Date().getTime();}
// function cl(s) {console.log(s);} // {} // Could remove for deployment?!
// function al(s) {alert(s)};
// // dialog obect and showModal() - not FF
// // Could use a <div> and innnerhtml too.
// function min(x,y) {return x<y?x:y;}
// // Use this to get filename without path info
// // Does not work well for data hex format
// function nm(s) {var i;s=(s==null||s=='')?'(empty)':s;return pathflag?s:s.substring(i=1+s.lastIndexOf('/'),i+50);}
// function toh() {return gid('divtop').offsetHeight;} // Top height, ie. height of top controls part
// function js(s) {return JSON.stringify(s)}
// function gctx(c) {return c.getContext('2d');} //,{alpha:false});} // 20161111 not as good as hoped
//
// // 20160906 - iframe interface. If this variable defined, images override any query string images
// var parent = window.parent;
// var sbsimages = parent ? parent.window['sbsimages'] : undefined;
//
// if (sbsimages!=undefined) cl('HEY, looks like an IAT iframe test\nIAT images: '+sbsimages);
//
//
// // Need this flag until we know how to tell if Chrome started appropriately (eg. with correct command line options)
// // When set, no testing about the GC CORS (and file://?!) problem, assume it is no problem (AFAFF)
// var tchf = 0;
// var bmpf = 1;	//0 // When set, BMP files are loaded with new non-native code
//
// // Test if browser is GC (google chrome), unless overridden with the tchf flag
// // Ideally we would have a functional test to see if GC run with file://, but no AFAFF
// function tchrome(f)
// {
//     return !tchf && chromb && filep ?
//         f?(al("Cannot perform this operation on Chrome with 'file:' protocol"),1):1:0;
// }
// // With Chrome in file:// protocol mode, need flag --allow-file-access-from-files (AFAFF)
// // But must have NOT in background on iMac. Use AppleScript on Mac?
// // CORS/file:// stuff: toDataURL() getImageData() toBlob()
// //   XMLHttpRequest localStorage win.<userproperty> postMessage()
// // access-control-allow-origin (ACAO); images can be used in canvas, but make it "tainted"
//
//
// var chromb	= Boolean(win.chrome);
// var safari	= navigator.vendor && navigator.vendor.indexOf('Apple') > -1;
// var firefox	= navigator.userAgent.indexOf('Firefox')>0;
// var filep	= location.protocol=='file:';
//
// // This used to be used for loading corresponding small images
// // Now we just load one instance per image.
// ///var img1s = new Image();
// ///img1s.src = IMG1M;
// ///var img2s = new Image();
// ///img2s.src = IMG2M;
//
// // Use these globals to keep track of what the heck is going on with img loading
// var numimage = 0;
// var gotimage = 0;
// var numfread = 0;	// Number of uploaded (or drag-and-dropped) files read
// var fileread = 0;	// Binary [0,1]
// var gtime = 0;
//
//
// // Yeah yeah - too many globals!
//
// var can1, can2, can3;	// Visible (optionally) working canvases on screen
// var bcv1, bcv2;		// Corresponding big hidden canvases (full image)
// var ecv1, ecv2;		// Canvases to store original non-native images (eg TIF TIFF and BMP)
//
// ///var hcv1, hcv2;	// Corresponding backing canvases (for fade/sweep/viewer) - not working or used yet
//
//
// var ncan = 2;		// Number of visible canvases
// var canc;			// Current canvas
//
// var ctx1, ctx2;		// contexts (drawing) for main canvases
// var bcx1, bcx2;		// contexts (drawing) to hidden big canvases
// var hcx1, hcx2;		// contexts (drawing) to hidden backing canvases (unused)
//
// // These were int originally, now float
// var srcx1=0, srcy1=0;	// offset of image in canvas 1 (image coordinates)
// var srcx2=0, srcy2=0;	// offset of image in canvas 2 // 20150916
//
// var cdx, cdy, cmx, cmy;		// canvas down and canvas move mouse coordinates
// var rtx, rty, rtw=0, rth;	// viewer rectangle coordinates
// //var offsetX, offsetY;
//
// // Modes (undignified and disorganized)
// var dragflag = true;	// Normal mode - drag image around
// var rectflag = false;	// Draw a Viewer rectangle
// var polyflag = false;	// Draw a polygon an edge at a time
// var drawflag = false;	// Draw a curve/line
// var areaflag = false;	// Draw a many-sided arbitrary polygon
// var ctrlflag = false;	// For defining alignment control points
// var wipeflag = false;	// Sweeper/wiper gimmick
// var pickflag = false;	// Permit selection of objects
// var xxxxflag = false;	// cross-fade flag - test // 20170125
// var clipflag = 0;		// Use polygons to make clip path // 20170224
// // fadeflag??
// // stopflag?? Like dragflag but no dragging allowed
//
// var downflag = false;
//
// var NOSELECT	= -2;
// var VIEWSELECT	= -1;
// var selectflag	= NOSELECT; // which selected object we be talking about
// var selectpnt	= NOSELECT; // Which control point for alignment // 20171128
//
// var ff = 100;	// Fade factor
// var sf = 100;	// Scale factor
// var af = 40;	// Alpha factor // 20
// var mf = 100;	// Mask fade factor
// var jf = 80;	// JPG (jpeg) save quality
// var tf = 0;		// Angle (theta factor?!) // 20191210
//
// var savetype = 0;	// file save type: TXT HTM PNG JPG null TIF8G TIF24 TIF32 (BMP?)
//
// var showflag = 0;
// var SHOWNORM = 0;	// Show images, and objects according to their 'hide' flags
// var SHOWHIDE = 1;	// Show all objects regardless of 'hide' flags
// var SHOWNOBJ = 2;	// Show no objects, ie. images only
// var SHOWNIMG = 3;	// Show objects only, no images
// var SHOWOHID = 4;	// Show all objects regardless of 'hide' flags, and no images
// var SHOWINVT = 5;	// Show objects with 'inverted' background
//
// var polystrt = false;
// var displayflag = 2;	// 0==above  1==beside  2==auto  3==automax
//
// // Confusion exists among menuflag, showmenu(), and catpopup()!
// var menuflag = 0;	// Display state of the categories menu and counts divs // 20170122 change to 0
// var gridflag = 0;
// var fadeflag = 0;	// 0==SCALE 1==FADE 2==MASK 3==ALPHA 4==JPG 5==ANGLE
// var scalflag = 0;	// For experiments with different scaling techniques - always 0 for now
//
// // Top bar of controls not mentioned. METB is "messages" bar
// // These reflect the order of controls as defined in iat.html
// /** @const */ var FITB=0,VITB=1,EDTB=2,TOTB=3,PRTB=4, ALTB=5, CATB=6, HETB=7,  METB=8;
// /** @const */ var tbs=['fitb','vitb','edtb','totb','prtb'];
// /** @const */ var TBNORM='#555', TBHIGH='#000';
// var tbflags = [0,0,0,0,0,0,0,0,0];
// var tmb; // DOM top row buttons
//
// var hideflag = 0;	// Show/hide the entire toolpanel-and-categories area (except main menu)
// var prefflag = 0;	// Show/hide Preferences toolbar/subpanel
// var pathflag = 0;	// Show full path of images or not
// var consflag = 0;	// Constrain flag - image should fill canvas window at all times
// var smthflag = 1;	// Smooth flag - tell drawing contexts to draw images overscale smooth
// var mousflag = 1;	// Mousewheel flag - allow use of mousewheel (without SHIFT key)
// var corsflag = 0;	// 1-tchrome();	// CORS crossOrigin stuff
// // Should be 1 if installed at MLE (explore.mountainlegacy.ca) - set later on
// // Chrome://file does not like corsflag=1 for local files
// // Is it possible to always have set, then fall back to 0 if load attempts fails?
//
// // Regions and objects.
// // Make a region. Select a region. Apply transforms. Edit a region. Remove a region.
// // Region: type, colour, alpha, xform, Points
//
// var Points	= [];	// Vertices of polygons, rectangles, lines, ...
// var Regions	= [];	// Rects,Polys,Lines, etc.  // 0-4: [Points[],type,extent[x,y,w,h],hidden,colour]
// var CtrlPts	= [];	// Control points [x,y], for alignment
//
// // These all occur in each object
// var RPTS	= 0;	// Points array
// var RTYP	= 1;	// Type (0:poly or 1:curve)
// var REXT	= 2;	// Extent (x0,y0, x1,y1)
// var RHID	= 3;	// Hidden (0==visible 1==can1hide 2==can2hide 3==bothhide)
// var RCLR	= 4;	// Colour
// var RALP	= 5;	// Alpha (unimplemented)
//
//
// // A test CORS image that might or might not have ACOA. It appears it does.
// // A test image from MLE's Amazon S3 server - does not have CORS yet.
// // Another Amazon S3 example - it does have CORS, so works fine.
//
// var CI = "http://dab1nmslvvntp.cloudfront.net/wp-content/uploads/2015/12/1450377203cors-canvas.png";
// var CJ = "https://mlplibrary.s3.amazonaws.com/b84d9920-6f88-11e2-b15e-c82a14fffed2.jpeg";
// var CK = "http://360assets.s3.amazonaws.com/tours/8b16734d-336c-48c7-95c4-3a93fa023a57/1_AU_COM_180212_Areitbahn_Hahnkoplift_Bergstation.tiles/l2_f_0101.jpg";
//
//
// // Is it bad to do this before these big images are used? (page load time?)
// // imageloadfunction and imageerrorfunction
// // Note it should be possible to get filesize inside ilf // 20210204
//
// var ilf = function(e) { gotimage++; // numfread++; ?
//     cl('load done: numimage='+numimage+' gotimage='+gotimage); imgsfinish();
// }
// var ief = function(e) { var s='Error: image '+nm(e.target.src);
//     mess('ms-reg','Load image failure'); // numfail++:?
// }
//
// var img1 = new Image();
// var img2 = new Image();
// var img3 = new Image(); // null;
//
// // This destined for when we allow more than two images, but screwing up swap for now
// //var IMGS = [img1,img2,img3];
//
//
// // Should this stuff be in win.onload? No, because first images loaded already?
// // No longer. Images loaded after win.onload now. So ... could be in onload??
// img1.onload = img2.onload = img3.onload = ilf;
// img1.onerror = img2.onerror = img3.onerror = ief;
//
// // Still confined to 2 or less most of time, but leave room for three
// var filenames = ['','','']; // [img1.src,img2.src];
// var filesizes = [0,0,0];
//
// var msk1=new Image(), msk2=new Image(), msk3=new Image;	// Masks 20161122
// msk1.onload = msk2.onload = msk3.onload = ilf;
// msk1.onerror = msk2.onerror = msk3.onerror = ief;
// var MSKS = [msk1,msk2,msk3];
//
//
// // 20200821 Trying this runtime error (exception) system again
// win.onerror = function( msg, url, line, col, obj )
// {
//     mess('ms-reg','Runtime error: '+msg);
//     return false; // behaviour different if return true
// }
//
// /**
//  * Called after new image files are read and loaded
//  *
//  * @return {Object} query binding
//  */
//
// function imgsfinish()
// {
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     // Don't execute this function until the last image is loaded
//     // But then what happens if there is an error??
//     cl('imgsfinish? fileread='+fileread+' numimage='+numimage+' gotimage='+gotimage);
//     if (fileread==0 || numimage!=gotimage) return;
//
//     fileread = 0;
//
//     // It seems like we can't reset CORS until image finished loading 20160330
//     // We may have removed CORS for test loading of an external image - HACK
//     ///if (corsflag) img1.crossOrigin = img2.crossOrigin = '';
//
//     let W=I1.width, H=I1.height;
//     cl('images finished loading: ('+W+','+H+')'+(I2?' ('+I2.width+','+I2.height+')':''));
//     mess('ms-img','('+W+','+H+')');
//
//     // Would really like to see sizes when possible. Test.
//     ///getimgsize( 0, filenames[0] );
//     ///getimgsize( 1, filenames[1] );
//
//     // Clear big hidden canvases? Do both for now.  // (Should just do as necessary.)
//     if (gotimage>0)
//     {
//         // 20200716 not sure why we clear, perhaps because new canvases generated below
//         bcv1.width = bcv1.height = bcv2.width = bcv2.height= 0;
//         cl('Reset backing canvases');
//     }
//
//     showflag = SHOWNORM; // Are we sure we want to reset this?
//     gid('ss')[SI] = showflag;
//
//     if (displayflag===2 || displayflag===3) // auto and automax
//     {
//         canvasfit( displayflag===3 );
//     }
//     else
//     {
//         drawimages();	// Why draw here? Why draw everything??
//         drawobjects();	// Are the objects 'valid'?
//     }
//
//     // Remove this for now at least, since Align often applies to unequal sized images
//     ///if (gotimage>0) if (ncan>1) // HACK?
//     ///if (I2.width!=W || I2.height!=H)
//     ///al('WARNING: unequal image dimensions\n('+W+','+H+') and ('+I2.width+','+I2.height+')');
//
//     let i = gotimage; // numfread;
//     mess('ms-reg',(i?i:'No ')+' image file'+(i==1?'':'s')+' read'); // image files read
//     numimage = gotimage = 0;
//     //numfread = 0;
//
//     gtime = ts()-gtime;
//     //mess('ms-tm',l+' bytes, '+time+' ms');
//     messfns();
//     mess('ms-tm',gtime+' ms');
//
// } // imgsfinish
//
// /**
//  * Get image size
//  *
//  * @return {Object} query binding
//  */
//
// function getimgsize(i,s)
// {
//     let r=0, o=new XMLHttpRequest();
//     o.open('HEAD',s); // false==sync, true default
//     //o.setRequestHeader('Range', ''); // pathetic attempt with GET to get goddamn size?!
//     o.onreadystatechange = function()
//     {
//         //cl('AJAX (size): readystate='+o.readyState+' o.status='+o.status+' text='+o.statusText);
//         if (o.readyState!=4) return;// o.DONE?
//
//         // Note: can't seem to get size this way on Chrome, even AFAFF, even when CORS circumvented
//         if (o.status==200 || o.status==0)
//         {
//             r = o.getResponseHeader('Content-Length');
//             if (s=='') s = '(empty)';
//             if (s==null) s = '(null)';
//             cl('AJAX (size): size '+s+'='+r+' status='+o.status+' type='+o.responseType+' timeout='+o.timeout+' text='+o.statusText);
//         }
//         else
//         {
//             // file:// protocol and Chrome problem again!
//             cl('getimgsize error: xmlhttp status='+o.status);
//         }
//         filesizes[i] = parseInt(r);
//         if (i==1) messfns(); // HACK! Finished for sure?
//     };
//     o.send();
//
// } // getimgsize
//
//
// // Use AJAX (XHR/xhr) to get text file on server
// // See http://www.w3schools.com/ajax/tryit.asp?filename=tryajax_first
// // Maybe should write another version for loading local file? Is it possible (on Chrome)?
// // What about using this to load an image?
//
// function getjsonfile(f)
// {
//     let o=new XMLHttpRequest();
//
//     //if (corsflag) o.setRequestHeader('X-My-Custom-Header', 'blah'); // zinoui.com?!
//     o.open('GET',f);
//     o.overrideMimeType('application/json'); //20151219 stops "syntax error" in FF console
//
//     o.onreadystatechange = function()
//     {
//         if (o.readyState!=4) return;
//
//         let s=o.status, t=(s==200||s==0), r=t?o.responseText:'';
//
//         // Surprise! If using Chrome, and file: protocol (GC:f), status of 0 is returned
//         // Yet, status==0 could also mean failure to find this file?!
//         // But ... when AFAFF set, and a valid file (eg. self), a positive length!
//         // Why allow status==0 here? Fools FF(f). But GC:fa (with AFAFF) needs
//
//         ///tchf = 1; // HACK!
//         ///cl('Chrome and file:// protocol recognized (?)');
//
//         cl('AJAX: file='+f+' status='+s+' length='+r.length+' stattext='+o.statusText);
//
//         if (t&&r.length) loaddata(f,r,0);
//         else mess('ms-reg','File '+f+' not found');
//     };
//     o.send();
//
// } // getjsonfile
//
//
// /**
//  * Called after new image files are read and loaded
//  *
//  * @return {Object} query binding
//  */
//
// // Yet another AJAX routine! // 20200129
// // This one used to get an image file, but probably won't often work with file:// protocol
// // It might still be useful with server-based IAT
// // Called only from loadimage(), when src not JPG or PNG (currently only TIF)
//
// function getimgfile( img, f )
// {
//     let o = new XMLHttpRequest();
//     o.open('GET',f);
//     o.responseType = 'arraybuffer';
//     o.onreadystatechange = function()
//     {
//         if (o.readyState!=4) return;
//
//         // GC will return status 0 and stattext null with file:// and AFAFF, but success still
//         let s=o.status, t=(s==200||s==0), r=t?o.response:null; // not .result!
//         r = new Uint8Array(r); // Can't do ANYTHING with an ArrayBuffer until changed
//
//         cl('AJAX: image file='+f+' status='+s+' length='+(r?r.length:null)+' stattext='+o.statusText);
//
//         // How about gotimage and numimage and imgsfinish() and all that?!
//         if (t&&r&&r.length)
//         {
//             cl('AJAX image: success?! Image data retrieved ...');
//             // This code largely copied from filefunc
//             let R = readTIF(r.buffer);
//             if (!R)
//             {
//                 cl('Unimplemented TIF format option');
//                 mess('ms-reg','Unimplemented TIF format option');
//             }
//             else
//             {
//                 let ecv = img==img2 ? ecv2 : ecv1; // 20200216 HACK!
//                 ecv.width = R.width;
//                 ecv.height = R.height;
//                 gctx(ecv).putImageData( R, 0,0 );
//
//                 // No callback, so wrap up variables here
//                 // Similar code to loadimage() callback, ilf()
//                 gotimage++;
//                 cl('load done: numimage='+numimage+' gotimage='+gotimage);
//                 imgsfinish();
//             }
//         }
//         else
//         {
//             cl('AJAX image: failure?!');
//             mess('ms-reg','Cannot load '+f);
//         }
//     };
//     o.send(); // Could generate an error, eg. CORS policy
//
// } // getimgfile
//
//
// /**
//  * Called only from Swap button:
//  * - Swap must be redefined when nimgs>2
//  * - Object sets (all? selected?) can be swapped too. What about masks?
//  *
//  * @param {Event} e
//  * @return {Object} query binding
//  */
//
// function swapfunc(e)
// {
//     let sk = e?e.shiftKey:0; // swap objects/points
//     let ck = e?e.altKey||e.metaKey:0; // swap images and objects/points
//
//     let t, i,n;
//
//     // This hack below is to get focus on canvas without having to use mouse
//     canc.focus(); // HACK! // 20171130
//
//     if (ck||!sk) // swap images
//     {
//         t = img1; img1 = img2; img2 = t;
//         t = ecv1; ecv1 = ecv2; ecv2 = t;
//         t = bcv1; bcv1 = bcv2; bcv2 = t;
//         t = filenames[0]; filenames[0] = filenames[1]; filenames[1] = t;
//         t = filesizes[0]; filesizes[0] = filesizes[1]; filesizes[1] = t;
//         t = srcx1; srcx1 = srcx2; srcx2 = t;
//         t = srcy1; srcy1 = srcy2; srcy2 = t;
//
//         let I1 = bmpf && ecv1 && ecv1.width ? ecv1 : img1;
//         let I2 = bmpf && ecv2 && ecv2.width ? ecv2 : img2;
//         mess('ms-img','('+I1.width+','+I1.height+')'); // 20200216
//
//         messfns();
//     }
//     if (ck||sk) // swap objects/masks/points
//     {
//         t = msk1; msk1 = msk2; msk2 = t;
//         // Change all hide flags of all objects
//         for ( i=0,n=Regions.length; i<n; i++ )
//         {
//             let r=Regions[i], h=r[RHID];
//             if (h==1) r[RHID]=2; else if (h==2) r[RHID]=1;
//         }
//         // Align points too, if any (or if in Align mode?)
//         for ( i=1,n=CtrlPts.length; i<n; i+=2 )
//         {
//             t=CtrlPts[i]; CtrlPts[i]=CtrlPts[i-1]; CtrlPts[i-1]=t;
//         }
//     }
//
//     drawimages();
//     drawobjects();
//     t = ck?'Swap images and objects':sk?'Swap objects/masks':'Swap images';
//     mess('ms-reg',t);
//
// } // swapfunc
//
//
// /**
//  * Called only from buttons: 0-6: drag,poly,area,draw,viewer,Align,wipe
//  * - Also called from keydown shortcuts
//  * - Added Pick mode: allow selection and movement of objects
//  *
//  * @param m
//  * @param {Event} e
//  * @return {Object} query binding
//  */
//
// function modefunc(m,e)
// {
//     let n,p;
//
//     // Nine flags total, why not use setdrag()??
//     if (ctrlflag) if (m!==5) { ctrlflag = false; drawimages(); } // hack!?
//
//     mess('ms-reg',''); // 20171128
//     polyflag = areaflag = drawflag = rectflag = ctrlflag = wipeflag = pickflag = xxxxflag = false;
//
//     let sk = e?e.shiftKey:0; // Use with viewer and align
//     let ck = e?e.altKey||e.metaKey:0; // Use with Align
//
//     // Code copied from elsewhere. Need to undraw selected area.
//     // Maybe should only redraw last selected object (which would come to front)?
//
//     let oldselect = selectflag;
//     selectflag = NOSELECT; // Nothing selected (yet)
//     if (oldselect>VIEWSELECT) /// || (rectflag&&(rtw!=0||rth!=0)))
//     {
//         drawimages(); // Maybe should always know bounding box of visible objects?
//         if (!rectflag) drawobjects();
//     }
//
//
//     // HACK with dragflag
//     if (m!==1) polystrt = false; // HACK!?
//
//     switch(m){
//         case 0: // DRAG
//             dragflag = true;
//             mess('ms-mode','drag');
//             n = Regions.length;
//             mess('ms-reg','Drag: '+n+' region'+(n===1?'':'s'));
//             break;
//         case 1: // POLY
//             dragflag = false;
//             polyflag = true;
//             mess('ms-mode','poly');
//             if (polystrt) if (Points.length>2) finishpoly();
//             polystrt = false;
//             break;
//         case 2: // AREA
//             dragflag = false;
//             areaflag = drawflag = true;
//             mess('ms-mode','area');
//             break;
//         case 3: // LINE/CURVE
//             dragflag = false;
//             drawflag = true;
//             mess('ms-mode','line');
//             break;
//         case 4: // VIEWER
//             if (sk) return fullscreen(); // Overload with fullscreen
//             //if (ck) return showmenu(); // Another overload?!
//             dragflag = false;
//             rectflag = true;
//             mess('ms-mode','view');
//             mess('ms-reg','Viewer ...');
//             break;
//         case 5: // ALIGN
//             p = CtrlPts;
//             n = p.length;
//             if (sk)
//             {
//                 // Maybe should not allow unless ctrlflg and/or enough points?
//                 if (n>7) alignfunc4();
//                 else if (n>5) alignfunc3();
//                 return;
//             }
//             if (ck) if (n>1)
//             {
//                 // Try to align on first point. But which canvas?
//                 // And what about more than one point?
//                 //srcx1 -= p[0][0]-p[1][0];
//                 //srcy1 -= p[0][1]-p[1][1];
//                 srcx2 += p[0][0]-p[1][0];
//                 srcy2 += p[0][1]-p[1][1];
//             }
//             dragflag = false;
//             ctrlflag = true;
//             mess('ms-mode','align');
//             mess('ms-reg','Align: '+(n?''+n+' point'+(n<2?'':'s'):'Choose point '+(n+1)));
//             drawimages();
//             break;
//         case 6: // SWEEP
//             dragflag = false;
//             wipeflag = true;
//             mess('ms-reg','Sweep');
//             mess('ms-mode','sweep');
//             break;
//         case 7: // PICK
//             dragflag = false;
//             pickflag = true;
//             mess('ms-mode','pick');
//             mess('ms-reg','Select an object/area');
//             break;
//         case 8: // CROSSFADE (experiment?!)
//             dragflag = false;
//             xxxxflag = true;
//             //scalefunc(1);
//             mess('ms-mode','fade');
//             break;
//         default:
//     }
//
// }
//
// /**
//  * Set drag
//  *
//  * @return {Object} query binding
//  */
//
// function setdrag() // undignified?
// {
//     dragflag = true;
//     polyflag = areaflag = drawflag = rectflag = pickflag = ctrlflag = wipeflag = false;
//     mess('ms-mode','drag');
//     // Don't set the other message here, as it could overwrite another one
// }
//
//
// /**
//  * Called from imgsfinish(), displayfunc(), resizefunc() (problem?)
//  * Also called from filefunc when 3 images loaded - if we ever get that working.
//  * - f means maximize in both dimensions
//  * - g is optional, g===1 -> no fitfunc // 20170125
//  * Too close to canvasresize()
//  *
//  * @param f
//  * @param g
//  * @return {Object} query binding
//  */
//
// function canvasfit(f,g) // Adjust canvases to best fit window dimensions
// {
//     let I1 = bmpf && ecv1 && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2 && ecv2.width ? ecv2 : img2;
//
//     let WW=win.innerWidth, HH=win.innerHeight-toh();
//
//     let w,h,i=0, W=I1.width,H=I1.height; // What if img1 undefined, or a dimension is zero??
//
//     // displayflag  0==above  1==beside  2==auto  3==automax
//     // WARNING: Repeat code (see canvasresize()) and crappy constants
//     // WARNING: BORDER changes with window scaling! Don't know what to do with that (but see below)
//
//     doc.body.style.overflow = 'hidden';
//
//     // Dimensions for a single canvas
//     w = WW-2*MARGIN-2*BORDER>>0;
//     h = HH-2*MARGIN-2*BORDER>>0;
//     ///var r = gid('can1').getBoundingClientRect().width/can1.width; // Trying to figure out user scaling of browser
//
//
//     // Needs work!
//     if (ncan===1)
//     {
//     }
//     else if (ncan===3) // for now, just put beside each other
//     {
//         w = WW-4*MARGIN-6*BORDER-2; // A rank guess! HACK!
//         w = w/3>>0;
//         i = 1;
//     }
//     else
//     if (w*H < W*h) // 2 canvases above each other
//     {
//         h = HH-3*MARGIN-4*BORDER;
//         h>>=1;
//
//     }
//     else // 2 canvases beside each other
//     {
//         w = WW-3*MARGIN-4*BORDER-2; // The -2 is a HACK! Fudge factor to accommodate window scaling or something.
//         w>>=1;
//         i = 1;
//     }
//
//     gis('div1').display = i?'inline':'block';
//     gis('div2').display = ncan<2?'none':i?'inline':'block';
//     gis('div3').display = ncan<3?'none':'inline';
//
//     // Scale down the larger of canvas width and height to fit image dimension ratio
//     if (!f) if (W) if (H) if (h*W > w*H) h = w*H/W>>0; else w = h*W/H>>0;
//
//     // Code copied from canvasresize
//     if (w<MINWIDTH) w=MINWIDTH; // minimum width
//     if (h<MINWIDTH) h=MINWIDTH; // minimum height
//
//     can1.width = can2.width = w;
//     can1.height = can2.height = h;
//     if (ncan==3) can3.width = w, can3.height = h;
//
//     getcontexts();	// Canvases have changed, so have to set up contexts again (I think).
//     if (g===1) // 20170125
//     {
//         // Here, we avoid resetting scale and origin
//         setscale( sf/100 );
//         drawimages();
//         drawobjects();
//     }
//     else fitfunc();	// Fit and draw the images to the canvases
//
//     doc.body.style.overflow = 'auto';
//
//     mess1('in-can',w+','+h);
//
// }
//
// /**
//  * This messy function shares a lot of code with canvasfit(). Should probably be merged.
//  * - Called only from external buttons (once via inputfunc) for making canvases bigger/smaller
//  * - What happens if Display is set to auto or max though??
//  *
//  * @param f
//  * @param g
//  * @return {Object} query binding
//  */
//
// function canvasresize(e,x,y)
// {
//
//     let sk = e?e.shiftKey:0;
//     let ck = e?e.altKey||e.metaKey:0;
//
//     let w=e?can1.width:x, h=e?can1.height:y, m=e?sk?ck?100:20:ck?10:1:0;
//     w += m*x;
//     h += m*y;
//
//     if (w<MINWIDTH) w=MINWIDTH;
//     if (h<MINWIDTH) h=MINWIDTH;
//
//     ///body.style.overflow = 'hidden'; // Not working? Eg. make canvas too big and then back to same size?
//     can1.width = can2.width = w;
//     can1.height = can2.height = h;
//     if (can3.width) can3.width = w, can3.height = h;
//     ///body.style.overflow = 'auto';
//
//     mess1('in-can',w+','+h);
//
//     getcontexts(); // Canvases have changed, so have to set up contexts again (I think).
//     setscale(sf/100);
//
//     // Don't always have to do this?
//     drawimages();
//     drawobjects();
//
// } // canvasresize
//
// /**
//  * This messy function shares a lot of code with canvasfit(). Should probably be merged.
//  * - Called only from external buttons (once via inputfunc) for making canvases bigger/smaller
//  * - What happens if Display is set to auto or max though??
//  *
//  * @param f
//  * @param g
//  * @return {Object} query binding
//  */
//
// function getcontexts()
// {
//     ctx1 = gctx(can1);
//     ctx1.strokeStyle = LINECLR1;
//     ctx1.fillStyle = '#000000';
//     ctx1.lineWidth = LINEWIDTH;
//     ctx1.lineJoin = 'round'; // miter (dflt) round bevel
//
//     //ctx1.translate(0.5,0.5); // aliasing problems, linewidth==1 problems
//     //ctx1.imageSmoothingEnabled = true;
//     //aliasing/Aliasing: Bresenham?outline polys with lines?
//
//     ctx2 = gctx(can2);
//     ctx2.strokeStyle = LINECLR2;
//     ctx1.fillStyle = '#000000';
//     ctx2.lineWidth = LINEWIDTH;
//     ctx2.lineJoin = 'round';
//
//     //var oc = ctx1['origin-clean'];
//     //cl('ctx1 origin-clean: '+oc);
//     //for ( var key in ctx1 ) cl('\t '+key);
//
//     //if (ncan>2) ctx3 = gctx(can3);
// }
//
// // See https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
// // and https://codepo8.github.io/canvas-images-and-pixels/
//
// function ctxsmooth( ctx, b )
// {
//     let i=0,a=['i','mozI','webkitI','msI'],s='mageSmoothingEnabled'; // Correct! No first letter
//     for (;i<a.length;i++) ctx[a[i]+s]=b;
//     //ctx.imageSmoothingQuality = 'low'; // 'medium' 'high'
// }
//
//
// /**
//  * Called only from external 'Display' controls:
//  * - number (g===0) and orientation (g===1) // onchange? oninput?
//  * - g===1 -> e: 0==above  1==beside  3==auto 4==max
//  *
//  * @param e
//  * @param g
//  * @return {Object} query binding
//  */
//
// function displayfunc(e,g)
// {
//     let ii = 'inline'; // 'inline-block'; // 'inline';
//     let v = e; // e[SI]; // e.value; // e.target.value;
//     if (g===0) ncan = v+1;
//     else displayflag = v;
//
//     cl('displayfunc: v='+v+' g='+g+' ncan='+ncan);
//
//     // If canvas 2 removed, current canvas better be can1
//     if (ncan===1) if (canc!==can1)
//         canc = can1, mess('ms-ptr','('+cdx+','+cdy+') '+1);
//
//     // Get a real canvas for the 3rd canvas if necessary
//     if (g===0 && ncan===3) //  && can3.width)
//     {
//         can3.width = can1.width;
//         can3.height = can1.height;
//     }
//
//     // This is a mess, but we seem to avoid scroll probs on Chrome
//     let d=displayflag;
//     if (d===2 || d===3) // auto and automax (each apply to ncan==1,2,3)
//     {
//         canvasfit( d===3 );
//     }
//     else
//     {
//         doc.body.style.overflow = 'hidden';
//         gis('div1').display = ncan===1||d===0? 'block' : ii; // d>1?'block':v;
//         gis('div2').display = ncan<2 ? 'none' : d===1 ? ii : 'block';  // v;
//         gis('div3').display = ncan<3 ? 'none' : d===1 ? ii : 'block';
//         doc.body.style.overflow = 'auto';
//     }
//
// }
//
// /**
//  * Draw grids.
//  *
//  * @return {Object} query binding
//  */
//
// function drawgrids()
// {
//     // Draw square/diagonals on image
//     // Should have other grid options (eg. on canvas instead of image)
//     // Interacts with the darn scale matrix (remove temporarily?)
//
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     let C=[ctx1,ctx2],I=[I1,I2],X=[srcx1,srcx2],Y=[srcy1,srcy2];
//
//     // Draw visible canvas based grid // 20210308
//     for ( var i=0; i<2; i++ )
//     {
//         let c = C[i], w = c.canvas.width, h = c.canvas.height;
//         let d = 0.5; // Coordinate with linewidth
//         //cl('drawgrids: w='+w+' h='+h);
//         c.save();
//         c.setTransform(1,0,0,1,0,0);
//         c.strokeStyle = gridclr;
//         c.linewidth = 1;
//
//         c.beginPath();
//
//         c.moveTo((w>>2)+d,0);
//         c.lineTo((w>>2)+d,h);
//         c.moveTo((w>>1)+d,0);
//         c.lineTo((w>>1)+d,h);
//         c.moveTo((3*w>>2)+d,0);
//         c.lineTo((3*w>>2)+d,h);
//
//         c.moveTo(0,(h>>2)+d);
//         c.lineTo(w,(h>>2)+d);
//         c.moveTo(0,(h>>1)+d);
//         c.lineTo(w,(h>>1)+d);
//         c.moveTo(0,(3*h>>2)+d);
//         c.lineTo(w,(3*h>>2)+d);
//
//         c.stroke();
//         c.restore();
//     }
//
//
// }
//
//
// /**
//  * Draw images
//  *
//  * @param f
//  * @param g
//  * @return {Object} query binding
//  */
//
// function drawimages(f,g)
// {
//     // If canvas bigger than image, we could have artifacts from a previous image
//     // Must scale the width and height to fit the scaling matrix we are using
//     // Stupid! And maybe slow!! And potential pixel inaccuracies!!
//
//     // HACK TEST 20170422 BMP
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     cl('drawimages: f='+f+' g='+g);
//
//
//     if (1) if (scalflag===0)
//     {
//         // Should avoid doing this when possible
//         let w = can1.width*100/sf>>0, h=can1.height*100/sf>>0;
//         if (f!==2) ctx1.clearRect(0,0,w,h);
//         if (f!==1) ctx2.clearRect(0,0,w,h);
//         //ctxsmooth(ctx1,false);
//         //ctxsmooth(ctx2,false);
//     }
//
//     // These are the only flags indicating no images
//     if (showflag===SHOWNIMG || showflag===SHOWOHID) return;
//
//
//     // Currently, we allow one image to be moved independent of the other ... sometimes?!
//     // But why are these messages put here?
//     // Updated to allow float coordinates, but show integers only // 20180104
//     let x = canc===can1 ? -srcx1>>0 : -srcx2>>0;
//     let y = canc===can1 ? -srcy1>>0 : -srcy2>>0;
//     mess('ms-org','('+x+','+y+')');
//
//     /*
// 	if (srcx1==srcx2 && srcy1==srcy2)
// 		mess('ms-org','('+x+','+y+')');
// 	else
// 		mess('ms-org','('+-srcx1+','+-srcy1+') ('+-srcx2+','+-srcy2+')');
// 	*/
//
//     // Maybe should test if origin has actually changed, or if canvas size increased?
//     // That is, do not draw unless we have to.
//     // Use the hidden canvas if applicable.
//     // Draw with fade factor if applicable.
//     // Draw with mask fade if applicable 20161123
//
//     let v = g===1 ? mf : ff; // fade factor (default is ff, which might not be right?!)
//     let i = v;
//     v /= 100;
//
//     ///var b = hcv1.width>0; // Are we using the hidden canvas? (Not yet probably)
//     ///if (b) { ctx1.save(); ctx1.setTransform(1,0,0,1,0,0); ctx2.save(); ctx2.setTransform(1,0,0,1,0,0); }
//
//     // Canvas 1
//     if (f!==2)
//     {
//         ctx1.save();
//         if (clipflag) drawclip(ctx1,clipflag===2); // test 20170220
//         ///if (i<100) drawImage1( ctx1, g===1 ? msk1 : b?hcv2:bcv2.width>0?bcv2:img2, srcx2, srcy2 );
//         if (i<100) drawImage1( ctx1, g===1?msk1:bcv2.width>0?bcv2:I2, srcx2, srcy2 );
//         if (i<100) ctx1.globalAlpha = v;
//         ///drawImage1( ctx1, b?hcv1:bcv1.width>0?bcv1:img1, srcx1, srcy1 );
//         drawImage1( ctx1, bcv1.width>0?bcv1:I1, srcx1, srcy1 );
//         if (i<100) ctx1.globalAlpha = 1.0;
//         ctx1.restore();
//     }
//
//     // Canvas 2
//     if (ncan>1) // if (displayflag!=2) // HACK! Do not draw to hidden canvas.
//         if (f!==1)
//         {
//             ctx2.save();
//             if (clipflag) drawclip(ctx2,clipflag===2);
//             ///if (i<100) drawImage1( ctx2, g===1 ? msk2 : b?hcv1:bcv1.width>0?bcv1:img1, srcx1, srcy1 );
//             if (i<100) drawImage1( ctx2, g===1 ? msk2 : bcv1.width>0?bcv1:I1, srcx1, srcy1 );
//             if (i<100) ctx2.globalAlpha = v;
//             ///drawImage1( ctx2, b?hcv2:bcv2.width>0?bcv2:img2, srcx2, srcy2 );
//             drawImage1( ctx2, bcv2.width>0?bcv2:I2, srcx2, srcy2 );
//             if (i<100) ctx2.globalAlpha = 1.0;
//             ctx2.restore();
//         }
//
//     // Canvas 3 - HACK!
//     if (can3.width>0 && img3.src) //img3!=null)
//     {
//         let ctx3 = gctx(can3);
//         cl('draw 3rd image, src='+img3.src+' width='+can3.width);
//         drawImage1( ctx3, img3, srcx2, srcy2 );
//     }
//     else if (can3.width && bcv2.width) // 20180314 try to drag the counts window?!
//     {
//         // Not working yet. Need to retain a 3rd big canavs?
//         let ctx3 = gctx(can3);
//         let s = 1; // sf/100;
//         cl('draw 3rd image, width='+can3.width+' backwidth='+bcv2.width);
//         //drawImage1( ctx3, bcv2, srcx1, srcy1 );
//         ctx3.drawImage( bcv2, 0,0, bcv2.width,bcv2.height, s*srcx1,s*srcy1, s*w, s*h );
//     }
//
//     ///if (b) { ctx1.restore(); ctx2.restore(); }
//
//     if (gridflag) drawgrids(); // Would we ever want a grid on top of masks? Why not?
//     if (ctrlflag) drawpoints( CtrlPts );
//
// } // drawimages
//
//
// /**
//  * Draw images
//  *
//  * @param f
//  * @param g
//  * @param ctx
//  * @return {Object} query binding
//  */
//
// function drawobjects( f, g, ctx ) // Draw the viewing rectangle (if there), and the polygons/areas/lines defined by user
// {
//     // f===1 (optional) => ignore an object's "hidden" flag, (ie. draw regardless)
//     // g===1 (optional) => mask draw (ie. full colour, no borders)
//     // g===2 (optional) => mask draw to hidden fullsize canvases
//     // ctx (optional, used only from drawbigmask(), and with g===2 (?))
//
//     // Should draw according to slider (or object) alpha setting. Not done yet.
//
//     // If viewer rectangle is selected, maybe should be drawn after?
//     // If mask draw, perhaps draw to hidden canvas(es), then copy to shown ones?
//     // Should we try our own clipping?
//
//     ///if (showflag==SHOWNOBJ) return;
//
//     // HACK TEST 20170501 BMP // Do we need a backing image, or backing canvas?
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//
//     if (g!==1&&g!==2) if (rtw!==0) // Draw the viewer
//     {
//         //var x=rtx,y=rty,w=rtw,h=rth;
//         let x1=rtx,y1=rty, x2=x1,y2=y1, w=rtw,h=rth;
//         x1+=srcx1,y1+=srcy1;
//         x2+=srcx2,y2+=srcy2;
//
//         let t = bcv1.width!==0 ? bcv1 : I1;
//         let b = bcv2.width!==0 ? bcv2 : I2;
//         drawrect( ctx1, b, x1,y1, w,h, 0 );
//         drawrect( ctx2, t, x2,y2, w,h, 0 );
//
//         // Outlines
//         ctx1.lineWidth = 50/sf;
//         ctx2.lineWidth = 50/sf;
//         ctx1.strokeRect( x1,y1, w,h );
//         ctx2.strokeRect( x2,y2, w,h );
//     }
//     if (showflag===SHOWNOBJ) return;
//
//
//     for ( let i=0,l=Regions.length; i<l; i++ ) // draw each object
//     {
//         let P = Regions[i][RPTS]; // Does this copy whole array?? I hope not.
//         let h = Regions[i][RHID]; // Hidden flag.
//         let c = Regions[i][RCLR]; // Colour
//         let w = LINEWIDTH;
//         //var a = ALPHA;
//         if (Regions[i][RTYP]===0) // area
//         {
//             //var fclr = selectflag==i ? SELECTCLR : c;
//             let fclr = c; // 20180314
//             let a = selectflag===i ? 1.0 : ALPHA;
//
//             let t = bcv1.width!==0 ? bcv1 : I1;
//             let b = bcv2.width!==0 ? bcv2 : I2;
//             if (showflag===SHOWINVT) b = t = null;
//
//             if (g===1||g===2) { b=null; t=null; w=0; a=1.0; } // mask draw
//             if (f===1||h===0||h===1) drawpoly( ctx1, P, c, fclr, w,  b, a );
//             if (f===1||h===0||h===2) drawpoly( ctx2, P, c, fclr, w,  t, a );
//
//             // Very messy code.
//             // Apparently bcx1 and bcx2 are set already. (?)
//             if (g===2) if (ctx!=bcx2) if (f===1||h==0||h==1) drawpoly( bcx1, P, c, fclr, w,  b, a );
//             if (g===2) if (ctx!=bcx1) if (f===1||h==0||h==2) drawpoly( bcx2, P, c, fclr, w,  t, a );
//         }
//         else // curve
//         {
//             if (f===1||h==0||h==1) drawcurve( ctx1, P, c, w );
//             if (f===1||h==0||h==2) drawcurve( ctx2, P, c, w );
//             // What about drawing "curves" to big canvases??
//         }
//     }
//
// } // drawobjects
//
//
// function drawrect( ctx, img, x,y, w,h, i ) // Draw a rectangle, negative coordinates allowed
// {
//     // Not sure if should do this for non-aligned images, or not
//     // Not sure whether to use srcx1 etc. in here or not
//     ///var xs=ctx==ctx1?srcx1:srcx2, ys=ctx==ctx1?srcy1:srcy2; // 20180104
//
//     let xs = ctx==ctx1 ? srcx1 : srcx2;
//     let ys = ctx==ctx1 ? srcy1 : srcy2;
//     let xd = ctx==ctx1 ? srcx1-srcx2 : 0;
//     let yd = ctx==ctx1 ? srcy1-srcy2 : 0;
//
//     // Must get upper left corner and positive width and height
//     if (w<0) { x+=w; w=-w; }
//     if (h<0) { y+=h; h=-h; }
//
//     // API: void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
//     x-=i; y-=i; w+=i*2; h+=i*2; // HACK, to allow erasing of slightly bigger rectangle (eg. with a border)
//     // Perhaps the hack is not necessary if using floating point coordinates?
//     ///cl('drawrect: w='+w+' h='+h);
//     ///if (w&&h) ctx.drawImage( img, x-srcx1,y-srcy1, w,h, x,y, w,h ); // What about fade (alpha?)
//     if (w&&h) ctx.drawImage( img, x-xs,y-ys, w,h, x-xd,y-yd, w,h ); // What about fade (alpha?)
// }
//
//
//
// function drawpoly( ctx, P, lclr, fclr, lwid,  img, alpha )
// {
//     let i,l;
//
//     // Is the save/restore routine expensive?
//     // Is it necessary for repeated polygon draws?
//     ctx.save();
//
//     //ctx.imageSmoothingEnabled = false;
//     //ctxsmooth(ctx,false); // doesn't work I think // only for images
//
//     ctx.beginPath();
//     if (ctx==bcx1 || ctx==bcx2) // HACK!!
//     {
//         // Points are in image coordinates already
//         ctx.moveTo( P[0][0], P[0][1] );
//         for ( i=1,l=P.length; i<l; i++ )
//             ctx.lineTo( P[i][0], P[i][1] );
//     }
//     else
//     {
//         // Must convert Points to canvas coords
//         ctx.moveTo( P[0][0]+srcx1, P[0][1]+srcy1 );
//         for ( i=1,l=P.length; i<l; i++ )
//             ctx.lineTo( P[i][0]+srcx1, P[i][1]+srcy1 );
//     }
//     ctx.closePath();
//
//     // lwid==0 means no border
//     if (lwid>0) // Draw a polygon outline
//     {
//         ctx.lineWidth = lwid;
//         ctx.strokeStyle = lclr;
//         ctx.stroke();
//     }
//
//     if (showflag!=SHOWNIMG&&showflag!=SHOWOHID) // Should these be in here??
//         if (img!=null) // Show alternative image within the object
//         {
//             ctx.clip();
//             ctx.globalAlpha = alpha;
//             ctx.drawImage( img, srcx1, srcy1 );
//         }
//
//     if (fclr!=0) // Fill in the polygon with show-through colour
//     {
//         if (showflag==SHOWNIMG||showflag==SHOWOHID) ctx.globalAlpha = 1.0;
//         else if (img!=null || showflag==SHOWINVT) ctx.globalAlpha = af/100;
//         ctx.fillStyle = fclr;
//         ctx.fill(); // 'nonzero' default or 'evenodd'
//     }
//     ctx.restore();
//
// } // drawpoly
//
//
// //ctx.fillStyle = 'rgba(0,255,0,0.5)';
// //ctx.imageSmoothingEnabled=true; // for scaling with drawImage??
// //ctx.mozImageSmoothingEnabled=true; // for scaling with drawImage??
// //ctx.imageSmoothingQuality('low');
// //ctx.translate(0.5,0.5); // avoid aliasing of lines?
//
// function drawcurve( ctx, P, lclr, lwid )
// {
//     ctx.save();
//
//     ctx.beginPath();
//     ctx.moveTo( P[0][0]+srcx1, P[0][1]+srcy1 );
//     for ( var i=1,l=P.length; i<l; i++ )
//         ctx.lineTo( P[i][0]+srcx1, P[i][1]+srcy1 );
//
//     ctx.linewidth = lwid;
//     ctx.strokeStyle = lclr;
//     ctx.stroke();
//
//     ctx.restore();
// }
//
//
// function finishpoly()
// {
//     // HACK TEST 20170422 BMP
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     // Draw polygon outline (necessary?)
//     ctx1.closePath();
//     ctx1.stroke();
//     ctx2.closePath();
//     ctx2.stroke();
//
//     // Permit drawing outside canvas boundaries, but then must clip out some stuff
//     let p = Points.length;
//     Points = clippoly( Points,[[0,0],[I1.width,0],[I1.width,I1.height],[0,I1.height]]);
//     simplifypoly(Points);
//
//     // Draw the opposite image in each canvas
//     let lclr = 0; // LINECLR1;
//     let fclr = fillclr; // SELECTCLR;
//     let a = 1.0; // ALPHA
//
//     let t = bcv1.width!=0 ? bcv1 : I1;
//     let b = bcv2.width!=0 ? bcv2 : I2;
//     if (showflag==SHOWINVT) t = b = null;
//
//     drawpoly( ctx1, Points, lclr, fclr, LINEWIDTH,  b, a );
//     drawpoly( ctx2, Points, lclr, fclr, LINEWIDTH,  t, a );
//
//     // Must store in image coordinates, not canvas coordinates! Also, zoom factor.
//     let rect = [BIG,BIG,-BIG,-BIG];
//     getextents( Points, rect );
//     Regions.push( [Points,0,rect,0,fillclr] );
//
//     // New polygon is selected.
//     selectflag = Regions.length - 1;
//     mess('ms-reg','New polygon, '+Points.length+' vertices (orig '+p+')');
//
//     setdrag(); // Go back to standard mode (should we?)
//
// } // finishpoly
//
//
// /*
// var RPTS	= 0;	// Points array
// var RTYP	= 1;	// Type (0:poly or 1:curve)
// var REXT	= 2;	// Extent (x0,y0, x1,y1)
// var RHID	= 3;	// Hidden
// var RCLR	= 4;	// Colour
// var RALP	= 5;	// Alpha (unimplemented)
// */
//
// function polypath( ctx, P ) // Only used in drawclip()
// {
//     // Must convert Points to canvas coords
//     ctx.moveTo( P[0][0]+srcx1, P[0][1]+srcy1 );
//     for ( var i=1,l=P.length; i<l; i++ )
//         ctx.lineTo( P[i][0]+srcx1, P[i][1]+srcy1 );
//     ctx.closePath();
// }
//
//
// // Use objects (if any) as a clip mask for this context
// // I forget what this was used for ... long ago
//
// function drawclip( ctx, invert )
// {
//     let i=0,f=0,l=Regions.length, c,w,h,R;
//     if (!l) return;
//
//     for ( ; i<l; i++ )
//     {
//         // Should check for being area (RTYP), hidden (RHID), etc.
//         // Also, only selected polygons and/or categories?
//         R = Regions[i];
//         if (R[RTYP] || R[RPTS].length<3) continue;
//
//         if (!f) { f=1; ctx.beginPath(); }
//         polypath( ctx, R[RPTS] );
//     }
//
//     //cl('drawclip: f='+f+' invert='+invert);
//     if (f && invert) // inverse mask draw: path of entire canvas perimeter
//     {
//         //cl('invert clip');
//         // Awkward (and confusing) to have to scale here
//         c = ctx.canvas, w = c.width*100/sf>>0, h = c.height*100/sf>>0;
//         polypath( ctx, [[0,0],[0,h],[w,h],[w,0]] ); // CCW
//     }
//     if (f) ctx.clip();
//
// } // drawclip
//
//
// // Simple drag of entire canvas(es) over image(s). Adjust the canvas origin
// // Flag f says ?? about srcx1 srcx2 srcy1 srcy2
// // Flag g says force drawing of objects
// // Called only from mm() (mousemove)
//
// function dragimages( f,g, dx, dy )
// {
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     // If shift key is down, move only one image.
//     // This is a hack for alignment experiments.
//     let a=canc===can1, ox1=srcx1, ox2=srcx2, oy1=srcy1, oy2=srcy2, t;
//
//     // When constrain, there are min and max limits on srcx and srcy
//     let ff = 100/sf;
//     /*
// 	srcx1 = (f||a)?srcx1+(dx*100/sf)>>0:srcx1;
// 	srcy1 = (f||a)?srcy1+(dy*100/sf)>>0:srcy1;
// 	srcx2 = (f||!a)?srcx2+(dx*100/sf)>>0:srcx2;
// 	srcy2 = (f||!a)?srcy2+(dy*100/sf)>>0:srcy2;
// 	*/
//     srcx1 = (f||a)?srcx1+dx*ff:srcx1;
//     srcy1 = (f||a)?srcy1+dy*ff:srcy1;
//     srcx2 = (f||!a)?srcx2+dx*ff:srcx2;
//     srcy2 = (f||!a)?srcy2+dy*ff:srcy2
//
//     //srcx1 = srcx2 = srcx1 + dx*ff;
//     //srcy1 = srcy2 = srcy1 + dy*ff;
//
//     // Doing this is bad when high zoom
//
//     /*
// 	srcx1>>=0;
// 	srcx2>>=0;
// 	srcy1>>=0;
// 	srcy2>>=0;
// 	*/
//
//     // WARN: repeat code in constrain()
//     // WARN: does not work for srcx1!=srcx2!
//     if (consflag)
//     {
//         if (srcx1>0) srcx1=srcx2=0;
//         if (srcy1>0) srcy1=srcy2=0;
//         if (t=100*can1.width/sf-I1.width>>0,srcx1<t) srcx1=srcx2=t;
//         if (t=100*can1.height/sf-I1.height>>0,srcy1<t) srcy1=srcy2=t;
//     }
//
//     // Should not redraw unless one or more of coordinates changed
//     if (ox1===srcx1 && ox2===srcx2 && oy1===srcy1 && oy2===srcy2) return;
//
//     // If alt/ctrl key is down, do not draw objects to save drawing time
//     drawimages();
//     if (g||showflag==SHOWNIMG||showflag==SHOWOHID) drawobjects();
//
// } // dragimages
//
//
// function wipefunc(cx,cy)
// {
//     // Get the orginal image, or the original canvas, or the big hidden canvas
//     ///var I1 = bmpf && ecv1.width ? ecv1 : img1;
//     ///var I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     let I1 = getbcvs(1); // test 20171212
//     let I2 = getbcvs(2);
//
//     let x = cx*100/sf>>0;
//     if (x<0) x=0; // return; // Must still draw in case last x was greater than 0
//
//     // Does anyone find these coordinates intuitive?! Not me.
//     // Not working on FF?! Or Safari?! Coordinates and dimensions must be "sensible"
//     // Still can't make it work on Safari // 20151218
//
//     let sx=-srcx1+x, sy=-srcy1, dx=x, dy=0;
//     let w=min(I1.width,I2.width), h=min(I1.height,I2.height);
//
//     ///cl([sx,sy, dx,dy]);
//     if (sx<0) {dx+=sx;sx=0;} // FF is picky about parameters
//
//     //ctx1.drawImage( img2, x-srcx1,srcy1 );
//     //ctx1.drawImage( img2, x-srcx1,srcy1, w,h, 0,0, w,h );
//
//     if (ncan>0)
//     {
//         ctx1.drawImage( I1, srcx1,srcy1 );
//         ctx1.drawImage( I2, sx,sy, w,h, dx,dy, w,h );
//     }
//     if (ncan>1)
//     {
//         ctx2.drawImage( I2, srcx1,srcy1 );
//         ctx2.drawImage( I1, sx,sy, w,h, dx,dy, w,h );
//     }
//
// } // wipefunc
//
//
//
// //+ Jonas Raoni Soares Silva
// //@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]
//
// function isPointInPoly(P,p)
// {
//     for (var c=false, i=-1, l=P.length, j=l-1; ++i<l; j=i)
//         ((P[i][1]<=p[1] && p[1]<P[j][1]) || (P[j][1]<=p[1] && p[1]<P[i][1]))
//         && (p[0]<(P[j][0]-P[i][0]) * (p[1]-P[i][1]) / (P[j][1]-P[i][1])+P[i][0])
//         && (c=!c);
//     return c;
// }
//
// function collinear(p1,p2,p3,t) // t is a tolerance, usually 0, maybe 1 or 2
// {
//     // Check for p2 between p1 and p3 too??
//     // var b = p1[0]<=p2[0] && p2[0]<=p3[0] || p1[0]>=p2[0] && p2[0]>=p3[0] etc.
//     let x = p1[0]*(p2[1]-p3[1]) + p2[0]*(p3[1]-p1[1]) + p3[0]*(p1[1]-p2[1]);
//     return t?!(x<-t||x>t):!x;
// }
//
// // Remove collinear points in a points array
//
// function simplifypoly(P,t) // t is a tolerance, usually 0, maybe 1 or 2
// {
//     let i=0,j=2,k=P.length;
//     for (;j<k;j++)
//         if (collinear(P[i],P[i+1],P[j],t)) P[i+1]=P[j]; else P[i+++2]=P[j];
//     //P[collinear(P[i],P[i+1],P[j])?i+1:i+++2] = P[j];
//     return P.length = i+2; // truncate
// }
//
//
// // A bug allowing float coordinates got in there. Use this to fix 20180221
//
// function simplifyregions()
// {
//     let R=Regions,P, i,j;
//     for ( i=0; i<R.length; i++ ) // each region/object
//     {
//         for ( P=R[i][RPTS],j=0; j<P.length; j++ ) // each vertex/point
//             P[j][0]=P[j][0]+.5>>0, P[j][1]=P[j][1]+.5>>0;
//
//         let rect = [BIG,BIG,-BIG,-BIG];
//         getextents( P, rect );
//         R[i][REXT] = rect;
//     }
// }
//
//
// function getextents(P,R) // Get enclosing rectangle R for set of points (vertices) P
// {
//     for (let i=0,l=P.length;i<l;i++) // [minx,miny,maxx,maxy]
//     {
//         if (P[i][0]<R[0]) R[0]=P[i][0]; else if (P[i][0]>R[2]) R[2]=P[i][0];
//         if (P[i][1]<R[1]) R[1]=P[i][1]; else if (P[i][1]>R[3]) R[3]=P[i][1];
//     }
// }
//
//
// function setclr(c,n)
// {
//     let C = gid('clr2');
//     C.value = fillclr = c;
//     gid('ctext').value = n;
//
//     if (safari) // HACK! Although maybe post-9 Safari works? 20180220
//     {
//         C.style.background = c;
//         C.setAttribute('type','text');
//         C.style.width = '50px';
//         C.style.verticalAlign = 'baseline';
//     }
// } // setclr
//
// // Should these be set on mousedown??
// // omx and omy are for dragging around the viewer or objects
// var omx=BIG,omy;	// BIG means no previous mouse point yet
// var lmx,lmy;		// save last mouse x, mouse y
//
// function getmouse(e,c) // c is a canvas - get canvas coordinates of mouse
// {
//     // Accessing the DOM too much? Aren't we supposed to use offsetX and offsetY?
//     // Compare with eg: view-source:http://rectangleworld.com/demos/SimpleDragging/SimpleDragging
//
//     let r = c.getBoundingClientRect(); // e.target.offsetLeft/Top
//     let x = e.clientX - BORDER - r.left >> 0;
//     let y = e.clientY - BORDER - r.top >> 0; // Firefox gets non-whole numbers?!
//
//     // Multiply by eg. c.width/r.width? Maybe happens with scaling?
//     //var x = e.clientX - offsetX; var y = e.clientY - offsetY;
//     //var left = ev.clientX - r.left - this.clientLeft + this.scrollLeft;
//     // Also, for window zoom, doc.width and/or window.devicePixelRatio
//     // width clientWidth innerWidth ...
//     // https://htmldoodads.appspot.com/dimensions.html
//
//     return [x,y];
// }
//
// function cm(e) // contextmenu - target is a canvas // 20171211
// {
//     // Here, we can intercept rightmouse/contextmenu,
//     // and if click over something interesting, do something new
//     // Perhaps only do in certain modes (contexts)
//     // rightmouse event comes first
//     /*
// 	cl('contextmenu event: e.which='+e.which);
// 	if (1) return true;
//
// 	e.preventDefault();
// 	return false;
// 	*/
//
// } // cm contextmenu
//
//
//
// // HAVE TO ADD MOUSEDOWN FOR 3RD CANVAS (to select it)
//
// // Problem with GC with mousemove immediately following mousedown ... sometimes
// var mdflag=0; // 20171218
//
// function md(e) // mousedown - target is a canvas (maybe with border)
// {
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     let i,j,l,n, f, x,y,w,h, s, vx,vy,xx,yy, p,P, t,b;
//
//     //e.preventDefault();
//     //doc.body.onselectstart = function() { return false; }
//
//     // Eventually, we may steal the rightmouse action away from browser's default,
//     // which is generally save the image (not too useful in canvas), or "inspect"
//     ///cl('mousedown: which='+e.which);
//     /*
// 	if (e.which==3) // rightmouse seems to always be 3
// 	{
// 		// This was an experiment to try to stop the contextmenu,
// 		// but that action would be done elsewhere, after trap contextmenu event
// 		cl('mousedown: rightmouse 5, which='+e.which);
// 		e.preventDefault();
// 		e.stopPropagation();
// 		return false;
// 	}
// 	*/
//
//     if (e.which!=1) return; // Avoid rightmouse etc. (robust enough?)
//     if (e.ctrlKey) return; // Seems to have reserved meaning on mac?!
//
//
//     downflag = true;
//     mdflag = 1;
//
//     let sk = e.shiftKey;		// Indicates drag object
//     let ck = e.altKey||e.metaKey;	// Indicates drag image
//
//     // Should we redraw previous selection, if it exists?? It has wrong colour.
//     // Also have to redraw if any objects and we're drawing a viewer
//     // (in which case no objects drawn for now).
//
//     let oldselect = selectflag;
//     selectflag = NOSELECT; // Nothing selected (yet)
//     if (oldselect>VIEWSELECT || (rectflag&&(rtw!=0||rth!=0)))
//     {
//         drawimages(); // Maybe should always know bounding box of visible objects?
//         if (!rectflag) drawobjects();
//     }
//
//     canc = e.target;	// Which canvas are we in?
//     canc.focus();		// Needed for keyboard events (should we use mouseover/out?)
//
//     // Canvas coordinates, visual coordinates, and image coordinates
//     // Globals cdx,cdy, lmx,lmy, srcx1,srcy1;
//     p = getmouse(e,canc);
//     cdx = lmx = p[0];
//     cdy = lmy = p[1];
//
//     vx = cdx*100/sf>>0;
//     vy = cdy*100/sf>>0;
//
//     xx = vx - srcx1>>0;
//     yy = vy - srcy1>>0;
//
//     mess('ms-ptr','('+cdx+','+cdy+') '+(canc===can1?'1':'2'));
//     mess('ms-mov','');
//     //cl('mousedown ('+cdx+','+cdy+')');
//
//
//     if (rectflag)
//     {
//         // Perhaps should check for near rect edge, then allow stretch?
//         // But should probably be actually inside or right on the edge
//         can1.style.cursor = CURSRECT;
//         can2.style.cursor = CURSRECT;
//
//         // If not in the current rect (if exists), erase it. Probably starting a new one.
//         if (rtw!=0||rth!=0)
//         {
//             // Because of extra dimensions, have to organize coordinates!?
//             x=rtx, y=rty, w=rtw, h=rth, i=LINEWIDTH;
//
//             doc.title = 'viewer'; // test - some programs put dimensions in title
//
//             // Is this correct? What if canvas 2, and/or origin is shifted?
//             x+=srcx1;
//             y+=srcy1;
//
//             t = bcv1.width!=0 ? bcv1 : I1;
//             b = bcv2.width!=0 ? bcv2 : I2;
//             drawrect( ctx1, t, x, y, w, h, i );
//             drawrect( ctx2, b, x, y, w, h, i );
//             rtw=rth=0;
//         }
//
//         // The rest of the drawing will happen on mousemove
//
//     } // rect md
//
//
//     ///if (showflag!=SHOWNOBJ)
//     // 20170123 must doublecheck that !ck part
//
//     if (dragflag && !ck) // See if inside one of our regions
//     {
//         // First, see if within the viewer
//         x=rtx, y=rty, w=rtw, h=rth;
//
//         //if (isPointInPoly( [[x,y],[x+w,y],[x+w,y+h],[x,y+h]], [xx,yy] ))
//         if (xx>x && xx<x+w && yy>y && yy<y+h) // faster, simpler
//         {
//             mess('ms-reg','Viewer selected');
//             selectflag = VIEWSELECT;
//         }
//         else
//         {
//             mess('ms-reg',' '); // 20200907 // Not sure when to get rid of message
//         }
//     } // drag md
//
//     if (pickflag) // This used to be joined with the above
//     {
//         //else
//         if (showflag!=SHOWNOBJ)
//         {
//             // Check to see if within one of our other non-hidden objects.
//             // What if within several objects at once? We'll iterate through all of them.
//             for ( j=0,l=Regions.length; j<l; j++ )
//             {
//                 // Start at one past the last selected object, if applicable
//                 // But if shiftkey pressed, do not cycle because going to drag the object
//                 i = oldselect>VIEWSELECT ? (j+oldselect+(sk?0:1))%l : j;
//
//                 // Ignore any objects that are truly hidden
//                 h = Regions[i][RHID];
//                 s = showflag;
//                 f = s==SHOWNORM||s==SHOWINVT||s==SHOWNIMG;
//                 if (f) if (canc===can1 && (h==2||h==3)) continue;
//                 if (f) if (canc===can2 && (h==1||h==3)) continue;
//
//                 P = Regions[i][RPTS]; // I hope this is just a reference?!
//
//                 if (P.length>0) if (isPointInPoly( P, [xx,yy] ))
//                 {
//                     // We have found an object to select
//                     selectflag = i;
//                     let lclr = '#000000'; // '#00ff00'; // HACK! constant // 20180222
//                     let fclr = Regions[i][RCLR]; // SELECTCLR; // 20180222
//
//                     // Draw the selected region
//                     // Maybe should not draw in the canvas where it is hidden??
//                     if (!Regions[i][RTYP])
//                     {
//                         t = bcv1.width!=0 ? bcv1 : I1;
//                         b = bcv2.width!=0 ? bcv2 : I2;
//
//                         ///if (showflag==SHOWINVT) b = t = null;
//                         if (showflag!=SHOWINVT) b = t = null; // 20180222
//
//                         drawpoly( ctx1, P, lclr, fclr, LINEWIDTH,  b, ALPHA );
//                         drawpoly( ctx2, P, lclr, fclr, LINEWIDTH,  t, ALPHA );
//                     }
//                     else
//                     {
//                         drawcurve( ctx1, P, lclr, LINEWIDTH );
//                         drawcurve( ctx2, P, lclr, LINEWIDTH );
//                     }
//                     mess('ms-reg','Region '+i+', '+Regions[i][RPTS].length+' vertices');
//                     break;
//                 }
//             }
//             if (j==Regions.length) // Didn't find anything
//             {
//                 f=canc===can1, w=I1.width, h=I1.height;
//                 mess('ms-reg','Canvas '+(f?1:2)+' - nothing selected');
//
//                 // What's this about?? Set displayed w/h to current canvas I guess
//                 if (w!=I2.width||h!=I2.height)
//                 {
//                     w = f?w:I2.width;
//                     h = f?h:I2.height;
//                     mess('ms-img','('+w+','+h+')');
//                 }
//             }
//         }
//         can1.style.cursor = CURSDRAG;
//         can2.style.cursor = CURSDRAG;
//     } // pick md
//
//     if (polyflag)
//     {
//         if (!polystrt) // First polygon vertex
//         {
//             polystrt = true;
//             Points = [];
//
//             Points.push([xx,yy]);
//
//             ctx1.beginPath();
//             ctx1.moveTo(vx,vy);
//             ctx2.beginPath();
//             ctx2.moveTo(vx,vy);
//             mess('ms-reg','Start polygon');
//         }
//         else // New polygon vertex
//         {
//             Points.push([xx,yy]);
//
//             ctx1.lineTo(vx,vy);
//             ctx1.stroke();
//             ctx2.lineTo(vx,vy);
//             ctx2.stroke();
//             mess('ms-reg','Polygon, '+Points.length+' vertices');
//         }
//     } // poly md
//
//     if (drawflag) // Starting to draw an area or a curve
//     {
//         // Should points be in canvas coords until simplification? Clipping?
//         ///drawstrt = true;
//         Points = [];
//         Points.push([xx,yy]);
//
//         ctx1.beginPath();
//         ctx1.moveTo(vx,vy);
//         ctx2.beginPath();
//         ctx2.moveTo(vx,vy);
//     } // draw md
//
//     if (ctrlflag) // Define or select a control point
//     {
//         P = CtrlPts;
//         n = P.length;
//         if (ck)
//         {
//             for ( i=0,w=30*100/sf; i<n; i++ ) // 30 is number of canvas pixels to be within
//                 if ( j=P[i][0]-xx,j>-w&&j<w ) if (j=P[i][1]-yy,j>-w&&j<w ) break;
//             if (i<n) { selectpnt = i; mess('ms-reg','Align: Select '+(i+1)+
//                 ': ('+(P[i][0])+','+(P[i][1])+')'); }
//             else { selectpnt = NOSELECT; mess('ms-reg','Align: no select'); }
//         }
//         else
//         {
//             P.push([xx,yy]);
//             selectpnt = NOSELECT;
//             mess('ms-reg','Align: Point '+(n+1)+': ('+xx+','+yy+')');
//             drawpoints( P );
//         }
//     } // align md
//
//     if (wipeflag)
//     {
//         mess('ms-reg','Sweep '+cdx); // left and right');
//         wipefunc(cdx,cdy);
//     }
//
//     // Add and remove appropriate event listeners
//     // Why win here and not canvases?
//     win[AL]('mousemove', mm, false); // ??
//     win[AL]('mouseup', mu, false);
//
//     can1[RL]('mousedown', md, false);
//     can2[RL]('mousedown', md, false);
//     can1[RL]('dblclick', dc, false);
//     can2[RL]('dblclick', dc, false);
//
//     e.preventDefault(); // Why this?
//
// } // md mousedown
//
//
// function mm(e) // mousemove (aka mousedrag)
// {
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     // Disable function, or perhaps display mouse coordinates?
//     // Or perhaps just remember this last point?
//     if (!downflag) return;
//     e.preventDefault(); // Why this? Prevent selection?
//     if (polyflag) return; // We could move the last vertex and incident edge perhaps ...
//
//     let sk = e.shiftKey;		// For dragging object ?? No longer used 20170224
//     let ck = e.altKey||e.metaKey;	// For dragging image ?? No longer used 20170224
//
//     // Get canvas coordinates
//     let p = getmouse(e,canc);
//     cmx = p[0];
//     cmy = p[1];
//
//     mess('ms-mov','('+cmx+','+cmy+')');
//     //cl('mousemove ('+cmx+','+cmy+')');
//
//     // Check to see if got a mousemove immmediately after mousedown - HACK! // 20171218
//     if (mdflag) if (cmx===cdx && cmy===cdy) return;
//     mdflag = 0;
//
//     // Delta and last mouse x mouse y
//     let dmx = cmx - lmx;
//     let dmy = cmy - lmy;
//     lmx = cmx;
//     lmy = cmy;
//
//     let t,b, x,y, xx,yy, vx,vy, dx,dy, w,h, vw,vh;
//
//     // Convert to visual and image coordinates (all integer)
//     vx = cmx*100/sf>>0;
//     vy = cmy*100/sf>>0;
//     xx = vx-srcx1>>0;
//     yy = vy-srcy1>>0;
//
//     if (drawflag)
//     {
//         Points.push([xx,yy]);
//
//         ctx1.lineTo(vx,vy);
//         ctx1.stroke();
//         ctx2.lineTo(vx,vy);
//         ctx2.stroke();
//         return;
//     } // draw mm
//
//
//     if (rectflag)
//     {
//         // Erase any previous rectangle (not working with fade)
//         t = bcv1.width!=0 ? bcv1 : I1;
//         b = bcv2.width!=0 ? bcv2 : I2;
//         x = cdx;
//         y = cdy;
//         vx = (x*100/sf)>>0;
//         vy = (y*100/sf)>>0;
//
//         if (omx!=BIG) // Erase the old // Not working with latest FF // 20171212 !!??
//         {
//             w = omx-cdx;
//             h = omy-cdy;
//             vw = (w*100/sf)>>0;
//             vh = (h*100/sf)>>0;
//
//             drawrect( ctx1, t, vx,vy, vw,vh, 1 ); // 20171212 add 1 for FF
//             drawrect( ctx2, b, vx,vy, vw,vh, 1 ); // 20171212 add 1 for FF
//         }
//         // Draw the new rectangle.
//         w = cmx-cdx;
//         h = cmy-cdy;
//         vw = (w*100/sf)>>0;
//         vh = (h*100/sf)>>0;
//
//         drawrect( ctx1, b, vx,vy, vw,vh, 0 );
//         drawrect( ctx2, t, vx,vy, vw,vh, 0 );
//
//         omx=cmx; omy=cmy;
//         return;
//     } // rect mm
//
//     if (wipeflag)
//     {
//         wipefunc(cmx,cmy);
//         mess('ms-reg','Sweep '+cmx);
//         return;
//     }
//
//     if (xxxxflag) // 20170125 cross-fade experiment
//     {
//         let ii = cdx-cmx;
//         ii = ii>0?ii:-ii;
//         ff = ii*100/can1.width>>0;
//         ff = ff<0 ? 0 : ff>100 ? 100 : ff;
//
//         drawimages();
//         drawobjects();
//         return;
//     }
//
//     if (selectflag==VIEWSELECT) // Drag the viewer rectangle
//     {
//         // Tried to get rid of omx before - failed
//         dx = cmx-(omx==BIG?cdx:omx);
//         dy = cmy-(omx==BIG?cdy:omy);
//
//         dx = (dx*100/sf)>>0;
//         dy = (dy*100/sf)>>0;
//
//         rtx+=dx; rty+=dy;
//
//         omx=cmx; omy=cmy;
//         // Too much drawing as usual
//         drawimages();
//         drawobjects();
//     }
//     else if (selectflag>VIEWSELECT) // Drag a selected region
//     {
//
//         if (!sk) return; // No move unless shift key is depressed
//         if (!pickflag) return; // 20170123
//
//         dx = cmx-(omx==BIG?cdx:omx);
//         dy = cmy-(omx==BIG?cdy:omy);
//
//         dx = (dx*100/sf)>>0;
//         dy = (dy*100/sf)>>0;
//
//         let R = Regions[selectflag];
//         for (let i=0,P=R[0],l=P.length; i<l; i++) P[i][0]+=dx, P[i][1]+=dy;
//
//         // Have to adjust region's extent too (maybe extent should have (0,0) origin?)
//         R[REXT][0]+=dx, R[REXT][2]+=dx, R[REXT][1]+=dy, R[REXT][3]+=dy;
//         omx=cmx; omy=cmy;
//
//         // Wish we could do this without redrawing everything
//         drawimages();
//         drawobjects();
//
//     } // object mm
//
//     ///else if (sk||ck)
//     else // 20170124
//     {
//         // 20170124 For now, inhibit sk independent canvas move
//         ///dragimages( !sk, !ck, dmx, dmy ); // Problems with accidental moving, so try to inhibit
//
//         // 20170124 Constrained to x or y axis
//         //if (ck) if ((dmy<0?-dmy:dmy) > (dmx<0?-dmx:dmx)) dmx = 0; else dmy = 0;
//
//         if (ctrlflag) // On mousedown, we thought we added a point, but I guess not, so remove it
//         {
//             mess('ms-reg','Align: drag ...');
//             if (ctrlflag===1) if (!ck) { CtrlPts.pop(); ctrlflag=2; }
//         }
//         ///dragimages( 1, 1, dmx, dmy ); // Problems with accidental moving, so try to inhibit
//
//         // Bring back option to drag separately // 20171214
//         dragimages( !ck, 1, dmx, dmy ); // Problems with accidental moving, so try to inhibit
//
//     } // image mm
//
// } // mousemove
//
//
//
// function mu(e) // mouseup
// {
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     can1[AL]('mousedown', md, false);
//     can2[AL]('mousedown', md, false);
//     can1[AL]('dblclick', dc, false);
//     can2[AL]('dblclick', dc, false);
//
//     // Why win here and not canvases?
//     win[RL]('mouseup', mu, false);
//     win[RL]('mousemove', mm, false);
//
//     downflag = false;
//     can1.style.cursor = CURSNORM;
//     can2.style.cursor = CURSNORM;
//
//     let ck = e?e.altKey||e.metaKey:0;	// See drawobjects() below
//     let sk = e?e.shiftKey:0;			// Allows for continuation draw - 20170111
//
//     let i,n, t,b,a, x,y, vx,vy, w,h, vw,vh;
//     let rf = false;
//
//     if (rectflag)
//     {
//         // Draw final version of rectangle if one is underway
//         rf = true;
//         if (omx!=BIG) // this stupid variable omx
//         {
//             x=cdx, y=cdy, w=cmx-cdx, h=cmy-cdy;
//
//             // Why is this necessary?
//             if (w<0) { x+=w; w=-w; }
//             if (h<0) { y+=h; h=-h; }
//
//             // Not sure whether to go to integer or not
//             vx = x*100/sf>>0;
//             vy = y*100/sf>>0;
//             vw = w*100/sf>>0;
//             vh = h*100/sf>>0;
//
//             // For lack of a better idea, draw the other image in this rectangle
//             t = bcv1.width!=0 ? bcv1 : I1;
//             b = bcv2.width!=0 ? bcv2 : I2;
//             drawrect( ctx1, b, vx,vy, vw,vh, 0 );
//             drawrect( ctx2, t, vx,vy, vw,vh, 0 );
//
//             // Outlines
//             ctx1.lineWidth = 50/sf;
//             ctx2.lineWidth = 50/sf;
//             ctx1.strokeRect( vx,vy, vw,vh );
//             ctx2.strokeRect( vx,vy, vw,vh );
//
//             // Keep these rectangle dimensions around (image coordinates)
//             rtx = vx-srcx1>>0;
//             rty = vy-srcy1>>0;
//             rtw = vw;
//             rth = vh;
//
//             ///drawobjects(); // 20150924
//             selectflag = VIEWSELECT;
//             setdrag();
//
//             mess('ms-reg','Viewer selected');
//         }
//     } // rectflag
//     omx = BIG; // HACK. Indicates no previous rectangle point
//
//     if (!ck) // Permit continuation of drawing areas without mousemovedown 20180220
//         if (areaflag) // Close off new area super-polygon and redraw
//             if (Points.length>2)
//                 if (sk)
//                 {
//                     // Experiment: continuation draw
//                     // Keep these points around, even make a region, to be added to later
//                     let rect = [BIG,BIG,-BIG,-BIG];
//                     getextents( Points, rect );
//                     Regions.push( [Points,1,rect,0,lineclr] );
//
//                     selectflag = Regions.length - 1;
//                     mess('ms-reg','Area continuation, '+Points.length+' vertices');
//                     setdrag();
//                 }
//                 else
//                 {
//                     ctx1.closePath();
//                     ctx1.stroke();
//                     ctx2.closePath();
//                     ctx2.stroke();
//
//                     let lclr = LINECLR1;
//                     let fclr = fillclr; // Grab the current colour // SELECTCLR?
//
//                     t = bcv1.width!=0 ? bcv1 : I1;
//                     b = bcv2.width!=0 ? bcv2 : I2;
//                     a = 1.0; // ALPHA; // New method to show selected 20180222
//
//                     ///if (showflag==SHOWINVT) b = t = null;
//                     if (showflag!=SHOWINVT) b = t = null; // 20180222
//
//                     // Clip to image and remove redundant vertices
//                     n = Points.length;
//                     Points = clippoly( Points,[[0,0],[I1.width,0],[I1.width,I1.height],[0,I1.height]]);
//                     simplifypoly( Points );
//
//                     // If poly is now 2 vertices or less, maybe should ignore? 20180222
//
//                     drawpoly( ctx1, Points, lclr, fclr, LINEWIDTH,  b, a );
//                     drawpoly( ctx2, Points, lclr, fclr, LINEWIDTH,  t, a );
//
//                     // Get extents in image coodinates and store the object
//                     let rect = [BIG,BIG,-BIG,-BIG];
//                     getextents( Points, rect );
//                     Regions.push( [Points,0,rect,0,fillclr] );
//
//                     selectflag = Regions.length - 1;
//                     ///setdrag(); // Should we stay in current mode (Area), or revert to Drag? 20180220
//
//                     mess('ms-reg','New region '+selectflag+', '+Points.length+' vertices (orig '+n+')');
//                 }
//
//     if (drawflag && !areaflag) // Finish drawing a curve - lots of repeat code as above
//         if (Points.length>1)
//         {
//             // Simple clip of curve 20170123 (could do similar for polygon?)
//             let P=Points;
//             n = P.length;
//             w = I1.width, h = I1.height;
//             for ( i=0; i<n; i++ )
//                 if (P[i][0]<0||P[i][0]>w||P[i][1]<0||P[i][1]>h) break;
//             P.length = i;
//             simplifypoly(Points);
//
//             let rect = [BIG,BIG,-BIG,-BIG];
//             getextents( Points, rect );
//             Regions.push( [Points,1,rect,0,lineclr] );
//
//             selectflag = Regions.length - 1;
//             setdrag();
//
//             mess('ms-reg','New curve, '+Points.length+' vertices (orig '+n+')');
//         }
//
//     // Must redraw objects now if hadn't been drawing them while dragging image (WTF??)
//     if (rf || (dragflag && ck))
//     {
//         drawobjects();
//     }
//
//     // Why put wipeflag and ctrlflag together??
//     if (wipeflag || ctrlflag)
//     {
//         //ctx1.restore(); ctx2.restore();
//         i = CtrlPts.length;
//         if (ctrlflag===2) { mess('ms-reg','Align: '+i+' point'+(i==1?'':'s')+' so far'); ctrlflag=1; }
//         drawimages();
//     }
//
//     //doc.body.onselectstart = function() { return true; } // an attempt to reset!?
//
// } // mouseup mu
//
//
// /*
// Chrome sometimes says (Win and Mac):
// Handling of 'wheel' input event was delayed for 803 ms due to main thread being busy.
// Consider marking event handler as 'passive' to make the page more responsive.
// */
//
// function mw(e) // mousewheel // {passive: true} ?
// {
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     // Note: many wheel events! Should they be throttled/debounced? Declare "passive"?
//     // deltaY is 100 on GC and 3 on FF (Win)?? is it ever deltaX? Yes, eg. shift on GC
//     // On Mac, with fancy mouse, can do both deltaX and deltaY. Values are smaller.
//
//     if (downflag) return; // 20170111
//
//     let sk = e.shiftKey;		// Vertical scroll
//     let ck = e.altKey||e.metaKey;	// Horizontal scroll
//
//     if (!mousflag && !sk) return; // 20170124
//
//     // On FF, shift-wheel means something funny! (Scroll through history I think.)
//     // But on FF, Alt key gives menus? Many users don't (or wouldn't) want to lose this.
//     // Ctrl is already used for scaling on both browsers.
//     ///if (sk||ck) // Comment this out because we don't want page scroll! 20161124
//     e.preventDefault(); // suppress normal behavior (works for shift/FF)
//     //e.stopPropagation();
//
//     let p = getmouse(e,e.target); // canc
//     ///cl('wheel '+e.deltaX+' '+e.deltaY); //+' ('+p[0]+','+p[1]+')'); //e.clientX+' '+e.clientY);
//
//     // What about using e.wheelDelta and e.detail??
//
//     if (mousflag && (sk||ck)) // Move (translate) up/down or left/right (need a different strategy for Mac)
//     {
//         // Should be some fraction of entire dimension
//         let d = .05 * (sk ? I1.height : I1.width);
//         d = 10 * (((d+5)/10)>>0);
//         if (e.deltaX<0 || e.deltaY<0) d = -d; // Handles GC and FF on Win, Mac poor still!
//         if (sk) srcy1+=d,srcy2+=d; else srcx1+=d,srcx2+=d;
//
//         drawimages();
//         //drawobjects();	// Avoid while adjusting? But then watch for shift/alt-up?
//     }
//     else if (mousflag || !mousflag && sk) // ??
//     {
//         // Scale adjustment (but should we avoid drawing objects while scaling??)
//         fitfunc1( e.deltaY>0, p[0], p[1] );
//     }
//     //else if (e.ctrlKey)
//     //{
//     // For fade??
//     //}
//
// } // mw - mousewheel
//
//
// // This is unused
// function mo(e) // mouseout
// {
//     //if (downflag) can1.focus(); // setCapture(true)?
//     //if (1) mu(e);
//     if (downflag) mu(e);
// }
//
//
// function dc(e) // doubleclick // get colour? category?
// {
//     // If in viewer, zoom // 20171214
//     // Should we check for selected? Maybe no, because already?
//     // Use cdx and cdy. Assume they haven't changed??
//
//     cl('doubleclk ('+cdx+','+cdy+')');
//     let xx = cdx*100/sf-srcx1>>0;
//     let yy = cdy*100/sf-srcy1>>0;
//
//     // Here, we are working on a zoom shortcut // 20171218
//     let x=rtx, y=rty, w=rtw, h=rth;
//     if (isPointInPoly( [[x,y],[x+w,y],[x+w,y+h],[x,y+h]], [xx,yy] ))
//     {
//         mess('ms-reg','Viewer doubleclick');
//         //selectflag = VIEWSELECT;
//         return;
//     }
//
//
//
//     //cl('dc: e='+e);
//     // Overload with get-out-of-no-panel-mode
//     if (hideflag) return gis('divtop').display='block',hideflag=0;
//
//
//     // The SYV approach is to grab the pixel from backing canvas
//     let d = (canc===can1?ctx1:ctx2).getImageData( cdx,cdy, 1,1 ).data;
//     let c = rgbtohex( d[0], d[1], d[2] );
//
//     let i=0, l=catmenu.length;
//     for (; i<l; i++) if (catmenu[i][1]==c) break;
//     setclr(c,i<l?catmenu[i][0]:c);	// Look in menu and see if there and named already?
//     if (d[3]<255) c+=' a='+d[3];	// Notify if alpha less than 1 for some reason
//
//     //if (!tbflags[EDTB]) CB('Edit'); // Show colour and related controls // 20170124 hack!
//     //mess('ms-tm',c);
//     mess('ms-reg','Choose colour '+c);
//
// } // dc
//
//
// // Keys:
// // Arrow: translate images
// // Esc: exit fullscreen
// // + bigger
// // - smaller
// // 0 actual size
// // 123 # canvases
// // LRUD move over all the way
// // A draw (area)
// // A? actual size (ie 100% scale)
// // A? auto-size
// // A? above (display)
// // B big (ie maximize canvas(es))
// // B? beside (display)
// // C categories toggle
// // C? centre (M middle?)
// // D(x) display (atop,beside,auto,max)
// // E edit (edit menu/toolbar? area draw?)
// // F fullscreen toggle
// // F? fit
// // F? fade
// // G grid toggle
// // H hide (toolpanel) toggle (but see VH)
// // I images only show (see O)
// // M middle (ie. centre; see C)
// // M? max-size
// // N names, ie show image names toggle
// // O objects only show (see I)
// // P preferences toggle
// // P? panel
// // R? redraw (but see LRUD)
// // S swap
// // S? sweep
// // S? save
// // T tools show/hide
// // U? undo (good luck with that!) (but see LRUD)
// // VH vertical/horizontal sweep/wipe? (or toggle)
// // V viewer? (or right mouse?)
// // W wiper/sweep
// // X(i) transform, ie xform
// // X? delete selection?
//
// // JKQZ, numbers, symbols, functionkeys, ...
//
//
// //doc.onkeydown = function(e) {
//
// function kd(e) // keydown
// {
//     // Note called a lot if key held down, even shiftKey/altKey/ctrlKey
//     // Mac (maybe Win too?), seems like always UC, shift handled separately
//     let p; // in case we need to get mouse position
//     let k = e.keyCode;
//     let sk = e.shiftKey; // can't seem to get this properly!?
//     let ck = e.altKey||e.metaKey;
//
//     let lk = e.ctrlKey; // 20200816 trying to figure out how to trap ctrl-V for paste
//     if (lk)
//     {
//         if (k==86) pastefunc(e); // ctrl-V for paste // 20200816
//         return;
//     }
//
//     let s = 'keydown'+(sk?' (shift)':'')+(ck?' (alt)':'')+(lk?' (ctrl)':'')+': ';
//     let x,y;
//     let f=0,g;
//
//     cl(s+k);
// //mess('ms-tm','key: '+k);
//
//     // Perhaps when a key has a function here, prevent browser's default?
//     // Eg. ctrl-+ activates browser acion, and + action here
//
//     switch (k) {
//
//         case 27: // ESC
//             if (rectflag || wipeflag || pickflag || xxxxflag) modefunc(0);
//             else if (hideflag) hideflag=0,gis('divtop').display='block';
//             break;
//
//         // cursor keys
//         case 37:
//             cl(s+'left');
//             movefunc(e,1,0);
//             break;
//         case 38:
//             cl(s+'up');
//             movefunc(e,0,1);
//             break;
//         case 39:
//             cl(s+'right');
//             movefunc(e,-1,0);
//             break;
//         case 40:
//             cl(s+'down');
//             movefunc(e,0,-1);
//             break;
//
//         // Win: 45/46 Insert/Delete 36/35 Home/End 33/34 PageUp/Down
//         // Should test Mac! Stupid keyboard mappings
//
//         ///case 43: // + (plus)
//         case 61: // win/FF??
//         case 187:
//             f = 1;
//         ///case 45: // -
//         case 173: //win/FF??
//         case 189:
//             // Just can't make any of this work!
//             // Does not centre about cursor
//             //p = getmouse(e,e.target);
//             //g = ctrlflag && selectpnt>NOSELECT;
//             //x = g ? (CtrlPts[selectpnt][0]+srcx1)*100/sf>>0 : can1.width/2;
//             //y = g ? (CtrlPts[selectpnt][1]+srcy1)*100/sf>>0 : can1.height/2;
//             x = can1.width/2;
//             y = can1.height/2;
//             fitfunc1( 1-f, x, y );
//             break;
//         case 57: // '9' (fit, for lack of a better idea! since close to 0 and -/+)
//             fitfunc(e);
//             break;
//
//         case 8: // Mac big delete
//         case 46: // Mac little delete
//             // Perhaps delete last align point or selected object?
//             deletefunc(0,e);
//             break;
//
//         case 48: // '0'
//             sf = 100;
//             setscale(1)
//             if (gid('rs')[SI]===0) scalefunc(0); // Set slider control to SCALE
//             drawimages();
//             drawobjects();
//             break;
//         case 49: // '1'
//         case 50: // '2'
//         case 51: // '3'
//             displayfunc(k-49,0);
//             gid('ns')[SI] = k-49;
//             break;
//
//         case 76: // 'L' left
//             ///movefunc()
//             break;
//
//         case 65: // 'A' area - code from modefunc
//             /*
// 		if (!sk) // No works well, get shift-Align if not careful
// 		{
// 			// How to get Align controls too?
// 			//e.shiftKey = false; // not allowed
// 			modefunc(5,e); // Align
// 			break;
// 		}
// 		*/
//             /*
// 		dragflag = false;
// 		areaflag = drawflag = true;
// 		mess('ms-mode','area');
// 		mess('ms-reg','Area');
// 		*/
//             modefunc(2,e); // area
//             break;
//         case 67: // 'C' centre
//             movefunc(e,0,0);
//             break;
//         case 68: // 'D' drag
//             setdrag();
//             mess('ms-reg','Drag');
//             break;
//         case 70: // 'F' fullscreen (toggle?)
//             if (sk) displayfunc(3,1); // ???
//             fullscreen();
//             break;
//         case 71: // 'G'
//             gridfunc(e);
//             break;
//         case 72: // 'H' (hide)
//         case 84: // 'T' (tools)
//             gis('divtop').display = (hideflag=1-hideflag) ? 'none' : 'block';
//             resizefunc(8);
//             break;
//         case 75: // 'K' (Krazy Kontrols)
//             panpopup();
//             break;
//         case 77: // 'M' (maximize canvases, or auto))
//             if (displayflag!=3) displayfunc(3,1);
//             else displayfunc(2,1);
//             gid('ds')[SI] = displayflag; // MAX or AUTO
//             break;
//         case 79: // 'O' objects (display toggle)
//             // See selectfunc(), but problem: not reflected in GUI widget!
//             // Messed up, prob cuz use redrawfunc()?!
//             //showflag = (showflag+1) % 6;
//             redrawfunc(null,2);
//             gid('ss')[SI] = showflag;
//             break;
//         case 80: // 'P' Pick mode
//             modefunc(pickflag?0:7,e);
//             break;
//         case 82: // 'R' redraw
//             redrawfunc(null,0);
//             break;
//         case 83: // 'S'
//         case 115: // 's'
//             swapfunc(e);
//             break;
//         case 85: // 'U' undo - not working!
//             mess('ms-reg','No undo yet!!');
//             break;
//         case 86: // 'V' (viewer)
//             modefunc(4,e); // rectflsg? mode?
//             break;
//         case 87: // 'W' (wiper)
//             modefunc(wipeflag?0:6,e);
//             break;
//         case 88: // 'X' (cross-fade)
//             modefunc(xxxxflag?0:8,e);
//             break;
//         default:
//         //cl('keydown '+k);
//     }
//
// } // kd keydown
//
//
//
// // Similar to fitfunc, but here we increment scale, and centre about the point
// // Maybe should join these two funcs together??
// // Called from mousewheel, and keyboard shortcuts + and -
// // Should be fixed to handle distinct srcx1 and srcx2
// // Flag f says increase or decrease
//
// function fitfunc1(f,x,y)
// {
//     // Change global sf (scale factor in percentage) to new value
//     //var so = sf;
//     //cl('fitfunc1');
//     let s1 = sf/100;
//     let d = sf<20 ? 1 : sf<50 ? 2 : sf<100 ? 5 : 10;
//     sf += f ? -d : d; // delta should be related to current scale
//     sf <<= 0;
//     sf = sf<5 ? 5 : sf>200 ? 200 : sf;
//     let s2 = sf/100;
//
//     //cl('fitfunc1: so '+so+' sf '+sf);
//
//     // This may re-align the canvases as a side effect
//     // We want the point (x,y) to stay put
//     srcx1 = x/s2 - x/s1 + srcx1;
//     srcy1 = y/s2 - y/s1 + srcy1;
//     srcx1 = srcx1 << 0;
//     srcy1 = srcy1 << 0;
//
//     // Handle canvas 2 separately
//     srcx2 = x/s2 - x/s1 + srcx2;
//     srcy2 = y/s2 - y/s1 + srcy2;
//     srcx2 = srcx2 << 0;
//     srcy2 = srcy2 << 0;
//
//     // We may have constraint on srcx and srcy, and/or scale
//     // Should make it so that x and y do not need change
//
//     // Miserable GUI side-effects
//     setscale(s2);
//     if (gid('rs')[SI]===0) scalefunc(0); // Set slider control to SCALE
//
//     drawimages();
//     drawobjects();	// Would be nice to avoid these while scaling - could be slow
//
// } // fitfunc1
//
//
// // Yet another attempt at fitfunc
// // This time, treat can1 and can2 "properly", and centre about point
//
// function fitfunc2()
// {
// }
//
//
// function pastefunc()
// {
//     //al('paste!');
//     cl('paste!');
// }
//
//
// // File drag-and-drop does not work on win/FF? (But no message) (What about Mac/FF?)
// // Callback for both 'dragover' and 'drop' events, both canvases
//
// function dropfunc(e) // one or more files drag and drop onto a canvas
// {
//     e.preventDefault();
//     e.stopPropagation();
//     let sk = e.shiftKey;
//
//     // none copy link move  all
//     e.dataTransfer.dropEffect = 'copy'; // ?? // effectAllowed
//     e.dataTransfer.effectAllowed = 'copy'; // dragstart event only, onsource??
//
//     if (e.type=='paste') // 20200816
//     {
//         cl('paste');
//         return;
//     }
//
//     if (e.type!='drop')
//     {
//         cl('drag');
//         return;
//     }
//
//     // Check for the various File API support.
//     // typeof FileReader != 'undefined' // also suggested
//     if (!(win.File && win.FileReader && win.FileList && win.Blob))
//         return al('The File APIs are not fully supported in this browser.');
//
//     /*
// //cl('items? '+e.dataTransfer.items); // Only on Chrome (ie. no ff, no sf)
// // Can't make any of this work. Maybe sometimes we can get ONE uri/url
// // Note that maybe folder drag-and-drop can be made to work on GC and/or FF
// // types - all the available data formats
//
// // DataTransfer.mozItemCount (gecko)
// // DataTransfer.mozGetDataAt("application/x-moz-file", i)
// // DataTransfer.mozTypesAt(1);
// // DataTransfer.files  all the local files available on the data transfer or empty
// // DataTransfer.items  DataTransferItemList object, list of all the drag data
// // dataTransferItem.kind (string or file)
// // dataTransferItem.type (typically MIME)
// // DataTransferItem.getAsFile() (File object associated with the drag data item (or null))
// // DataTransferItemList.length
//
//
// var itype = null; // e.dataTransfer.items[0]; // items // files items.kind('string' or 'file') .getAsFile() .getAsString(b(s))
// var ltype = e.dataTransfer.types.length;
// var ltype1 = null; // e.dataTransfer.items.length;
// var imageUrl = e.dataTransfer.getData('text/uri-list'); // 'text/html' 'text/uri-list' // 'text' // 'URL' 'url'
// //imageUrl = imageUrl.length;
// var imageUrl = null; // e.dataTransfer.items[0];
// //al(e.dataTransfer.items.length);
// al('item '+imageUrl+' type '+itype+' length '+ltype+' '+ltype1+' files '+e.dataTransfer.files.length);
//
// // getdata text/plain and text/uri-list (and text/html)
// */
//
//     // New notes as we try to figure out directory options 20181113
//     // dataTransfer.files dataTransfer.types[i]
//     // dataTransfer.items[i].webkitGetAsEntry().isFile isDirectory   mozGetDataAt()
//
//     // As a convenience, allow to drop in opposite canvas if shift key pressed
//     let d = e.dataTransfer;
//     let files = d.files;
//     let i = e.target==can1!=sk?img1:img2; // xor
//     let items = d.items; // works on GC and FF 20180208
//     if (items)
//     {
//         cl('drop: got '+d.items.length+' items, '+(files?files.length:'null')+' files');
//         ///if (d.items[0].webkitGetAsEntry().isDirectory) cl('first item is a directory!!');
//         // 20210215 Comment out above line, must have been testing, but GC barfed at isDirectory
//     }
//
// //cl(js(e));
//     cl(e);
//     cl(d);
//
//     // I think this part is for dragging image(s)
//     if (files==null || files.length==0)
//     {
//         // Start the file-loading timer, since filefunc() not called
//         gtime = ts();
//         // if d.types.length==0, probably no works! (eg. as with FF)
//
//         // HACK! Experimenting with new drag-and-drop, external websites
//         // Are we confined to one image at a time this way? Seems so, so far
//         numimage = 1;
//         fileread = 1; // gotimage?
//
//         // Cannot seem to get an external image on Firefox (FF)
//         // Perhaps implement paste instead? Allow special case for MLE thumbs?
//         // Should be able to paste a textual URL (or URL buried in other text, like HTML), or an image
//         let j=0,k=d.types.length;
//         cl('types ('+k+'): ');
//         for (j=0;j<k;j++) cl(d.types[j]);
//
//         // getData argument should be one of d.types
//         let u = d.getData('text/uri-list'); // when this fails, should try text/html instead
//         //var u = d.getData('text/html');
//         cl('load image file via URL: '+u);
//         filenames[i==img1?0:1] = u; // i!=img1
//         i.src = u; // CORS // What if file is TIF or BMP? Could we do that kind of load?
//         ///getimgsize(0,filenames[0]); // TEST
//     }
//     else filefunc( e, files, e.target==can1?0:1 ); // Which canvas?
//
// } // dropfunc
//
//
// // Called from dropfunc above, also the file upload (input) button
// // Maybe should consolidate this function with canvas-setting parts of win.onload()
// // Parameter e (event) passed in to get shift key, means to add (not replace) data
//
// function filefunc( e, files, x ) // x is index to start at, ie. which canvas (-1==unknown)
// {
//     let sk = e?e.shiftKey:0;	// Indicates add instead of replace data
//     let adf = sk || canc===can2; // add flag (instead of replace?) - used in loaddata
//     let badread=0;				// Number of files unsuccessfully read
//     let gotdata=false;			// For loading text (JSON) files
//
//     numimage = 0; // number of image files to be read
//     gotimage = 0; // global var to see if all image resources present (loaded)
//     numfread = 0; // number of files read (not number images loaded)
//
//     ///if (!files) files = e.target.files;
//     cl('filefunc: '+files.length+' files, sk='+sk+' x='+x);
//
//     if (files.length>4) return al('Too many files! ('+files.length+')');
//
//
//     // Only do this message if lots of (slow) data?
//     let nf=files.length;
//     mess('ms-reg','Reading '+nf+' file'+(nf===1?'':'s')+' ...');
//     mess('ms-tm','');
//     gtime = ts();
//
//     if (x==-1) x = canc!=can1; // Default canvas is can1 (top/left one)
//
//     function setupReader( file, ix, t )
//     {
//         let name = file.name;
//         let ext = name.split('.').pop();
//         let W, H;
//         let reader = new FileReader();
//
//         // Watch out! Loaded in surprising order. Usually smaller ones first.
//         // Do we need this closure approach? What happens with access to globals?
//
//         reader.onload = (function(file) { return function(e) // e unused?! No, it is the event
//         {
//             let fn = file.name;
//             let fs = file.size; // also lastModified and type
//             let img;
//
//             //var ext = fn.split('.').pop(); // 20170422
//
//             numfread++;
//             cl('  reading '+fn+' size='+fs+' type='+t+' numfread='+numfread);
//
//             if (numfread<5) // HACK!
//                 if (t=='image') // next 3 blocks must be merged!
//                 {
//                     // Note we may want to treat PNG/png files as masks later
//                     // Count colours to see if they are "proper" masks?
//                     if (numimage<1)
//                     {
//                         // First image has been read by the reader
//                         img = ix==0 ? img1 : img2;
//                         let ecv = ix>0 ? ecv2 : ecv1; // 20200128
//
//                         filenames[ix==0?0:1] = fn;
//                         filesizes[ix==0?0:1] = fs;
//
//                         // 20170422 experimental stuff, how to handle no image
//                         // Where the heck is ecv2 handled! It is not!? Maybe fixed 20200128
//                         if (ext=='tif'||ext=='TIF'||ext=='tiff'||ext=='TIFF' || bmpf && (ext=='bmp'||ext=='BMP'))
//                         {
//                             cl('bitmap or tiff!! ext '+ext);
//
//                             let R = (ext=='bmp'||ext=='BMP') ?
//                                 readBMP(reader.result) : readTIF(reader.result);
//                             if (!R)
//                             {
//                                 cl('Unimplemented TIF format option');
//                                 mess('ms-reg','Unimplemented TIF format option');
//                             }
//                             else
//                             {
//                                 ecv.width = R.width;
//                                 ecv.height = R.height;
//                                 gctx(ecv).putImageData( R, 0,0 );
//
//                                 // No callback, so wrap up variables here
//                                 numimage++;
//                                 gotimage++;
//                             }
//                         }
//                         else
//                         {
//                             ecv.width = 0; // 20200220
//                             img.src = reader.result; // Watch for callback!
//                             numimage++;
//                         }
//                     }
//                     else if (numimage<2)
//                     {
//                         // Second image has been read by the reader
//                         img = ix==0 ? img2 : img1;
//                         filenames[ix==0?1:0] = fn;
//                         filesizes[ix==0?1:0] = fs;
//                         img.src = reader.result; // Watch for callback!
//                         numimage++;
//                     }
//                     else if (numimage<3)
//                     {
//                         // Third image? Well, better stick in 3rd canvas
//                         if (ncan<3)
//                         {
//                             ncan = 3;
//                             gid('ns')[SI] = ncan-1;
//                             displayfunc(ncan-1,0);
//                         }
//                         //img3 = new Image;
//                         img = img3;
//                         filenames[2] = fn;
//                         filesizes[2] = fs;
//                         img.src = reader.result;
//                         numimage++;
//                     }
//                     else
//                     {
//                         al('More than 3 images unimplemented!');
//                     }
//                 }
//                 else if (ext=='ilp'||ext=='ilt') // Jean IL/XML data
//                 {
//                     xmlparse( reader.result );
//                 }
//                     ///else if (ext=='gpx') // HACK for GPS gps gpx work 20160806
//                     ///{
//                     ///gpxparse( reader.result );
//                 ///}
//                 else if (ext=='data') // 20201222 load an MLP database dump
//                 {
//                     cl('reading a database');
//                     dbparse( reader.result );
//                 }
//                 else // Looks like it must be a JSON file of IAT objects, filenames, categories, etc.
//                 {
//                     if (gotdata) adf = true; // Add to objects, instead of replace
//                     gotdata = true;
//                     loaddata( fn, reader.result, adf );
//                 }
//
//             if (numfread==files.length-badread) // I hope this finishing nonsense works
//             {
//                 // This code executed after all the files read,
//                 // but not necessarily after all images have been loaded!
//
//                 cl('files all read, numimage='+numimage+' gotimage='+gotimage);
//                 fileread = 1;
//                 imgsfinish(); // Perhaps needed in case no images were loaded?
//
//             }
//         }})(file); // reader.onload()
//
//
//         // Should we have a reader.onerror as well? Like when big images cannot be made?
//         //reader.onerror = function(event)
//         //{
//         //console.error("File could not be read! Code " + event.target.error.code);
//         //};
//
//         // Might a different format work better for super-big JPG?
//         // What about BMP and TIF?? Added the below 20170422
//         if (ext=='tif'||ext=='TIF'||ext=='tiff'||ext=='TIFF' || bmpf&&(ext=='bmp'||ext=='BMP'))
//             reader.readAsArrayBuffer(file); // 20170422
//         else if (t=='image') reader.readAsDataURL(file);
//         else reader.readAsText(file);
//
//     } // setupreader
//
//
//     for ( var i=0; i<files.length; i++ )
//     {
//         // Files may be read in unexpected order
//         // We can expect photo images (jpg), masks (png), JSON data (txt),
//         // and even XML data (ilp, ilt, gpx?!)
//         // And now, maybe even BMP and TIF! 20170400
//         // And now, trying for folders (preliminary) 20180208
//
//         let f = files[i];
//         cl( 'file '+i+': '+f.name+'  size='+f.size+' type='+f.type);
//
//         let t = f.type.split('/')[0]; // file.type.match('image.*');
//         let ext = f.name.split('.').pop();
//
//         if (t=='image'||t=='text' || ext=='ilp'||ext=='ilt') // ||ext=='gpx) // HACK 20160806
//         {
//             setupReader( f, x, t );
//         }
//         else
//         {
//             al('Bad file: '+f.name+' size: '+f.size+' type: '+f.type+' ext: '+ext); // t
//             badread++;
//         }
//     }
//
// } // filefunc
//
//
// // Here we try to update the categories popup window with a menu, or the counts
// // There is difficulty in finding the right dimensions for the widget
// // [new add rem cts ldd xml]
//
// function msend(s)
// {
//     if (!wcat) return; // No reason to send a message
//
//     //var t = ts()%10000; // One day, will remove
//     //var c = 'cmesss-'+'blah'; //win.code1;
//     let m = s=='cts' ? gid('counts').innerHTML : gid('menu').innerHTML;
//     let wh, w, h;
//
//     // DOM: cat->cgs->menu and cat->cts->counts
//     ///if (s=='cts') wcat.document.getElementById('cts').style.display = 'inline-block';
//
//     // 20180314 not sure why we do not do this if new?
//     if (1||s!='new') // figure out dimensions of cat popup
//     {
//         wh = getwh(gid('cgs')); // cgs? cat??
//         w = wh[0];
//         h = wh[1];
//         //cl('cats: w='+w+' h='+h);
//     }
//
//     if (s=='cts') // clumsy!
//     {
//         wh = getwh(gid('cts'));
//         w += wh[0]+20; // HACK!
//         h = h<wh[1]?wh[1]:h;
//     }
//
//     // We adopt the policy that the parent window sets size of cat popup
//     // Note this not allowed with file:// protocol. Yet on FF, still get the pop-up window! 20210116
//     // Thus, we might be able to fix this situation if let pop-up resize itself (?)
//     w += 2*MARGIN+wcat.outerWidth-wcat.innerWidth; // 16+10
//     h += 2*MARGIN+wcat.outerHeight-wcat.innerHeight; // 16+57
//     //if (1||s!='new') wcat.resizeTo(w,h); // HACK? Should it be later?
//
//     //var p = js([s,m]); // [s,t,m]
//     let b = filep; // chromb &&
//     let o = b ? '*' : location.origin; // .href?
//     cl('msend: o='+o+' s='+s+' l='+m.length); //+' m='+m);
//     wcat.postMessage([s,m],o);
//
//     if (1||s!='new') wcat.resizeTo(w,h); // HACK? Should it be later?
//
// } // msend
//
//
// function psend(id,s) // send (post) a message to popup control panel
// {
//     if (!wpan) return;
//
//     let b = filep; // chromb &&
//     let o = b ? '*' : location.origin; // .href?
//     cl('psend: o='+o+' id='+id+' s='+s);
//     wpan.postMessage([id,s],o);
// }
//
//
// // Template/name Description  Label id order Name Description  Image Mask Notes
// /*
// 	Example:
// 	<Label id="127" order="5">
// 	<Name>Floodplain</Name>
// 	<Description />
// 	</Label>
// */
//
// function xmlparse(s) // Load in some Jean ILP/ilp/ilt data (categories menu)
// {
//     // Lots of built-in XML parsing capability
//     let p = new DOMParser();
//     let x = p.parseFromString( s, 'text/xml' );
//     let L = x.getElementsByTagName('Label'); // id order
//     let N = x.getElementsByTagName('Name'); // Image Mask Notes
//
//     let I = x.getElementsByTagName('Image'); // Might not exist
//     let M = x.getElementsByTagName('Mask'); // Might not exist
//     //if (I&&I.length) {} // 20170122 later on we can load an image
//     //if (M&&M.length) {} // 20170122 later on we can load a mask
//     ///cl('m.length = '+M.length);
//     ///cl('m = '+M[0].childNodes[0].nodeValue);
//
//     // The Jean IL ILP/ILT files encode colours as base 10 integers
//     let l = N.length;
//     catmenu = new Array(l);
//     for ( var i=0; i<l; i++ )
//     {
//         let j = L[i].attributes[0].nodeValue;
//         let c = rgbtohex( j>>16&255, j>>8&255, j&255 );
//         catmenu[i] = [N[i].childNodes[0].nodeValue,c];
//     }
//     // Keep a copy of this, the last loaded categories menu, and display new
//     oldmenu = catmenu.slice();
//     drawmenu(null,4);
//     msend('xml');
//
//     //if (wcat) wcat.focus(); else if (!menuflag) showmenu();
//     catpopup(); // 20170228
//
//     mess('ms-cts','');
//
// } // xmlparse()
//
//
// /*
// 	x.nodeName - the name of x
// 	x.nodeValue - the value of x
// 	x.parentNode - the parent node of x
// 	x.childNodes - the child nodes of x
// 	x.attributes - the attributes nodes of x
// 	textContent?
// 	nodeName?
// 	tagName?
// */
//
// function gpxparse(s)
// {
//     let a,b=0, i, d=0, dlat, dlon, r1=6371.0, r2=4235.0;
//     r1 = 111.2; r2 = 73.9;
//     let p = new DOMParser();
//     let x = p.parseFromString( s, 'text/xml' );
//     let T = x.getElementsByTagName('trkpt');
//     let E = x.getElementsByTagName('ele');
//
//     let lat = new Array(T.length), lon = new Array(T.length);
//     for ( i=0; i<T.length; i++)
//     {
//         lat[i]=T[i].getAttribute('lat');
//         lon[i]=T[i].getAttribute('lon');
//     }
//
//     for ( i=1; i<T.length; i++ )
//     {
//         // Pythagoras
//         dlat = lat[i]-lat[i-1]; dlat *= r1; //dlat = dlat*r1/90.0;
//         dlon = lon[i]-lon[i-1]; dlon *= r2; //dlon = dlon*r2/90.0;
//         d += Math.sqrt( dlon*dlon + dlat*dlat );
//
//         // Elevation
//         a = E[i].childNodes[0].nodeValue-E[i-1].childNodes[0].nodeValue;
//         //a = a*10+.5>>0;
//         if (a>.20) b+=a; // .19/.20 signiof?
//     }
//     al('d='+d+' b='+b);
// }
//
//
// // Called as callback (within debounce) for resize event
// // Also from drawmenu() and countfunc(), in case height of top part changes
// // All f does is help me debug
// // Should have another close look at this function, eg. look at vert vs horiz, maybe last w/h too?
//
// // The reflow stuff is supposed to prevent browser reflow from redrawing canvases during resize - buggy
// // Some problems, including when one scrollbar needed, eg. vertical scrollbar width not taken into account
//
// // Generally speaking, I think this is called too often
// // Or perhaps should be called very often, but only resize canvases if necessary
//
// var nresize = 0;
// function resizefunc(f) /// f is only for debug
// {
//     let d = displayflag;		// How are canvases arranged: above, beside, auto, max?
//     gis('divall').width = null; // Trigger reflow before we fit canvases
//     gis('cid').width = null;
//
//     // Perhaps reorganize the canvas orientations, size, positioning, scale factor? Tool Panel too?
//     cl('resize #'+nresize+': f='+f+' '+win.innerWidth+' '+win.innerHeight+' '+toh());
//     nresize++;
//     if (d==2 || d==3) // AUTO and MAX resize of canvases
//     {
//         canvasfit( d==3, 1 );
//     }
//     else if (d==1 && ncan==2) // BESIDE - When beside, FORCE to be beside!?
//     {
//         let x = 2*can1.width + 24; // HACK! A rank guess.
//         let w = 2*can1.width + 4*BORDER + 3*MARGIN - MARGIN; // confusing - cid has a margin
//         cl('resizefunc: try to set width to '+w+' not '+x+', canwidth='+can1.width);
//         gis('cid').width = ''+w+'px'; // Set width of division containing the 2 canvases
//     }
//     else {} // ABOVE - what about above?
//
//
//     // HACK! Trying to prevent reflow while resizing 20160204 05
//     // Constrain width to exactly ... the width. But watch for scrollbars!
//     let w = win.innerWidth; // -4 -2*MARGIN; //-2*BORDER;
//
//     // When a vertical scrollbar required, width must be further constrained
//     // What a mess.
//     if (d==1) if (toh()+can1.height+10 > win.innerHeight) w -= 16; // A guess!
//     //gis('divtop').width = ''+w+'px';
//     gis('divall').width = ''+w+'px';
//
// } // resizefunc
//
//
// // Callback for postMessage events from Categories and Controlpanel popup windows
// // new, add, rem, end, or an integer index
// // 20170212 This must be coordinated with other popups, like controlpanel
//
// function mrecv(e) // Receive a message from another window
// {
//     let s = e.source;
//     // Should we check origin and source for correctness?
//     ///if (s!=wcat) return; // is this enough security? Maybe too much!?
//     if (!s||s!=wcat&&s!=wpan)
//         return cl('mrecv: error: unidentified source!');
//
//     let o = e.origin || e.originalEvent.origin;
//     // location. href protocol host hostname port doc.domain
//     let m = e.data; // e. data origin source (sending window)
//
//     // This case for new control panel 20170212
//     // Only handling 30 buttons for now, plus more being added ...
//     if (s===wpan)
//     {
//         cl('mrecv: wpan m='+m+' o='+o)
//         if (m==null) { cl('null message'); wpan = null; }
//         else cbk(m);
//         return;
//     }
//
//     // This case for categories popup
//     ///m = JSON.parse(m);
//     cl('mrecv: m='+m); /// +c+
//     if (!m) return;
//
//     if (m[0]==='new') menufunc(null,3); // ;
//     else if (m[0]==='add') menufunc(null,0,m[1]);
//     else if (m[0]==='rem') menufunc(null,1,m[1]);
//     else if (m[0]==='end') wcat = null;
//     else mclick1(m[0]);
//
// } // mrecv
//
//
// // This one needs improvement. The idea is to try different names and places (backwards compatibility)
// // Load image by name, rather than data.
// // Parameter img is one of 3 images, or one of three masks (?)
// // Try this technique (the looking in 2nd place) with data files (JSON) too??
// // f===0 => if fail, try again with f===1, and look in images/
// // Should consider robustness with CORS too, eg. f===3/4 => nocors
//
// function loadimage( f, img, s )
// {
//     //var t = 'images/';
//     let c = img && img['crossOrigin']!=undefined; // 20210215
//
//     let u = s.split('.').pop();
//     cl('loadimage:'+f+' file='+s+' suffix='+u+' CORS='+c);
//
//     // HACK! Must wipe out evidence of any previous image // 20200219
//     if (img==img1 && ecv1) ecv1.width = 0;
//     if (img==img2 && ecv2) ecv2.width = 0;
//
//     // This image type not handled natively by browser, needs different approach
//     if (u=='tif'||u=='TIF'||u=='tiff'||u=='TIFF')
//         return getimgfile( img, s ); // 20200129 // broad enough? // What about bmp/BMP?
//
//     // Here, if load failed, try the default folder name. BUT, should not do if has protocol, etc!?
//     // Should not do if: (1) prefix already images/ (2) protocol supplied
//     //s = s.substring(0,7)==t ? t+s;
//
//     // One day, may try to load without CORS if fails with CORS
//     //var iet = function(e) { if (f) ief(e); else {cors(0);loadimage( 1, e.target, s+'?nocors' );} }
//     let iet = function(e) { if (f) ief(e); else loadimage( 1, e.target, 'images/'+s ); }
//
//     // The onload function ilf() is declared elsewhere
//     //img.onload = ilt;
//     img.onerror = iet;
//
//     // This only works for JPG, PNG and a few other types ... not TIF for example!
//     img.src = s;
//
// } // loadimage
//
//
// // get a real amazon s3 MLE URL filename for string s
// function amaz(s)
// {
//     // indexOf lastIndexOf split pop charAt [i] slice substr substring
//     let r=s,p=AMZ,i=r.lastIndexOf('.'),v;
//     // See if has .jpg or .jpeg suffix
//     //al(r+' '+i+' '+r.length);
//     if (r.length-i>5) r+='.jpeg'; // weak?
//     // See if has http(s) at front.
//     if (MLE)
//         if (v=r.substring(0,7),v!='http://'&&v!='https:/') r = p+r; // weak?
//     return r;
// }
//
//
// // 20200205 - Expanding use of loading of IAT .txt files as scripts, when necessary
// // Use this function for standalone (file://) option, because AJAX may not work
// // Note syntax must be JS, not JSON (iat.proj=[xxx] rather than [xxx])
// // Should the function look in other places, like /images/, too?
// // See also earlier attempt, function dll()
// // See: https://unixpapa.com/js/dyna.html
//
// function dynamicload( filename )
// {
//     // dynamic load iat.proj=[..] file
//     cl('Dynamic load (no AJAX): filename='+filename);
//     let head = doc.getElementsByTagName('head')[0];
//     let script = doc.createElement('script');
//     //script.type = 'text/javascript';
//
//     script.onload = function()
//     {
//         let o = iat.proj;
//         iat.proj = null; // Test to see if something there already??
//         if (!o)
//         {
//             // Got something, but probably doesn't parse as JS
//             mess('ms-reg','Failed to parse file '+this.src);
//             cl('Cannot parse IAT file '+this.src);
//             return;
//         }
//         // Maybe should check for iat.proj here?
//         cl('objectlen='+o.length);
//         let s = o.toString();
//         cl('string='+s);
//         loaddata( 'blah', o, 0 );
//     }
//     script.onerror = function()
//     {
//         mess('ms-reg','Failed to find file '+this.src);
//         cl('Error loading '+this.src);
//     }
//     //script.async = false; // ??
//     script.src = filename;
//
//     // The load might be successful, for the older IAT txt files?!
//     ///if (typeof script=="undefined") cl('dynamic load problem!');
//     head.appendChild(script);
//
// } // dynamic load
//
//
//
// win.onload = function() // win redundant?
// {
//
//     // Any initial images are loaded here.
//     gtime = ts();
//
//     let l=location, s=l.search, u=l.origin; ///, fp=l.protocol=='file:';
//     let A, i;
//
//     cl('win load: l='+l+' u='+l.origin);
//     ///cl('userAgent: '+navigator.userAgent); //navigator.hardwareConcurrency
//     if (!endian) al('WARNING: offbeat endian');
//
//     // Look for URL parameters (perhaps if just ?, then load empty canvas?)
//     // The program could be at MLE, at Mary, at RHM, at home, localhost:8000, file:, ... and elsewhere
//     // location href protocol host hostname port doc.domain
//
//     // I would assume one of the below is true
//     if (filep) backclr=BGCLRF;
//     else if (u=='http://localhost:8000') { backclr=BGCLRD; } // 20170122 test cors()
//     else if (u==MES) { backclr=BGCLRM; cors(); } // 20170122 CORS hack
//     else if (u==MLE) { backclr=BGCLRS; cors(); } // CORS hack
//
//     //setpa('bc',backclr);
//     A = ['body','divall','divtop','divtools','in-can','ms-rng'];
//     for (i=0;i<A.length;i++) gis(A[i]).background = backclr;
//
//
//     // WARNING: copied code as below. This part for when vars passed in from external html/js 20160906
//     // This interface unused so far, and needs much updating anyway
//     if (sbsimages!=undefined && sbsimages.length>0)
//     {
//         numimage = sbsimages.length;
//         if (numimage>2) numimage = 2;
//         ncan = numimage;
//         fileread = 1;
//
//         // CORS issues?!
//         if (numimage>0) filenames[0] = sbsimages[0], loadimage( 0,img1,sbsimages[0] );
//         if (numimage>1) filenames[1] = sbsimages[1], loadimage( 0,img2,sbsimages[1] );
//         if (numimage>2) filenames[2] = sbsimages[2], loadimage( 0,img3,sbsimages[2] );
//     }
//     else if (s) // search string, aka query string, is present
//     {
//         // Parse command line options
//         // Test URL: http://localhost:8000/iat.html?MLP2011_282_aligned.jpg,WHE1918_282_aligned.jpg
//         // image files, separated by commas, are assumed if no pmtr name, or 'i'
//         // gc means browser assumed to be GC started with correct AFAFF if file://
//         // p means project file
//
//         s = s.substring(1); // get rid of the question mark
//         cl('args: '+s);
//
//         let t = s.split('&');
//         //cl(t);
//         for ( i=0; i<t.length; i++ ) // for each argument ...
//         {
//             s = t[i];
//             if (!s||!s.length) continue; // allows for beginning and adjacent '&' chars
//
//             s = s.split('='); // indexOf?
//             let ext = s[s.length-1].split('.').pop();
//
//             // This case for a single .txt file
//             if (s.length==1 && ext=='txt' || s.length==2 && ext=='txt')
//             {
//                 cl('got a txt arg: '+s[s.length-1]); // JSON
//
//                 // Perhaps should save this dynamic load stuff for 'iat' files??
//                 if (filep) // Perhaps should do this only if GC and filep and no AFAFF??
//                 {
//                     dynamicload( s[s.length-1] ); // 20200205
//                 }
//                 else
//                 {
//                     getjsonfile(s[s.length-1]);
//                 }
//                 continue;
//             }
//
//             // This case for image arguments, names separated by comma, optional arg name i
//             if (s.length==1 || s.length==2&&s[0]==='i')
//             {
//                 // indexOf lastIndexOf split pop charAt [i] slice substr substring
//                 s = s[s.length>1?1:0].split(',');
//                 numimage = s.length; // unless an empty string perhaps??
//                 ncan = numimage;
//                 fileread = 1;
//
//                 // CORS issues?! And should flag in loadimage be 1?
//                 // And what if we don't want the amazon s3 based ones?? Needs work.
//                 if (numimage>0)
//                 {
//                     //filenames[0] = filep ? s[0] : amaz(s[0]);
//                     filenames[0] = u!=MLE ? s[0] : amaz(s[0]);
//                     loadimage( 0,img1,filenames[0] );
//                 }
//                 if (numimage>1)
//                 {
//                     //filenames[1] = filep ? s[1] : amaz(s[1]);
//                     filenames[1] = u!=MLE ? s[1] : amaz(s[1]);
//                     loadimage( 0,img2,filenames[1] );
//                 }
//                 if (numimage>2)
//                 {
//                     //filenames[2] = filep ? s[2] : amaz(s[2]);
//                     filenames[2] = u!=MLE ? s[2] : amaz(s[2]);
//                     loadimage( 0,img3,filenames[2] );
//                 }
//             }
//             else
//             {
//                 // An argument=value pair
//                 if (s[0]==='gc') { gid('gc').checked = tchf = 1; } // standalone AFAFF GC mode
//             }
//         }
//     }
//     else if (!filep) // Default initial images. (Why??)
//     {
//         // This stuff must be changed for better error handling
//         numimage = 2;
//         fileread = 1;
//         filenames = [IMG1H,IMG2H]; // What about filesizes[]?
//         loadimage( 0,img1,IMG1H ); // IMG1H; //CI (what's CI??)
//         loadimage( 0,img2,IMG2H ); // IMG2H; //CI
//     }
//     else // Why no images when protocol=='file:'?? What's the logic?? Probably simply CORS problems
//     {
//         /*
// 		// This stuff must be changed for better error handling
// 		numimage = 2;
// 		fileread = 1;
// 		filenames = [IMG1H,IMG2H]; // What about filesizes[]?
// 		img1.crossOrigin=''; // Try this 20210217
// 		img2.crossOrigin=''; // Try this 20210217
// 		loadimage( 0,img1,IMG1H ); // IMG1H; //CI (what's CI??)
// 		loadimage( 0,img2,IMG2H ); // IMG2H; //CI
// */
//         // There are no images to load. Should set up canvases anyway.
//         // Should it be done here, or closer to end??
//         // Wish we could properly draw even without images.
//         // For now, how about a message saying what's happening?
//         ///canvasfit(0); // implies displayflag===2 (ie. auto)
//         ///resizefunc(0);
//     }
//
//     // We must get rid of these calls altogether probably
//     // Or use them when we know they will work?
//     // Never (?) work for network requests - not mle, not flickr, not web.uvic.ca
//     //if (1||!tchrome())
//     //if (0) if (!safari||!filep) // async call to get those file sizes
//     //{
//     //getimgsize(0,img1.src); //img1.src);
//     //getimgsize(1,img2.src);
//     //}
//
//
//     // Set up canvases and messages etc., and draw them
//     // This function not called until initial images are loaded
//
//     // Set up the control panel callbacks
//     setcb(); // 20170212
//
//     can1 = gid('can1');	// Top canvas
//     can2 = gid('can2');	// Bottom canvas
//     can3 = gid('can3');	// 3rd canvas
//     bcv1 = gid('bcv1');	// Top big hidden canvas
//     bcv2 = gid('bcv2');	// Bottom big hidden canvas
//     ecv1 = gid('ecv1');	// 20170422 non-native image
//     ecv2 = gid('ecv2');	// 20170422 non-native image
//     ///hcv1 = gid('hcv1');	// Top (hidden) backing canvas
//     ///hcv2 = gid('hcv2');	// Bottom (hidden) backing canvas
//     canc = can1;		// Default current canvas
//
//     can1[AL]('mousedown',md,false); // ,true)?
//     can2[AL]('mousedown',md,false);
//     can1[AL]('dblclick',dc,false); // ,true)?
//     can2[AL]('dblclick',dc,false); // ,true)?
//     can1[AL]('contextmenu',cm,false);
//     can2[AL]('contextmenu',cm,false);
//
//     // These are for dropping files in canvases, seem to need both events
//     // dragstart dragenter dragleave draggable ...
//     can1[AL]('dragover',dropfunc,false);
//     can1[AL]('drop',dropfunc,false);
//     ///can1[AL]('paste',dropfunc,false); // 20200816
//     can2[AL]('dragover',dropfunc,false);
//     can2[AL]('drop',dropfunc,false);
//
//     // These don't seem to work (GC) 20160331 20200816
//     can1[AL]('paste',pastefunc,false);
//     can2[AL]('paste',pastefunc,false);
//
//     // Wheel control used for scaling, usually (scrolling too sometimes?)
//     can1[AL]('mousewheel',mw); // deprecated?
//     can1[AL]('wheel',mw); // needed for FF // or DOMMouseScroll?
//     can2[AL]('mousewheel',mw); // deprecated?
//     can2[AL]('wheel',mw); // needed for FF // or DOMMouseScroll?
//
//     /*
// 	// Test 20170124 20171214 - doesn't seem to work with Mac mouse
// 	// if ('ontouchstart' in window)
// 	can1[AL]('touch',function(){cl('touch');},false);
// 	can1[AL]('touchstart',function(){cl('touchstart');},false);
// 	can1[AL]('touchmove',function(){cl('touchmove');},false);
// 	can1[AL]('touchend',function(){cl('touchend');},false);
// 	can1[AL]('gesturestart',function(){cl('gesture');},false);
// 	//event.touches? mousewheel?
// 	*/
//
//     // Keydown/keypress events - can we have these work all over, not just canvases?
//     can1.tabIndex = 1; // Needed for key events
//     can2.tabIndex = 2; // Needed for key events
//     can1.style.outline = 'none';
//     can2.style.outline = 'none';
//     can1[AL]('keydown',kd,false);
//     can2[AL]('keydown',kd,false);
//     ///can1.focus(); // eg on mouseover?
//
//     // Should win listeners be set outside of this function??
//     ///win[AL]('resize',resizefunc,false);
//     win[AL]('resize',myEfficientFn,true); // debounced window resize to set up canvases
//
//     win[AL]('message',mrecv,false); // communicate with subwindows, like Categories
//
//     // Close associated (but semi-independent) browser windows
//     // win[AL]('beforeunload',function(){cl('unload');}); //
//     // win.onunload = function() {};
//     win.onbeforeunload = function() // win redundant?
//     {
//         cl('onbeforeunload');
//         if (wcat) wcat.close();
//         if (wpan) wpan.close();
//         if (whelp) whelp.close();
//         return null; // "Do you really want to close?";
//     };
//
//     //win.onpageshow = function() { al('page show'); }
//     //win.onpagehide = function() { al('page hide'); }
//     //win.onreadystatechange = function() { al('ready state'); }
//
//     // Callback for category menu (colours)
//     gid('menu')[AL]('click',mclick);
//
//
//     // All this stuff based on dimensions of small and large versions of image pairs.
//     // What if one image smaller than the other? Should use min().
//     let w = CANVAS_WIDTH;
//     let h = CANVAS_HEIGHT;
//
//     ///if (w>img1s.width) w=img1s.width;
//     ///if (h>img1s.height) h=img1s.height;
//
// ///var W = img1.width;
// ///var H = img1.height;
//
//     ///if (img2.width!=W || img2.height!=H)
//     ///al('WARNING: unequal image dimensions\r('+W+','+H+') and ('+img2.width+','+img2.height+')');
//
//     // Should this be in here??
//     can1.style.border = BORDER+'px solid'; // solid redundant?
//     can2.style.border = BORDER+'px solid';
//     can3.style.border = BORDER+'px solid';
//     //for (var e=doc.querySelectorAll('.top'),i=0; i<e.length; i++) e[i].style.margin=MARGIN+'px';
//
//     //clr1 = gid('clr1');
//     //clr1.value = lineclr;
//
//     setclr( fillclr, 'noname' );
//
//     // Should this be done here? Yes, because imgsfinish() not called in this initial case
//     if (filep && !img1.width) // 20171129
//     {
//         canvasfit(0); // implies displayflag===2 (ie. auto)
//         resizefunc(0);
//     }
//     else resizefunc(0); // 20180314 Not sure this is safe, but need to set up reflow control
//     // The image load callbacks might cause trouble, at the very least redundancy?
//
//
//     // This is dumb and repetitive, but FF seems to need explicit resetting of selectors
//     // 20200117 Same seems to be true of GC, when quit then restart with selector non-zero?!
//     // Editing iat.html to say 'option selected' does not help
//     gid('ns')[SI] = ncan-1;
//     gid('ds')[SI] = displayflag;
//     gid('ss')[SI] = showflag;
//     gid('fs')[SI] = 0;	// function ('grey') selector
//     gid('ts')[SI] = 0;	// file save type TXT
//     gid('ps').value = 'assi'; // 0
//
//     gid('cr').checked = corsflag;
//     gid('gc').checked = tchf;
//     gid('bm').checked = bmpf;
//
//     // Get top menu buttons, set their styles/colours // 20171218
//     tmb = doc.getElementsByClassName('b');
//     for ( i=0; i<tmb.length; i++ ) tmb[i].style.color = tbflags[i]?TBHIGH:TBNORM;
//     ///cl('tmb length '+tmb.length);
//
//     if (win.gc && gid('gcid')) gid('gcid').style.display = 'inline-block'; // Chrome garbage collector
//
// ///mess('ms-img','('+W+','+H+')');
//     mess('ms-img','('+-1+','+-1+')');
//
//     // Here, maybe should show an error message if something happened before we got here (?!)
//     messfns();
//     //mess('ms-reg','Ready ('+win.innerWidth+','+win.innerHeight+','+toh()+')');
//     mess('ms-reg',numimage?'Loading ...':'Ready');
//
//     can1.focus(); // Need this for keydown events
//     cl('win onload done');
//
//     // Chrome garbage collector
//     if (win.gc && gid('gcid')) gid('gcid').style.display = 'inline-block';
//
//     // 20160916 alert(gid('divtools').innerHTML);
//     // whole panel comes out, complete with callback calls!
//
//     // Sarris: fixes a problem where double clicking causes text to get selected on the canvas
//     //can1.onselectstart = function () { return false; }
//
// } // win.onload
//
//
// function fullscreen() // what a crappy function
// {
//     //element.requestFullscreen doc.exitFullscreen doc.documentElement ?
//     // was i=gid('divall')
//     let j,i=gid('divall'), //doc.documentElement,
//         a=['r','webkitR','mozR','msR'], s='equestFullScreen';
//     for ( j=0; j<a.length; j++ ) if (i[a[j]+s]) return i[a[j]+s]();
//
// } // fullscreen
//
//
// // Called mostly from external buttons, but once in here too
// // Pass in event e to get the shiftKey
// // Getting out-of-control complicated!
// // f===3 (Mask draw) disconnected
// // f===4 A for align (ie. realign)
//
// function redrawfunc(e,f) // Clear data if f===1 set, and redraw all images and objects therein
// {
//     // 0==redraw  1==clearredraw  2==showflagchange  3==mask(redundant?)  4==align(depr?)
//
//     // What about clearing the canvases, just in case??
//     // Have to save contexts, or fool clearRect()
//     let s = sf<100 ? 100/sf : 1;
//     let w = s*can1.width;
//     let h = s*can1.height;
//
//     ctx1.clearRect( 0,0, w,h ); // necessary?
//     ctx2.clearRect( 0,0, w,h ); // necessary? // can2?
//
//     let sk = e!=null ? e.shiftKey : 0;
//     let ck = e!=null ? e.altKey||e.metaKey : 0;
//
//     if (f===0)
//     {
//         showflag = SHOWHIDE; // ??? Why is this?
//         gid('ss')[SI] = showflag;
//     }
//
//     if (f===2)
//     {
//         if (!ck&&!sk) showflag = (showflag+1) % 6; // Allows for displaying show message without changing show mode
//
//         ///mess('ms-reg','Show '+(showflag==SHOWNORM?'normal':showflag==SHOWINVT?'inverted':showflag==SHOWHIDE?'images and objects':
//         ///showflag==SHOWNIMG?'objects only':showflag==SHOWOHID?'all objects':'images only'));
//     }
//
//     if (f===4) // Realign images (could be active canvas dependant?)
//     {
//         // sk means put back to (0,0)
//         // ck means move can2, not can1
//         if (sk) srcx1=srcy1=0;
//         if (ck) srcx2=srcx1,srcy2=srcy1; else srcx1=srcx2,srcy1=srcy2;
//     }
//
//     if (f===3) // mask instead of image - maybe should apply to only one canvas?
//     {
//         // What about drawing to bigger hidden canvases???
//         //ctx1.fillRect( 0,0, w,h ); // fillstyle=black?
//         //ctx2.fillRect( 0,0, w,h );
//     }
//     else if (showflag!=SHOWOHID) drawimages(); // Redraw the photographic background
//
//     if (ctrlflag && f===1)
//     {
//         CtrlPts = [];
//         mess('ms-reg','Align: Points cleared');
//         drawimages();
//     }
//     if (!ctrlflag)
//         if (f===1) // clear objects - dangerous!
//         {
//             let i = Regions.length;
//             Regions=[],Points=[],CtrlPts=[],rtw=0;
//             selectflag = NOSELECT;
//             mess('ms-reg',''+i+' region'+(i==1?'':'s')+' deleted');
//         }
//         else // draw all objects
//         {
//             drawobjects( showflag==SHOWHIDE||showflag==SHOWOHID, f===3||showflag==SHOWNIMG||showflag==SHOWOHID );
//
//             // Don't erase our 'Show' message
//             let l=Regions.length;
//             if (f!=2) if (l) mess('ms-reg','Redraw '+l+' region'+(l==1?'':'s'));
//         }
//
// } // redrawfunc
//
//
//
// function greyfunc(e) // called only from Grey selector and adjacent GO button
// {
//     let greyval = 0;
//
//     cl('greyfunc: e='+e+' e[SI]='+e[SI]+' greyval='+greyval);
//     // gid('fs')[SI] needed?! 20200117
//     if (e[SI]!=null) return greyval = e[SI];	// Selection pulldown: Switch modes only
//
//     let ck = e!=null ? e.altKey||e.metaKey : 0;	// Shortcut for revert
//     //e.preventDefault();
//
//     greyval = gid('fs')[SI]; // HACK? 20200117
//     cl('greyval: '+greyval);
//
//     // Note that ALT key overrides current choice, for Revert
//     if (greyval==16||ck) // revert
//     {
//         let f = canc===can1;			// top canvas
//         // Revert to original image
//         // Should we keep the hidden canvas around? No. Hmmm, why not? Revert back?
//         // 20200716 Looking at this again, with empty canvas in saveuimg()
//         if (f)
//         {
//             bcv1.width = bcv1.height = 0;
//             cl('Reset backing canvas 1');
//         }
//         else
//         {
//             bcv2.width = bcv2.height = 0;
//             cl('Reset backing canvas 2');
//         }
//
//         drawimages(); // Too much redrawing! Should just do the affected canvas(es)
//         drawobjects();
//
//         mess('ms-reg','Revert');
//         mess('ms-tm','');
//         return;
//     }
//     if (greyval==0) return grey(e);		// grey
//     if (greyval==1) return clean(e);	// clean
//     if (greyval==2) return getcolours(e);	// colours
//     if (greyval==3) return compare(e);	// compare
//     if (greyval==4) return invert(e);	// invert
//     if (greyval==5) return flip(e);		// flip top/bottom
//     if (greyval==6) return mirror(e);	// mirror image left/right
//     if (greyval==7) return rotate(e);	// rotate image about its centre
//     if (greyval==8) return reduce(e);	// reduce colours
//     if (greyval==9) return opaque(e);	// set all alpha channels to 255 // 20200118
//
//     // Put a option disabled (9) in the select widget here. Confusing!
//     if (greyval==11) return fillarea(e);		// scan fill an area
//     if (greyval==12) return fillcat(e);		// scan fill all areas of given colour
//     //if (greyval==13) return grabpolyregion(e);	// SYV mask-poly conversion
//     if (greyval==13) return grabpoly(e);		// MJW grab poly
//     if (greyval==14) return graball(e,1);		// MJW grab all polys of same colour
//     if (greyval==15) return graball(e);		// MJW grab all the polys
//     if (greyval >16) return cl('unimplemented'); // See 16 above too!! Check
//
// } // greyfunc
//
//
//
// function mess( id, s )
// {
//     let x = gid(id);
//     if (x) x.innerHTML = s;
//     psend(id,s);
// }
//
// function mess1( id, s )
// {
//     let x = gid(id); if (x) x.value = s;
//     psend('cs',s); // HACK!
// }
//
// function messfns() // fill in the file names and file sizes message
// {
//     let f=filenames, s=filesizes;
//     //var nm = function(s){return s;}
//     //function nm(s) { return s.substring(1+s.lastIndexOf('/')); }
//     //function nm(s) {var i;return pathflag?s:s.substring(i=1+s.lastIndexOf('/'),i+50);}
//     mess('ms-fns','&nbsp; '+nm(f[0])+' '+(s[0]?'('+(s[0]/1024>>0)+' KB)':'')+
//         ' &nbsp; &nbsp; '+nm(f[1])+' '+(s[1]?'('+(s[1]/1024>>0)+' KB)':''));
// }
//
//
// function setscale(s)
// {
//     // Note drawimages is supposed to clearRect, but does not know about the scale/zoom?!
//     // Also, should not clear unless necessary?! (eg. scaled image smaller than canvas)
//
//     // Set scale with the transform? Or clearRect without the setTransform?
//     // Use drawImage() with scaling instead?
//
//
//     // Unused code below
//     if (scalflag===0) // Apply our scaling experiment
//     {
//         ctx1.setTransform(1, 0, 0, 1, 0, 0);
//         ctx1.clearRect(0,0,can1.width,can1.height); // necessary?
//         ctx1.scale(s,s);
//         //ctx1.setTransform(s,0,0,s,0,0);
//
//         ctx2.setTransform(1, 0, 0, 1, 0, 0);
//         ctx2.clearRect(0,0,can2.width,can2.height); // necessary?
//         ctx2.scale(s,s);
//         //ctx2.setTransform(s,0,0,s,0,0);
//     }
//
// } // setscale
//
//
// // Called only from slider control. Should use debounce and/or throttle.
// // 0==SCALE 1==FADE 2==MASK 3==ALPHA 4==JPG 5==ANGLE
//
// function sliderfunc( value,i ) // i:0==oninput i:1==onchange i:2==onmouseup 1:4==textbox
// {
//     mess1('ms-rng',value);
//     let v = parseInt(value);
//
//     // Scale experiments 20150905 // This called lots, call as little or as speedy as possible
//     // Too many events reaching here! Need a new strategy for when to draw.
//     // Should only draw objects after i==2 (onmouseup), but there are other events after on some browsers.
//
//     if (fadeflag===0) // Scale
//     {
//         if (v==sf) return; // We already drew at this scale??
//
//         let xx,yy; // Centre point of object, in image coordinates
//         // WARNING: loss of precision with repeated scaling
//         // Set minimum scale? Retain canvas coordinates??
//         // Perhaps try to scale about image centre?
//
//         if (selectflag==VIEWSELECT) // Centre of viewer
//         {
//             xx=rtx+rtw/2,yy=rty+rth/2;
//
//             srcx1=srcx2=sf*(xx+srcx1)/v-xx>>0;
//             srcy1=srcy2=sf*(yy+srcy1)/v-yy>>0;
//         }
//         else if (selectflag>VIEWSELECT) // Centre of object
//         {
//             let r = Regions[selectflag][REXT];
//             xx=r[0]+r[2]>>1,yy=r[1]+r[3]>>1;
//
//             srcx1=srcx2=sf*(xx+srcx1)/v-xx>>0;
//             srcy1=srcy2=sf*(yy+srcy1)/v-yy>>0;
//         }
//
//         // If no object selected, perhaps should scale on centre of canvas??
//         sf = v;
//         ///cl('slider: sf '+sf);
//         setscale( v/100 );
//
//         // Maybe only redraw objects (especially if a bunch of them) iff the mouseup event? (But what about cursor keys?)
//         drawimages();
//         drawobjects();
//         return;
//     }
//
//     if (fadeflag===3) // Alpha
//     {
//         if (v==af) return; // Already done?!
//
//         af = v;
//         v/=100;
//
//         // Selected object (or objects? or categories?) get changed alpha
//         // Perhaps should include all contained in viewer? Or touching viewer? (If viewer is selected.)
//
//         drawimages();
//         drawobjects();
//         return;
//     }
//
//     // These two, just adjust parameter, and wait for function that uses it
//     if (fadeflag==4) jf = v; // JPG quality, for save
//     if (fadeflag==5) tf = v; // ANGLE (theta) [0,360] // for rotation // 20191210
//
//     // These two (fade and mask fade) get done immediately
//     if (fadeflag===1 || fadeflag===2) fadefunc(v);
//
// } // sliderfunc
//
//
// function fadefunc(v)
// {
//     // Fade applied to (1) viewer, (2) selected item, or (3) entire image.
//     // Maybe this fade code is also called way too often?
//     // How about implementing inverse fade?
//
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     let i=v;
//     if (fadeflag===1) ff = v; else mf = v;
//     v/=100;
//
//     let t = bcv1.width!=0 ? bcv1 : I1;
//     let b = bcv2.width!=0 ? bcv2 : I2;
//
//     if (selectflag==VIEWSELECT) // fade viewer rectangle
//     {
//         let x=rtx, y=rty, w=rtw, h=rth;
//         x+=srcx1,y+=srcy1;
//
//         if (i<100) drawrect( ctx1, t, x,y, w,h, 0 );
//         if (i<100) ctx1.globalAlpha = v;
//         drawrect( ctx1, b, x,y, w,h, 0 );
//         if (i<100) ctx1.globalAlpha = 1.0;
//
//         if (i<100) drawrect( ctx2, b, x,y, w,h, 0 );
//         if (i<100) ctx2.globalAlpha = v; // 1.0-v;
//         drawrect( ctx2, t, x,y, w,h, 0 );
//         if (i<100) ctx2.globalAlpha = 1.0;
//     }
//     else if (selectflag>VIEWSELECT) // fade selected object
//     {
//         // Do not apply this to freehand draw (curves)
//         if (!Regions[selectflag][RTYP])
//         {
//             let P = Regions[selectflag][0];
//
//             // Grab image data from images, or adjusted images in hidden canvases if applicable
//             drawpoly( ctx1, P, 0, 0, 0,  t, 1 );
//             drawpoly( ctx1, P, 0, 0, 0,  b, v );
//
//             drawpoly( ctx2, P, 0, 0, 0,  b, 1 );
//             drawpoly( ctx2, P, 0, 0, 0,  t, v );
//         }
//     }
//     else // Apply fade to entire canvas
//     {
//         // Does EVERYTHING always have to be redrawn?
//         //backstore();
//         drawimages(null,fadeflag===2?1:0);
//         drawobjects();
//     }
//
// } // fadefunc
//
//
//
// // Called only from 'Canvas size' control
//
// function inputfunc(v)
// {
//     let w,h;
//     w = parseInt(v);
//     h = parseInt(v.substring(1+w.toString().length));
//     if (!isNaN(w) && !isNaN(h)) canvasresize(null,w,h);
//     //setpa('cs',w+','+h);
// }
//
//
// function clipfunc(e)
// {
//     // HACK this button for alignment mode // 20171128
//     if (ctrlflag && selectpnt>-1)
//     {
//         let t = selectpnt & ~1; // >>1<<1
//         ///if (t>CtrlPts.length) return
//         CtrlPts.splice(0,0,CtrlPts[t],CtrlPts[t+1]);
//         CtrlPts.splice(t+2,2);
//         selectpnt = NOSELECT;
//         drawimages();
//         mess('ms-reg','Align: points '+(t+1)+' and '+(t+2)+' inserted');
//         return;
//     }
//
//     // Allow cropping if viewer selected (and big enough?)
//     if (selectflag==VIEWSELECT)
//     {
//         mess('ms-reg','Viewer: crop');
//         return;
//     }
//
//     // Default (and original) action, now forgotten
//     if (3===++clipflag) clipflag=0;
//     mess('ms-reg','Clip '+clipflag);
// }
//
//
// function cropfunc(e) // 20200907
// {
//     // Crop to viewer (if selected)
//     // Just one canvas, or both?
//     // Just to backing canvas, or to saved canvase ecv?
//     mess('ms-reg','Viewer: crop');
//
// } // cropfunc
//
// function zoomfunc(e) // not used yet
// {
//     /*
// 	// Offer a "convenient" zoom, based on middle, or cursor, or similar
// 	// current canvas, mode, selection, ...
// 	// Zoom out again too, so remember old scale factor
// 	// Would be nice to show zoom point momentarily, and a mid-zoom perhaps
// 	//cl('zoom!');
//
// 	var sk = e?e.shiftKey:0;
// 	var ck = e?e.altKey||e.metaKey:0;
//
// 	sf = 200;
//
// 	// Zoom point in image coordinates
// 	zx = 500;
// 	zy = 400;
//
// 	// Miserable GUI side-effects
// 	setscale(sf/100);
// 	//gid('rs')[SI] = 0;
// 	scalefunc(0);
//
// 	drawimages();
// 	if (!ctrlflag) drawobjects();
//
// 	mess('ms-reg','Zoom in');
// */
// }
//
//
// // We need a more general move function, which can take care of:
// // (1) translate, (2) scale/fit, (3) other, (4) constraints
//
// // Called only from HTML cursor buttons, or key shortcuts
// // Move (translate) LRUD, or C (centre)
// // What about move/centre only current canvas? Not done
//
// function movefunc( e, x,y )
// {
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     let sk = e?e.shiftKey:0;			// Centre on viewer/object, rather than whole image
//     let ck = e?e.altKey||e.metaKey:0;	// Move by only one pixel (but image coordinates!?)
//     let m = ck?1:sk?100:20;
//
//     if (x==0&&y==0) // Centre the canvas on the underlying image or selected object
//     {
//         let xx=I1.width,yy=I1.height;
//         if (sk) if (selectflag==VIEWSELECT)
//         {
//             xx=rtx*2+rtw,yy=rty*2+rth;
//         }
//         else if (selectflag>VIEWSELECT)
//         {
//             let r=Regions[selectflag][REXT];
//             xx=r[0]+r[2],yy=r[1]+r[3];
//         }
//         srcx1=srcx2=can1.width*100/sf-xx>>1;
//         srcy1=srcy2=can1.height*100/sf-yy>>1;
//     }
//     else if (ctrlflag && selectpnt>-1) // HACK! // 20171128
//     {
//         m = ck||sk ? 10:1;
//         let p = CtrlPts[selectpnt];
//         p[0] -= x*m;
//         p[1] -= y*m;
//         mess('ms-reg','Align: Perturb '+(selectpnt+1)+': ('+(p[0])+','+(p[1])+')');
//     }
//     else
//     {
//         // integer ??
//         srcx1+=m*x,srcy1+=m*y;
//         srcx2+=m*x,srcy2+=m*y;
//     }
//
//     drawimages();
//     if (!ctrlflag) drawobjects();
//
// } // movefunc
//
//
// // Called only from Delete (f===0), Hide (f===1), Back (f===2), Set (f===3) buttons
// // Object editing
//
// function deletefunc(f,e) // Take away a selected region, or perhaps a control point
// {
//     let i,c,r,s,n;
//     let sk = e?e.shiftKey:0;
//     let ck = e?e.altKey||e.metaKey:0; // scalflag test
//
//     cl('deletefunc: f='+f);
//
//     // One day we'll get this scale thing finished
//     if (0) if (ck) // Scaling experiments - HACK
//     {
//         scalflag = 1-scalflag;
//         if (scalflag>0)
//         {
//             ctx1.setTransform(1,0,0,1,0,0);
//             ctx2.setTransform(1,0,0,1,0,0);
//         }
//         else
//         {
//             s = sf/100;
//             ctx1.setTransform(s,0,0,s,0,0);
//             ctx2.setTransform(s,0,0,s,0,0);
//         }
//         mess('ms-reg','Scaling flag: '+scalflag);
//         return;
//     }
//
//
//     if (ctrlflag)
//         if (f===0) // assuming alignment mode
//         {
//             n = CtrlPts.length;
//             if (sk)
//             {
//                 CtrlPts = [];
//                 selectpnt = NOSELECT;
//                 mess('ms-reg','Align: All points deleted');
//             }
//             else
//             {
//                 if (selectpnt>-1)
//                 {
//                     CtrlPts.splice(selectpnt,1);
//                     mess('ms-reg','Align: point '+(selectpnt+1)+' deleted');
//                 }
//                 else
//                 {
//                     mess('ms-reg','Align: '+(n?'Point '+n+' deleted':'No points!'));
//                     ///selectpnt = NOSELECT;
//                     if (n>0) CtrlPts.pop();
//                 }
//             }
//             drawimages(); // redraw so that points are erased
//             return;
//         }
//
//
//     // This case for deleting last object
//     if (f===0 && sk)
//     {
//         if (!Regions.length) mess('ms-reg','No objects to delete!');
//         else
//         {
//             Regions.splice(Regions.length-1,1);
//             mess('ms-reg','Most recent object deleted, '+Regions.length+' left');
//         }
//     }
//     else if (f===2 && ctrlflag)
//     {
//         mess('ms-reg','Align: unimplemented!');
//     }
//     else if (f===3 && ctrlflag) // Set colour of selected align crosshair // 20200820
//     {
//         mess('ms-reg','Align: Set colour');
//         // If one is selected, set that colour, otherwise set last point chosen
//         // Unimplemented?!
//         return;
//     }
//     else if (f===3 && ck) // overload to mean set background colour of canvas - HACK 20200117
//     {
//         c = gid('clr2').value;
//         can1.style.background = can2.style.background = c;
//         mess('ms-reg','Background colour changed to '+c);
//         return; // Redrawing of images apparently not needed on W7 GC and FF!?
//     }
//     else if (selectflag==NOSELECT)
//     {
//         if (f===3 && gridflag) // When nothing selected, maybe set grid colour? // 20210308
//         {
//             gridclr = gid('clr2').value;
//             mess('ms-reg','Change grid colour to '+gridclr);
//         }
//         else
//         {
//             rtw = 0;
//             mess('ms-reg','Nothing selected!');
//         }
//     }
//     else if (selectflag==VIEWSELECT)
//     {
//         // Can't figure out a meaning for hide Viewer yet. Maybe keep but no draw?
//         if (1||f===0) rtw=0,mess('ms-reg','');
//     }
//     else
//     {
//         if (f===1) // Hide
//         {
//             r = Regions[selectflag];
//             r[RHID] = (r[RHID]+1) % 4;
//             r = r[RHID];
//             mess('ms-reg','Region '+selectflag+': hide '+(r==0?'none':r==1?'2':r==2?'1':'both'));
//         }
//         else if (f===2) // Back (Fore?)
//         {
//             r = Regions[selectflag];
//             Regions.splice(selectflag,1);
//             Regions.unshift(r);
//             mess('ms-reg','Region '+selectflag+' pushed to back');
//             selectflag = 0;
//         }
//         else if (f===3) // Change (edit?) category
//         {
//             r = Regions[selectflag];
//             c = r[RCLR];
//             n = gid('clr2').value; // fillclr? // 20180220
//             mess('ms-reg','Region category '+(c==n?'un':'')+'changed');
//             if (sk) for ( i=0; i<Regions.length; i++ )
//                 if (Regions[i][RCLR]==c) Regions[i][RCLR] = n;
//             r[RCLR] = n;
//         }
//         else // (f===0)? // Delete
//         {
//             Regions.splice(selectflag,1);
//             mess('ms-reg','Region deleted, '+Regions.length+' left');
//         }
//     }
//
//     if (f===0) selectflag = NOSELECT;
//
//     // Too much drawing again?! Don't do unless something changes!
//     drawimages();
//     if (!ctrlflag) drawobjects();
//
// } // deletefunc
//
//
// // Called only from Grid button
//
// function gridfunc(e)
// {
//     let sk = e.shiftKey;	// HACK - clear messages
//     //var ck = e.altKey||e.metaKey;
//
//     if (sk) return mess('ms-reg',''),mess('ms-tm','');
//
//     // Maybe should allow n types of grid on [0..n]??
//     gridflag = !gridflag;
//     drawimages();
//     drawobjects();
//
// } // gridfunc
//
//
// // Called only from project selection control
//
// function projectfunc(e) // v is a filename, without suffix
// {
//     // Use AJAX (or dynamic load) to load files from server for a given demo, via an IAT .txt file
//     // Edit html file (and put files at server) to add projects
//
//     ///if (tchrome(1)) return;
//     e = e.target;
//     let v = e.value; // e.value for 'this'
//
//     v += '.txt'; // '.json'? '.iat'?
//     cl('project select: '+v);
//     if (e.extra) cl(' extra='+e.extra); // What's this used for??
//
//     // Standalone IAT might not have AFAFF (and FF) CORS options set, so no AJAX // 20200211
//     // However, we still cannot test for AFAFF. Should we try it if dynamicload() fails?
//     if (filep)
//         dynamicload(v);
//     else
//         getjsonfile(v);
//
//     // This part is a problem for the popup panel
//     if (e.options) doc.title = 'IAT - '+e.options[e[SI]].text;
//     else if (e.extra) doc.title = 'IAT - '+e.extra;
// }
//
//
// // Called only from ONE buttons: colour (linewidth and others deprecated)
// // Use the built-in colour widget to define a new colour
//
// function colourfunc(i,e) //  1==clr1  2==clr2  3==linewid  4==fit,  0==scale  1==fade
// {
//     // Note only one colour - fillclr (i==2) - currently being used
//     //var v = e.value;
//     let v = gid('clr2').value; // 20180220
//     cl('colourfunc: i='+i+' v='+v+' e.type='+e.type);
//
//     ///cl('cf: '+e.shiftKey);
//     if (i==1) lineclr = v;
//     else if (i==2)
//     {
//         fillclr = v;
//         if (safari) gis('clr2').background = v; // '#ff0000';
//
//         // Set colour of selected object too - 20170111
//         ///if (selectflag>VIEWSELECT) Regions[selectflag][RCLR] = v;
//     }
//     else if (i==3) linewid=v;
//
// } // colourfunc
//
//
// // Called only from external 'Fit' button, and from canvasfit() (and keyboard shortcut)
// // Redefines origin (x,y) and scale factor (sf) so that image/viewer/object fits the canvas size
// // But do not scale to viewer or object if e is null
//
// function fitfunc(e)
// {
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     if (e) canc.focus(); // HACK to allow focus on canvas, to allow key events 20171130
//
//     let sk = e?e.shiftKey:0;			// Fit to larger dimension, not smaller
//     let ck = e?e.altKey||e.metaKey:0;	// Realign images
//
//     if (ck) srcx2=srcx1,srcy2=srcy1;
//
//     let s = e?selectflag:NOSELECT; // 20170125
//     let b = s!=NOSELECT;
//     let v = s==VIEWSELECT;
//     let r = v||!b?0:Regions[s][REXT];
//
//     // This will re-align the canvases as a side effect
//     srcx1 = srcx2 = v?-rtx:b?-r[0]:0;
//     srcy1 = srcy2 = v?-rty:b?-r[1]:0;
//
//     let s1 = can1.width/(v?rtw:b?r[2]-r[0]:I1.width);
//     let s2 = can1.height/(v?rth:b?r[3]-r[1]:I1.height);
//
//     // xor: if( !foo != !bar )  ...
//     s1 = sk!=s1>s2?s1:s2;
//     sf = s1*100;
//     ///cl('scales: '+s1+' '+s2);
//
//     // Miserable GUI side-effects
//     setscale(s1);
//     gid('rs')[SI] = 0;
//     scalefunc(0);
//
//     drawimages();
//     drawobjects();
//
// } // fitfunc
//
//
// // Called from XML getjsonfile() and filefunc() (ie. file drag-and-drop or input button)
//
// function loaddata( fname, val, sk ) // When sk is 1, add objects (not replace) to scene
// {
//     let i,j,k, all, s = 'Error: JSON file '+fname;
//     if (val==null||val=='') return mess('ms-reg','Load data failure'),al(s); // mess('ms-reg',s);
//
//     //cl('val='+val);
//
//
//     if (typeof val==='string') // 20180116
//     {
//         // This is a HACK. I want standalone to work better, sometimes AJAX not available,
//         // so allow parsing of JS code rather than JSON
//         if (val[0]!='[')
//         {
//             // Strip off 'iat.proj=' (if exists), not needed here
//             val = val.substring(1+val.indexOf('='));
//             //cl('string val: '+val);
//         }
//
//         // I hate try/catch, but what other way to trap bad syntax?
//         try { all = JSON.parse(val); } // Watch for bad read
//         catch(e) { al('Bad IAT syntax: file '+fname); return; }
//     }
//     else
//     {
//         all = val; // an Object/dictionary
//     }
//
//     // Should test for more syntax inconsistency
//
//     // Decide whether to just define new regions, or add to existing ones
//     if (!sk) Regions = all[0];
//     else
//     {
//         // Here, we add regions rather than replace, and adjust hide flags
//         // Should this depend on current canvas? Or something?
//
//         for ( i=0,j=Regions.length; i<j; i++ ) Regions[i][RHID] = 1;
//         for ( i=0,j=all[0].length; i<j; i++ ) all[0][i][RHID] = 2;
//         Regions = Regions.concat(all[0]);
//     }
//
//     // Load images by assigning name to img.src (images could be big!)
//     // What if no images? What if null? What if empty set? How many?
//     // Need to define semantics for what to happen. No images? Leave images untouched?
//
//     let names = all[1].length>0 ? all[1][0] : [];
//     cl('image names='+names);
//     let masks = [];
//
//     // Now allowing list of masks following list of images 20161122
//     if (names.length>0 && names[1] instanceof Array) // typeof x==='string'
//     {
//         masks = names[1];
//         cl('got '+masks.length+' masks!!');
//         for ( i=0; i<masks.length; i++ ) cl('    mask '+i+': '+masks[i]);
//         names = names[0];
//     }
//     ///if (names.length<3) // What about where only one - or 3 - file?? Should be allowed
//     if (1) // 20171127
//     {
//         // Watch out! Some time before images are loaded. Use callback
//         // Didn't we set the timer already (sometimes)??
//
//         // It's possible to have a list of 3, with last empty?! // 20171127
//         for ( k=0; k<names.length; k++ ) if (names[k]==='') break; // 20171127
//         j = masks.length;
//
//         numimage = k + j;
//         gotimage = 0;
//         fileread = 1;
//
//         gtime = ts();
//         mess('ms-tm','');
//         if (numimage) mess('ms-reg','Loading '+k+' images '+(j?'and '+j+' masks ':'')+'...');
//
//         // Should we look around for names? wwwroot? desktop??
//         // Maybe should strip the file:// part or http:// protocol part??
//         // Maybe no bother to load if files (or filenames) are the same??
//
//         // Should probably clear the entire previous project
//         // Or should we?? // 20171212
//         for ( i=0; i<k; i++) filenames[i] = names[i]; // ?? Should copy??
//         filesizes = [0,0,0];
//
//         // Should this pair be first? Note these calls might not work if files are local
//         // Could also fail due to CORS problems. Too bad - nice to know file sizes
//         // Could also fail if name not exactly correct (eg. assumed image/ prefix!?)
//         // There is a time penalty! (Not much)
//         // FF: works for s and f protocols, local files, load json file
//         // GC: As above, works only for s (not f)
//         // GC: http and s: console reports 'Refused to get unsafe header "Content-Length"' even with CORS (flickr)
//         ///f (1) if (numimage>0) getimgsize(0,names[0]);
//         ///if (1) if (numimage>1) getimgsize(1,names[1]);
//
//         // CORS issues? Eventually simplify to handle up to 3 or 4 or more
//         for ( i=0; i<k; i++ )
//         {
//             cl('img-'+i+': '+names[i]);
//             ///loadimage( 0, IMGS[i], names[i] ); // img1 and img2
//             loadimage( 0, i?img2:img1, names[i] );
//         }
//         j = masks.length;
//         for ( i=0; i<j; i++ )
//         {
//             cl('msk-'+i+': '+masks[i]);
//             loadimage( 0, MSKS[i], masks[i] );
//         }
//     }
//
//     // Categories/classifications/colours, if there
//     // Should we not keep old categories if no new ones (distinct from empty set)?
//     catmenu = all[1].length>1? all[1][1] : [];
//     oldmenu = catmenu.slice();
//
//     // Control points, if there (check for proper format?)
//     if (all[1].length>2)
//     {
//         CtrlPts = all[1][2];
//         if (ctrlflag) drawimages(); // Show the points
//     }
//
//     let l = Regions.length;
//     //mess('ms-reg','Retrieve '+l+(l==1?' object':' objects'));
//
//     // Reset and redraw a bunch of stuff. Should be more organized.
//     rtw = 0;
//     selectflag = NOSELECT;
//
//     showflag = SHOWNORM;
//     gid('ss')[SI] = showflag;
//
//     if (fileread==0) redrawfunc(null,0);
//
//     drawmenu(null,1);
//     msend('ldd');
//
//     //if (wcat) wcat.focus(); else if (!menuflag) showmenu();
//     // Comment this out for now, mostly due to default categories and demos // 20171201
//     ///if (catmenu.length) catpopup(); // 20170228
//
// } // loaddata
//
//
// // Called only from external Store/Retrieve/Delete buttons and the dynamic categories
// // Originally designed for localstorage or text, now files are preferred
// // 20161118 - Only save-to-file remains
// // Numbers must match code in iat.html - check savetype
// // 20190306 Added option for UPNG - test
// // 20200713 Added TIF-8P (8 bit palette) - test (7)
//
// function savefile( e )
// {
//     let sk = e?e.shiftKey:0; // for images, means save canvas instead of whole thing
//     let time = ts();
//
//     let cant, ctxt, w,h,f, D1, R; // for BMP and TIF
//     let i, C; // for TIF palette 8b save 20200713
//
//     cl('savetype '+savetype);
//     // HACK! Saving files is a mess right now 20160314
//     if (savetype==2 || savetype==4) // 0==txt 1==htm 2==PNG 3==UPNG 4==JPG) (or 6,7,8,9==TIF)
//     {
//         saveuimg( e, savetype==4 ); // Saving an image "natively" (PNG(2) and JPG(4) only)
//         return;
//     }
//
//     // Will be disabled if specified as such in iat.html
//     if (savetype==3) // UPNG: Code repeated below // 20190306
//     {
//         // See https://github.com/photopea/UPNG.js?files=1
//         cl('Attempt to save a UPNG');
//         cant = sk ? canc : getbcvs( canc===can1?1:2 );
//         ctxt = gctx(cant);
//         w = cant.width;
//         h = cant.height;
//         D1 = ctxt.getImageData( 0,0, w,h ).data;
//
//         // Even if have extension, no works. But with extension, no shelf (grey bar at bootom)
//         //chrome.downloads.setShelfEnabled(false); // 20190307
//         R = UPNG.encode([D1.buffer],w,h, 0 ); // ncol=1+catmenu.length? Does not work
//
//         time = ts()-time;
//         mess('ms-tm',time+' ms');
//         mess('ms-reg','Save file: '+R.length+' bytes');
//
//         saveByteArray([R],'upng-'+f+'.png');
//         return;
//     }
//     /*
// // Read RGBA from canvas and encode with UPNG
// var ctx = sk ? canc : getbcvs( canc===can1?1:2 ); // MJW
// ctx = gctx(ctx);
// var dta = ctx.getImageData(0,0,200,300).data;  // ctx is Context2D of a Canvas
// //  dta = new Uint8Array(200 * 300 * 4);       // or generate pixels manually
// var png = UPNG.encode([dta.buffer], 200, 300, 0);   //console.log(new Uint8Array(png));
// */
//
//     if (savetype>10) // 11,12, // BMP: Code repeated below, for TIF
//     {
//         cl('Attempt to save a BMP!');
//         cant = sk ? canc : getbcvs( canc===can1?1:2 );
//         ctxt = gctx(cant);
//         w = cant.width;
//         h = cant.height;
//         D1 = ctxt.getImageData( 0,0, w,h );
//
//         f = savetype==11 ? 24 : savetype==12 ? 32 : 0;
//         R = saveBMP( D1, f );
//
//         time = ts()-time;
//         mess('ms-tm',time+' ms');
//         mess('ms-reg','Save file: '+R.length+' bytes');
//
//         saveByteArray([R],'iat-'+f+'.bmp');
//         return;
//     }
//
//     if (savetype>5) // 6,7,8,9, // TIF: Code repeated above, for BMP
//     {
//         //cl('Attempt to save a TIF!');
//         cant = sk ? canc : getbcvs( canc===can1?1:2 );
//         ctxt = gctx(cant);
//         w = cant.width;
//         h = cant.height;
//         D1 = ctxt.getImageData( 0,0, w,h );
//
//         // 20200714 Save palette
//         //for ( i=0; i<catmenu.length; i++ ) C[i] = hextorgb( catmenu[i][1] );
//
//         // tifbmp.js/saveTIF(): f===0/null => G8, f===1 => RGB32, f===2 => RGB24
//         f = savetype==7 ? 2 : savetype==8 ? 2 : savetype==9 ? 1 : 0;
//         let compression = 0; // 0==none 1==zip 2==lzw // 20190706
//         R = saveTIF( D1, f, compression );
//
//         time = ts()-time;
//         mess('ms-tm',time+' ms');
//         mess('ms-reg','Save file: '+R.length+' bytes');
//
//         saveByteArray([R],'iat-'+f+'.tif');
//         return;
//     }
//
//
//     // Type 0: TXT (ie. JSON data) or Type 1: HTM (save IAT program)
//     // Store a 2-item list: our Regions, then extra info which we'll figure out later?!
//     // Possible future format: watch for NOT two elements, then means newer, better format
//     let all,s,l;
//     if (!savetype)
//     {
//         // Allow to omit filenames (should allow other options too!?) // 20171213
//         all = [Regions,[sk?[]:filenames,catmenu,CtrlPts]]; // 20171127 added CtrlPts
//         s = js(all); // turn into JSON string
//         l = Regions.length;
//     }
//
//     // Watch out: similar code in saveuimg
//     let n = savetype ? 'iat.htm' : 'iat-data.txt'; // boring default name
//     let an = gid('ant');
//     an['download'] = n; // closure compiler (CC) misses this! // 20171205
//     an.href = savetype ? '' : makeblob(s);
//     //an.style.display = 'block';
//     an.click(); // No work on Safari? Try making explicit (visible) link instead?
//     an.href = ''; // Does this help?
//
//     mess('ms-reg','Save file '+n);
//     //mess('ms-reg','Store '+l+(l==1?' object':' objects')+(b?'':' in '+name));
//
// } // savefile
//
//
//
//
// // Called from Add (f===0), Rem (f===1), and Categories (f==-1) button on Category menu
// // Also called from Categories popup callback (??)
//
// /** @param {...*} g */
// function menufunc(e,f,g) // added g for categories popup test // 20170301
// {
//     // Get current category attributes, add to category menu.
//     // style.cssText=,insertBefore, removeChild, replaceChild, ...
//
//     //cl('menufunc '+f+' '+g);
//
//     let i,j,k,l;
//     let n = gid('ctext').value;
//     let c = gid('clr2').value;
//
//     let sk = e?e.shiftKey:0;		// indicates remove all categories
//     let ck = e?e.altKey||e.metaKey:0;	// indicates reload original menu
//
//     // Both means load built-in menu (currently Robson) 20180313
//     if (g&1) sk = 1; // HACK!
//     if (g&2) ck = 1; // HACK!
//
//
//     if (f>0) // REMOVE one or all categories, or restore last loaded menu
//     {
//         if (f>2) {} // Force redraw of menu, which forces new menu to popup
//
//         // Note removal/addition of categories might affect win layout!?
//         else if (f>1) // HACK! Encode indices in f
//         {
//             mess('ms-reg','menu test!');
//             k = f >> 1;
//             i = k&0xff, j = k>>8;
//             catmenu.splice(i,0,catmenu.splice(j,1)[0]);
//         }
//         else if (ck && sk)
//         {
//             catmenu = dfltmenu.slice();
//             mess('ms-reg','Category menu default, '+catmenu.length+' items');
//         }
//         else if (ck)
//         {
//             catmenu = oldmenu.slice();
//             mess('ms-reg','Category menu renewed, '+catmenu.length+' items');
//         }
//         else if (sk)
//         {
//             catmenu = [];
//             mess('ms-reg','Category menu emptied');
//         }
//         else
//         {
//             for ( i=0; i<catmenu.length; i++ ) if (catmenu[i][0]==n && catmenu[i][1]==c) break;
//             if (i==catmenu.length)
//             {
//                 mess('ms-reg','Category not found!');
//                 return;
//             }
//             catmenu.splice(i,1);
//             mess('ms-reg','Category removed');
//         }
//
//         drawmenu(null,3);
//         //cl('About to msend ... f='+f);
//         msend(f>2?'new':'rem');
//
//         mess('ms-cts','');
//         return;
//     }
//
//     if (sk || f<0) // HACK!
//     {
//         // parameter==1 -> remove main screen categories
//         return catpopup(f<0);
//     }
//
//     // ADD one category (with colour and name) to end of menu
//     // Should we check to see if name and/or colour already present?
//     // Should we use drawmenu()?
//     // What about found colour, but name different?
//
//     i=0, l=catmenu.length;
//     for ( ; i<l; i++ ) if (catmenu[i][1]==c) break;
//     if (i==l)
//     {
//         catmenu[i] = [n,c];
//         mess('ms-reg','Category added');
//         drawmenu(null,2);
//         msend('add');
//     }
//     else
//     {
//         // Ideally would report name inconsistencies if they exist
//         mess('ms-reg','Category already exists!');
//     }
//
// } // menufunc
//
//
// // Show and/or hide the categories/counts division
// // Parameter v unused?! Probably intended to force show or force hide
//
// function showmenu(v)
// {
//     menuflag = 1-menuflag;
//     let oh = toh();
//     gis('cat').display = menuflag ? 'inline-block' : 'none';
//     if (oh!=toh()) resizefunc(2);
//     mess('ms-reg',(menuflag?'Show':'Hide')+' categories');
//     //if (!menuflag) wcat.close();
//
// } // showmenu
//
//
// // Callback for category menu items
// // Should it be assigned to the ordered list parent instead?? Yes.
//
// function mclick(e) {mclick1(e.target.value);}
// function mclick1(v)
// {
//     if(v==null)return;
//     if(v>255) // HACK!! Swap categories around
//     {
//         let i = (v/256)%256, to = v/65536;
//         catmenu.splice(to,0,catmenu.splice(i,1)[0]);
//
//         drawmenu(null,0);
//         msend('rem');
//
//         mess('ms-cts','');
//         return;
//     }
//     let n=catmenu[v][0], c=catmenu[v][1];
//     setclr( c, n );
//
//     // Show the color button and text input if not visible
//     if (!tbflags[EDTB]) CB('Edit'); // 20170124 HACK!
//     // resizefunc?!
//
//     mess('ms-tm',c==n?'':c);
// }
//
//
// // Called only from drawmenu()
// // Only good for adding an item, not replacing!
//
// function drawitem( i,n,c )
// {
//     let m = gid('menu');
//     let e = doc.createElement('li');
//     e.innerHTML = '&nbsp; '+n+' &nbsp;';
//     e.value = i;
//     e.style.cssText='background:'+c;
//     // Should these style things be in CSS? Probably
//     ///e.style.cursor = 'pointer'; // crosshair default move etc.
//     ///e.style.whiteSpace = 'nowrap';
//     //e.style.maxWidth = '100px';
//     //e.onclick = mclick; // This done in ol surrounding class now
//
//     m.appendChild(e); // trigger reflow in GC even if hidden?
// }
//
//
// // This is confusing, a mess, and doesn't work with S very well!
// // S is optional, specifies a sort order (can be null)
//
// var menusort = 0; // oops, forgot to declare! found with CC output (but no warning)
// function drawmenu(S,f) // f optional, 1=> do not resize (??)
// {
//     // DOM: cat->cgs->menu and cat->cts->counts
//     cl('drawmenu: f='+f);
//
//     // Height of control panel might change, so watch for it, we might resize the canvases
//     let oh = toh();
//
//     // Erase previous categories menu
//     let m = gid('menu');
//     m.innerHTML = '';
//     //while (m.hasChildNodes()) m.removeChild( m.firstChild );
//
//     // Empty the counts data, since no longer lines up with the categories
//     gid('counts').innerHTML = '';
//     gis('cts').display = 'none';
//     //gis('menu').display = 'none'; // 20180314
//
//     for (let i=0,j=catmenu,k=j.length; i<k; i++)
//     {
//         let x = S?S[i]:i;
//         drawitem( x, j[x][0], j[x][1] );
//     }
//     //gis('menu').display = ''; // 20180314
//
//     //cl('oh='+oh+' toh='+toh());
//     if (f!=1) if (oh!=toh()) resizefunc(3); // Awkward side effect, causing problems
//
// } // drawmenu
//
//
//
// function hextorgb(s) // Convert string like '#ff0000' to integer
// {
//     return (parseInt(s.substring(1,3),16)<<16)+(parseInt(s.substring(3,5),16)<<8)+parseInt(s.substring(5,7),16);
// }
//
// function hextopix(s) // Convert string like '#ff007f' to 4-byte pixel (abgr) endian
// {
//     //var f = function(i,j){parseint(s.substring(i,j),16);
//     return 0xff000000|((parseInt(s.substring(5,7),16)<<16)+(parseInt(s.substring(3,5),16)<<8)+parseInt(s.substring(1,3),16));
// }
//
// function rgbtohex(r, g, b)
// {
//     return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
// }
//
// function pixtohex(x) // endian!
// {
//     return '#'+ ((1<<24)|((x&255)<<16)|(x&(255<<8))|(x>>16)&255).toString(16).slice(1);
// }
//
//
//
// // Retrieve big backing canvas, filling with corresponding image if necessary
// // Assume it's what we want already if its width is nonzero
//
// function getbcvs(f) // f===1 or f===2 (top or bottom canvas)
// {
//     let canh = f===1 ? bcv1 : bcv2;	// Hidden big canvas
//     if (canh.width>0) return canh;
//
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     let I = f===1 ? I1 : I2;	// Top or bottom image?
//     let w=I.width, h=I.height;
//     canh.width=w, canh.height=h;
//
//     // Draw the entire big image to the hidden big canvas
//     gctx(canh).drawImage( I,0,0 ,w,h );
//     return canh;
// }
//
//
// // Set up bcv1 and bcv2 for big draw of objects, and draw those objects
// // Called if saving as big PNG, as big JPG, or making a big Count
// // Parameter c==null means both canvases/images
// // flag f===1 means draw images under objects (usually if JPG)
//
// // This function needs work!
//
// function drawbigmask(c,f)
// {
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     cl('drawbigmask: bmpf='+bmpf+' ecv1.width='+(ecv1?ecv1.width:'undefn'));
//
//     // Set up flag indicating bcv1 and bcv2 are set up this way?
//     // What if bcv1 and/or bcv2 in use for a transformation??
//     // Note that any transformations - like grey or alignment - are wiped out
//
//     // HACK - If PNG or GIF files are our images, assume they are masks,
//     // and draw them to hidden canvases instead of clearing those canvases
//
//     if (c==bcv1 || c==null)
//     {
//         bcv1.width = I1.width;
//         bcv1.height = I1.height;
//         bcx1 = gctx(bcv1);
//         let ext = filenames[0].split('.').pop();
//         if (f===1 || ext=='png' || ext=='PNG' || ext=='gif' || ext=='GIF') // HACK!
//             bcx1.drawImage(I1,0,0);
//         else bcx1.clearRect(0,0,bcv1.width,bcv1.height);
//     }
//
//     // WARNING: near-duplicate code (watch out for use of img1!!)
//     if (c==bcv2 || c==null)
//     {
//         bcv2.width = I1.width; // used to be 2, caused can3 drawing bug with Assi
//         bcv2.height = I1.height; // 2?
//         bcx2 = gctx(bcv2);
//         let ext = filenames[1].split('.').pop();
//         if (f===1 || ext=='png' || ext=='PNG' || ext=='gif' || ext=='GIF') // HACK!
//             bcx2.drawImage(I2,0,0);
//         else bcx2.clearRect(0,0,bcv2.width,bcv2.height);
//     }
//
//     // This function must also know which canvases to draw into
//     drawobjects( 0, 2, c==bcv1?bcx1:c==bcv2?bcx2:null ); // HACK!
//
// } // drawbigmask
//
//
//
// function invert(e)
// {
//     // Compare with bytewise invert, eg:
//     // http://www.w3schools.com/tags/canvas_getimagedata.asp
//     let time = ts();
//     let sk = e.shiftKey;	// indicates visible canvas
//
//     // WARNING: backing canvases could be empty?!
//     let cant = sk ? canc : getbcvs( canc===can1?1:2 );
//     let ctxt = gctx(cant);
//     let w = cant.width, h = cant.height;
//
//     let D1 = ctxt.getImageData( 0,0, w,h );
//     let A = new Uint32Array( D1.data.buffer );
//
//     // Any 24-bit mask will perform some kind of inversion
//     let i=0,l=A.length,m=0x00ffffff; // 0x00ffffff; // aabbggrr, endian==true (Win?)
//     for (; i<l; i++ ) A[i] ^= m; // 0x00ffffff; // ++i?
//
//     ctxt.putImageData( D1, 0, 0 );
//     if (!sk) drawimages(); // Only need one image drawn?!
//
//     time = ts()-time;
//     mess('ms-tm',time+' ms');
//     mess('ms-reg','Invert '+l+' pixels');
//
// } // invert
//
// function mirror(e)
// {
//     let time = ts();
//     let sk = e.shiftKey;	// indicates visible canvas
//
//     let cant = sk ? canc : getbcvs( canc===can1?1:2 );
//     let ctxt = gctx(cant);
//
//     let D1 = ctxt.getImageData( 0,0, cant.width,cant.height );
//     let A = new Uint32Array( D1.data.buffer );
//
//     // Is it possible to use a memcpy function?
//     // Offset into A with constructor? A.copyWithin() A.slice() A.reverse()?
//     let i,j,k,t, w=cant.width,h=w*cant.height;
//     for ( i=0; i<h; i+=w )
//         for ( j=i,k=j+w-1; j<k; ++j,--k ) t=A[j],A[j]=A[k],A[k]=t; // swap
//
//     ///var A = new Uint32Array( D1.data.buffer );
//     ///A.reverse(); D1.data.reverse();
//
//     ctxt.putImageData( D1, 0, 0 );
//     j = canc===can1?1:2;
//     if (!sk) drawimages(j); // Redraw from back canvas. Only need one image drawn?!
//
//     time = ts()-time;
//     mess('ms-tm',time+' ms');
//     mess('ms-reg','Canvas '+j+' - mirror');
//
// } // mirror
//
// function opaque(e)
// {
//     let time = ts();
//     let sk = e.shiftKey;	// indicates visible canvas
//
//     let cant = sk ? canc : getbcvs( canc===can1?1:2 );
//     let ctxt = gctx(cant);
//
//     ///ctxt.fillStyle = '#000000';
//     ///ctxt.fill();
//     //ctx.globalCompositeOperation = 'destination-over'
//     //ctx.fillRect(0, 0, canvas.width, canvas.height);
//
//     let I = ctxt.getImageData( 0,0, cant.width,cant.height );
//     let A = new Uint32Array( I.data.buffer );
//
//     // Maybe should have a special case for black background. And white?
//     let bk = cant.style.background;
//     cl('canvas background is '+bk);
//     let br=0,bg=0,bb=0;
//     if (bk)
//     {
//         br = parseInt(bk.substring(1,3),16);
//         bg = parseInt(bk.substring(3,5),16);
//         bb = parseInt(bk.substring(5,7),16);
//     }
//
//     for ( var i=0,j=0,l=A.length; i<l; i++ )
//     {
//         /*
// 		alpha = color.A / 255;
//         oneminusalpha = 1 - alpha;
//
//         newR = ((color.R * alpha) + (oneminusalpha * background.R));
//         newG = ((color.G * alpha) + (oneminusalpha * background.G));
//         newB = ((color.B * alpha) + (oneminusalpha * background.B));
// */
//         //A[i] |= 0xff000000; // No works!
//         let p = A[i];
//         let a = (p&0xff000000)>>>24;
//         if (a===0xff) continue;
//
//         let r = p&0xff;
//         let g = (p&0xff00)>>>8;
//         let b = (p&0xff0000)>>>16;
//         a /= 255;
//         let a1 = 1-a;
//         //A[i] = 0xff000000 | ((b/a)<<16) | ((g/a)<<8) | (r/a);
//         //A[i] = 0xff000000 | ((b*a)<<16) | ((g*a)<<8) | (r*a); // Assum black bkgd
//         A[i] = 0xff000000 | ((b*a+bb*a1)<<16) | ((g*a+bg*a1)<<8) | (r*a+br*a1);
//         j++;
//     }
//
//     ctxt.putImageData( I, 0, 0 );
//     i = canc===can1?1:2;
//     if (!sk) drawimages(i); // Redraw from back canvas. Only need one image drawn?!
//
//     time = ts()-time;
//     mess('ms-tm',time+' ms');
//     mess('ms-reg','Canvas '+i+' opaque, '+j+' pixels changed');
//
// } // opaque
//
//
// var pi180=Math.PI/180;
// function sin(a){if((a%=360)<0)a+=360;
//     return!a||a==180?0:a==90?1:a==270?-1:Math.sin(a*pi180);}
// function cos(a){if((a%=360)<0)a+=360;
//     return!a?1:a==180?-1:a==90||a==270?0:Math.cos(a*pi180);}
//
// function rotate(e)
// {
//     let time = ts();
//     let sk = e?e.shiftKey:0;			// indicates visible canvas
//     //var ck = e?e.altKey||e.metaKey:0;	// Overridden with GO button revert
//     let ck = e?e.ctrlKey:0;				// Might screw up on mac?
//
//     let cant = sk ? canc : getbcvs( canc===can1?1:2 );
//     let w = cant.width, h = cant.height;
//     let ctxt = gctx(cant);
//
//     let D1 = ctxt.getImageData( 0,0, w,h );
//     let A = new Uint32Array( D1.data.buffer );
//     let D2 = new ImageData(w,h);
//     let B = new Uint32Array( D2.data.buffer );
//
//     let theta = tf;
//     let sint = sin(theta);
//     let cost = cos(theta);
//
//     cl('Rotate: theta='+theta+'° sin='+sint+' cos='+cost);
//
//     // For each pixel in destination space,
//     // find corresponding coordinates in rotation space, rotate, and translate back.
//     // This version finds best fitting source pixel. Perhaps best would look at 4 pixels.
//     // And would have to do on 3 colour channels.
//
//     let w2 = (w-1)/2, h2 = (h-1)/2;
//     let w1 = (w-1)/2, h1 = (h-1)/2;
//     let x,y, xr,yr, x2,y2, x2i,y2i;
//
//     if (ck) for ( x=0; x<w; x++ ) for ( y=0; y<h; y++ )
//     {
//         xr = x - w2; yr = y - h2;
//         x2 = xr*cost - yr*sint; y2 = xr*sint + yr*cost;
//
//         // Simple nearest neighbour single pixel algorithm
//         // Assign a background colour if source out-of-bounds?
//         x2 = x2 + w2 + .5 >>0;
//         y2 = y2 + h2 + .5 >>0;
//         if (x2>=0&&x2<w && y2>=0&&y2<h) B[y*w+x] = A[y2*w+x2];
//     }
//
//     else for ( x=0; x<w; x++ ) for ( y=0; y<h; y++ )
//     {
//         xr = x - w2; yr = y - h2;
//         x2 = xr*cost - yr*sint; y2 = xr*sint + yr*cost;
//
//         /*
// 		// More complicated 4-pixel solution (grey only)
// 		// (Copied from IAD project, fal.txt)
// 		// Quite slow, even with greyscale!
// 		x2 += w1;
// 		y2 += h1;
// 		x2i = x2>>0;
// 		y2i = y2>>0;
//
// 		// Just grabbing the red channel, since we're assuming greyscale
// 		var a = y2i*w+x2i;
// 		var v1 = 0xff & A[a];
// 		var v2 = 0xff & A[a+1];
// 		var v3 = 0xff & A[a+w];
// 		var v4 = 0xff & A[a+w+1];
//
// 		var r1 = v1;
// 		r1 += (x2-x2i)*(v2-r1);	// One x interpolation
// 		var r2 = v3;
// 		r2 += (x2-x2i)*(v4-r2); // A second x interpolation
// 		r1 += (y2-y2i)*(r2-r1); // Final y interpolation
//
// 		B[y*w+x] = 0xff000000|r1<<16|r1<<8|r1;
// */
//
//         // More complicated COLOUR 4-pixel solution
//         // (Copied from IAD project, fal.txt)
//         // Very slow!
//         x2 += w1;
//         y2 += h1;
//         x2i = x2>>0;
//         y2i = y2>>0;
//         x2 -= x2i;
//         y2 -= y2i;
//
//         // What happens if/when index out-of-bounds?
//         let a = y2i*w+x2i;
//         let v1 = A[a];
//         let v2 = A[a+1];
//         let v3 = A[a+w];
//         let v4 = A[a+w+1];
//
//         let r1, r2, m;
//         let RR,GG,BB, AA;
//
//         m = 0x000000ff;
//         r1 = v1&m;
//         r1 += x2*((v2&m)-r1);
//         r2 = v3&m;
//         r2 += x2*((v4&m)-r2);
//         r1 += y2*(r2-r1);
//         RR = r1&m;
//
//         m = 0x0000ff00;
//         r1 = v1&m;
//         r1 += x2*((v2&m)-r1);
//         r2 = v3&m;
//         r2 += x2*((v4&m)-r2);
//         r1 += y2*(r2-r1);
//         GG = r1&m;
//
//         m = 0x00ff0000;
//         r1 = v1&m;
//         r1 += x2*((v2&m)-r1);
//         r2 = v3&m;
//         r2 += x2*((v4&m)-r2);
//         r1 += y2*(r2-r1);
//         BB = r1&m;
//
//         m = 0xff000000;
//         r1 = v1&m;
//         r1 += x2*((v2&m)-r1);
//         r2 = v3&m;
//         r2 += x2*((v4&m)-r2);
//         r1 += y2*(r2-r1);
//         AA = r1&m;
//
//         //B[y*w+x] = 0xff000000|BB|GG|RR;
//         B[y*w+x] = AA|BB|GG|RR;
//
//     }
//
//     ctxt.putImageData( D2, 0, 0 );
//     let j = canc===can1?1:2;
//     if (!sk) drawimages(j); // Redraw from back canvas. Only need one image drawn?!
//
//     time = ts()-time;
//     mess('ms-tm',time+' ms');
//     mess('ms-reg','Canvas '+j+' - rotate'+(ck?' (fast)':''));
//
// } // rotate
//
//
// function reduce(e) // reduce number of colours by wiping out low order bits
// {
//     let time = ts();
//     let sk = e.shiftKey;	// indicates visible canvas
//
//     let j = canc===can1?1:2;
//     let cant = sk ? canc : getbcvs( j );
//     let ctxt = gctx(cant);
//     let D1 = ctxt.getImageData( 0,0, cant.width,cant.height );
//     let A = new Uint32Array( D1.data.buffer );
//
//     let n = jf>8 ? 8 : jf; // Wipe out this many bits per channel
//     let m = 0xff<<n & 0xff; // darker; for brighter, add in 1
//     m = 0xff000000 | m<<16 | m<<8 | m; // endian?
//
//     let i=0, l=A.length;
//     for ( ; i<l; i++ ) A[i] &= m;
//
//     ctxt.putImageData( D1, 0, 0 );
//     if (!sk) drawimages(j); // Redraw from back canvas. Only need one image drawn?!
//
//     time = ts()-time;
//     mess('ms-tm',time+' ms');
//     mess('ms-reg','Canvas '+j+' - reduce '+n);
//
// } // reduce
//
//
// function flip(e) // Repeat code - see mirror()
// {
//     let time = ts();
//     let sk = e.shiftKey;	// indicates visible canvas
//
//     let cant = sk ? canc : getbcvs( canc===can1?1:2 );
//     let ctxt = gctx(cant);
//
//     // This call is the memory bummer. Too bad can't provide our own array
//     // Perhaps we could keep track of contexts, if they changed, etc?
//     let D1 = ctxt.getImageData( 0,0, cant.width,cant.height );
//     let A = new Uint32Array( D1.data.buffer );
//
//     /*
// 	// Having trouble with simplified indices
// 	var i,j,k,t, w=cant.width,h=w*cant.height;
// 	var A = new Uint32Array( D1.data.buffer );
// 	for ( i=0; i<h/2; i+=w )
// 	{
// 		for ( j=i,k=h-w*(i+1); j<w; ++j,++k ) { t=A[j]; A[j]=A[k]; A[k]=t; }
// 	}
// 	*/
//
//     let i,j,k,t, w=cant.width,h=cant.height;
//     for ( i=0; i<h/2; i++ )
//         for ( j=0; j<w; j++ ) { t=A[i*w+j]; A[i*w+j]=A[(h-i-1)*w+j]; A[(h-i-1)*w+j]=t; }
//
//     ctxt.putImageData( D1, 0, 0 );
//     j = canc===can1?1:2;
//     if (!sk) drawimages(j); // Redraw from big back canvas. Only need one image drawn?!
//
//     // Experiments for dealing with FF memory problems?!
//     //A = null;
//     //D1 = null; // or delete D1?
//
//     time = ts()-time;
//     mess('ms-tm',time+' ms');
//     mess('ms-reg','Flip '+A.length+' pixels');
//
// } // flip
//
//
// // New parameterized inner fillarea. Return number of pixels changed
//
// function fillarea1( D, x, y, newc )
// {
//     let A = new Uint32Array( D.data.buffer );
//     let w = D.width, h = D.height;
//
//     let S = [], si=0, mi=0, pi;;
//     let ii = w*y+x;
//     S[si] = ii; // push/pop? speed punishment?
//
//     let oldc = A[ii];
//     newc >>>= 0;	// Ensure it is unsigned int
//     if (oldc==newc) return 0;
//
//     let above=0, below=0, watchabove=0, watchbelow=0;
//     let mini, maxi; // left and right boundaries for a scanline
//     let n=0;
//
//     while (si>=0) // while there's a value on the stack ...
//     {
//         if (si>mi) mi = si;	// Keep track of max stack height
//         pi = S[si--];		// pop point off stack
//
//         mini = pi % w;		// is this division unavoidable?? not too important
//         mini = pi - mini;	// first potential pixel for this scanline, in this imagedata
//         maxi = mini + w;	// one over the last potential pixel to check
//
//         // Will we be checking previous and/or next scanlines? (Still missing optimizations)
//         above = mini>=w;
//         below = maxi<A.length;
//         watchabove = above;
//         watchbelow = below;
//
//         for ( ; pi>mini && A[pi]===oldc;)pi--; // go left
//         if (A[pi]!==oldc) pi++;
//
//         ///cl('pi='+pi+' mini='+mini+' maxi='+maxi);
//
//         // Point is now leftmost oldc pixel. Scan this row left to right.
//         for ( ; pi<maxi && A[pi]===oldc; pi++,n++ )
//         {
//             A[pi] = newc;
//
//             if (watchabove) { if (A[pi-w]===oldc) { S[++si] = pi-w; watchabove = 0; } }
//             else if (above) if (A[pi-w]!==oldc) watchabove = 1;
//
//             if (watchbelow) { if (A[pi+w]===oldc) { S[++si] = pi+w; watchbelow = 0; } }
//             else if (below) if (A[pi+w]!==oldc) watchbelow = 1;
//         }
//     }
//     //cl('fillarea stack '+mi);
//     return n;
//
// } // fillarea1
//
//
// function fillarea(e)
// {
//     let time = ts();
//     let sk = e.shiftKey;    // indicates visible canvas
//
//     // WARNING: backing canvases could be empty?!
//     let cant = sk ? canc : getbcvs( canc===can1?1:2 );
//     let ctxt = gctx(cant);
//     let w = cant.width, h = cant.height;
//
//     let D = ctxt.getImageData( 0,0, w,h );
//
//     // Convert canvas coordinates to image coordinates if necessary
//     let x = sk ? cdx : cdx*100/sf-srcx1>>0;
//     let y = sk ? cdy : cdy*100/sf-srcy1>>0;
//
//     let newc = hextopix( fillclr )>>>0;
//     if (newc===0xff000000)
//         newc = 0x00000000; // HACK! Assume black is transparent
//     let n = fillarea1( D, x, y, newc );
//
//     ctxt.putImageData( D, 0, 0 );
//     if (!sk) drawimages(); // Only need one image drawn?! (sometimes!?)
//
//     time = ts()-time;
//     mess('ms-tm',time+' ms');
//     mess('ms-reg','FillArea: '+ (n?n+' pixels':' same colour!'));
//
// } // fillarea
//
// // What about fill when just shown canvas, with clipping? Same problem as counts?
// // Infinite loop and Big Trouble if oldc and newc the same??
// // Big danger comparing colours!! One unsigned32, another not?! I use >>>0 now, seems good.
// // Note changing areas to a new colour could help in some operations, like doing all areas.
// // Timings (and stack height?) would depend on where starting point is!
// // Is it possible to count all pixels in an area ... WITHOUT changing their colour?
//
//
// function fillcat(e) // add a tolerance?
// {
//     let t = ts();
//     let sk = e.shiftKey;    // indicates visible canvas
//
//     // WARNING: backing canvases could be empty?!
//     let cant = sk ? canc : getbcvs( canc===can1?1:2 );
//     let ctxt = gctx(cant);
//     let w = cant.width, h = cant.height;
//     let D = ctxt.getImageData( 0,0, w,h );
//     let A = new Uint32Array( D.data.buffer );
//
//     // Convert canvas coordinates to image coordinates if necessary
//     let x = sk ? cdx : cdx*100/sf-srcx1>>0;
//     let y = sk ? cdy : cdy*100/sf-srcy1>>0;
//
//     let oldc = A[w*y+x];
//     let newc = hextopix( fillclr )>>>0;
//     if (newc===0xff000000)
//         newc = 0x00000000; // HACK! Assume black is transparent
//
//     //cl('oldc='+oldc+' newc='+newc);
//     if (oldc===newc) return mess('ms-reg','FillCat - same colour!');
//
//     for ( var i=0,n=0,l=A.length; i<l; i++)
//         if (A[i]===oldc) A[i] = newc, n++;
//
//     ctxt.putImageData( D, 0, 0 );
//     if (!sk) drawimages(); // Only need one image drawn?! (sometimes!?)
//
//     mess('ms-tm',(ts()-t)+' ms');
//     mess('ms-reg','FillCat: '+n+' pixels');
//
// } // fillcat
//
//
// // Return number of pixels found in border, if could be diff from P.length?
//
// function grabpoly1( D, x, y, P )
// {
//     let A = new Uint32Array( D.data.buffer );
//     let w = D.width, h = D.height;
//     let c = A[w*y+x];
//
//     // Algorithm: Go left until hit wall (not robust, might hit interior poly!)
//     // Go clockwise to next border pixel until see first one again,
//     // from correct direction
//
//     for (;x>=0&&A[w*y+x]===c;)x--; x++;
//
//     // Point is now leftmost pixel of same colour
//     // For starting, we pretend we entered it from the right (R)
//
//     // U:LURD==0123 L:DLUR D:RDLU R:URDL
//     let M = [	[ [0,-1,0,1], [-1,0,1,0], [0,1,0,-1], [1,0,-1,0] ],
//         [ [1,0,-1,0], [0,-1,0,1], [-1,0,1,0], [0,1,0,-1] ] ];
//     let J = 	[ [3,0,1,2],  [0,1,2,3],  [1,2,3,0],  [2,3,0,1]  ];
//
//     //P = [];
//     P.push([x,y]);
//     //cl('Start: '+P[0][0]+' '+P[0][1]);
//     let i,d,k, nx,ny;
//     let MAX = 200000; // Just for safety, no other reason
//
//     // Now move clockwise along border of coloured region
//     // The var d is direction
//     for ( d=2,k=0;k<MAX; k++) // first direction we pretend is R (d=2)
//     {
//         // Depending on which way we entered last pixel, gives order to search
//         // We check each of 4 different directions from this current pixel
//         for ( i=0; i<4; i++ )
//         {
//             nx = x + M[0][d][i]; // M.x
//             ny = y + M[1][d][i]; // M.y
//             //cl('  check '+nx+' '+ny);
//             if (nx>=0 && nx<w && ny>=0 && ny<h)
//                 if (A[ny*w+nx]===c) break; // found our next border pixel
//         }
//         if (i==4)  // degenerate 1-pixel polygon (or mistake?)
//         {
//             if (k) cl('grabpoly problem! k='+k+' (x,y)='+x+' '+y);
//             break;
//         }
//
//         // Need a strong condtion involving (perhaps) [i,k,d,d']
//         if (nx===P[0][0]&&ny===P[0][1]) break; // HACK - not strong enough yet
//
//         // Get the next direction d' to look first
//         d = J[d][i];
//
//         // Here have to decide if eliminate collinear and/or interior vertices
//         // Note that every new pixel is, of course, immediately adjacent to last
//         x = nx;
//         y = ny;
//         // Horrible condition to detect redundant interior vertices!
//         if (x===0||x===w-1||y===0||y===h-1||A[(y-1)*w+x]!==c||A[(y+1)*w+x]!==c||A[y*w+x-1]!==c||A[y*w+x+1]!==c)
//             P.push([x,y]); // change loop to do this first??
//     }
//     if (k==MAX) cl('grabpoly failure, too many vertices!');
//
// } // grabpoly1
//
//
// function grabpoly(e)
// {
//     let time = ts();
//     let sk = e.shiftKey;    // indicates visible canvas
//
//     // WARNING: backing canvases could be empty?!
//     let cant = sk ? canc : getbcvs( canc===can1?1:2 );
//     let ctxt = gctx(cant);
//     let w = cant.width, h = cant.height;
//
//     // Convert canvas coordinates to image coordinates if necessary
//     let D1 = ctxt.getImageData( 0,0, w,h );
//     let x = sk ? cdx : cdx*100/sf-srcx1>>0;
//     let y = sk ? cdy : cdy*100/sf-srcy1>>0;
//
//     Points = [];
//     grabpoly1( D1, x, y, Points );
//
//     // Should check if polygon is degenerate, maybe skip it
//
//     // Get extents in image coodinates, and store
//     let u = canc===can1 ? 1 : 2;
//     let rect = [BIG,BIG,-BIG,-BIG];
//     getextents( Points, rect );
//     Regions.push( [Points,0,rect,u,fillclr] );
//     selectflag = Regions.length - 1;
//
//     time = ts()-time;
//     mess('ms-tm',time+' ms');
//     mess('ms-reg','GrabPoly: '+Points.length+' vertices');
//
// } // grabpoly
//
//
// function graball(e,f) // f===1 => use fillclr
// {
//     // Sometimes grab all polys of all colours, sometimes just given colour
//     // (or perhaps just a subset of all colours, eg. selected colours?)
//
//     let time = ts();
//     let sk = e.shiftKey;    // indicates visible canvas
//
//     // WARNING: backing canvases could be empty?!
//     let cant = sk ? canc : getbcvs( canc===can1?1:2 );
//     let ctxt = gctx(cant);
//     let w = cant.width, h = cant.height;
//
//     let D = ctxt.getImageData( 0,0, w,h );
//     let A = new Uint32Array( D.data.buffer );
//     let i=0, j=0, m=0, n=0, p, c, l=A.length;
//
//     let t = f===1;
//     let clr = hextopix( fillclr )>>>0;
//
//     let x,y;
//     for ( y=0; y<h; y++ ) for ( x=0; x<w; x++ )
//     {
//         c = A[y*w+x]; // faster without mult and using another variable?
//         //if (c===0x00000000) continue;
//         if (t&&c!==clr || !t&&c===0x00000000) continue;
//
//         Points = [];
//         grabpoly1( D, x, y, Points );
//         p = fillarea1( D, x, y, 0x00000000 );
//         m++;
//         n += Points.length;
//
//         if (p>2) // 2000 // HACK! No small polygons. What to do with them??
//         {
//             let s = pixtohex(c);
//             let u = canc===can1 ? 1 : 2;
//             j++;
//             // Get extents in image coodinates, and store
//             let rect = [BIG,BIG,-BIG,-BIG];
//             getextents( Points, rect );
//             Regions.push( [Points,0,rect,u,s] );
//             //selectflag = Regions.length - 1;
//         }
//     }
//
//     time = ts()-time;
//     mess('ms-tm',time+' ms');
//     mess('ms-reg',(t?'GrabCat: ':'GrabAll: ')+m+' polys ('+j+'), '+n+' vertices');
//
// } // graball
//
//
// var GLU3 = new Uint32Array(768); // Could try Uint8 or Uint32
// (function(){for(let i=0;i<768;i++)GLU3[i]=i/3>>0;})();
// //(function(){var i=0,d;for(;i<768;i++){d=i/3>>0;GLU3[i]=0xff000000|(d<<16)|(d<<8)|d;}})();
//
// function grey(e)
// {
//     // 380ms on FF, except jumps up high at 8th repeat?? Now, 610ms and 3300ms.
//     let t = ts(); // 87MB, 250ms, Chrome. But 1050ms if try/catch?? UPDATE: now 320ms - forgot to write to bcv1.
//     let sk = e.shiftKey;	// Indicates front visible canvas only
//
//     let f = canc===can1;		// top canvas
//
//     let cant = sk ? canc : getbcvs(f?1:2);
//     let w = cant.width, h = cant.height;
//     let ctxt = gctx(cant);
//
//     // Now grab the image data from the hidden canvas, and alter it
//     // This is uncaught domexception if cors situation is not right
//     // But try/catch seems to be quite expensive
//     let I = ctxt.getImageData( 0,0, w,h );
//     let D8 = I.data;
//     let i,j,l, d;
// //cl('length='+D8.length); // Something wrong with IE? (CanvasPixelArray?)
//
//     // Is this the fastest loop possible for per-channel pixels?
//     // About 970ms on Win, Assini
//
//     /*
// 	// 20180223 revisiting this code, trying lookup below now
// 	for ( i=0,l=D8.length; i<l; i+=4 ) // RGBA if bytes
// 	{
// 		d = D8[i] + D8[i+1] + D8[i+2]; // weighting factors?
// 		d = d/3>>0;
// 		//d = (D8[i]+D8[i+1]+D8[i+2])*0.3333333333>>0; // seems a tad slower GC?!
// 		///d = (0.2126*D8[i] + 0.7152*D8[i+1] + 0.0722*D8[i+2]) >> 0;
// 		D8[i]=d; D8[i+1]=d; D8[i+2]=d; // GCW7: 800ms assini 22Mp
// 	}
// 	*/
//
//     // New loop with lookup table(s) 20180223
//     // Another approach - could add them all up then use one lookup?!
//     // Could access as bytes then write as uint32? Assign as global outside?
//     // See GLU[] above
//
//     for ( i=0,j=0,l=D8.length; i<l; i+=4 ) // RGBA if bytes
//     {
//         //d = LU3[D8[i]] + LU3[D8[i+1]] + LU3[D8[i+2]];
//         ///if (D8[i]===D8[i+1] && D8[i]===D8[i+2]) j++; // Test to see if already greyscale
//         d = GLU3[D8[i]+D8[i+1]+D8[i+2]]; // Cannot do if not 1/3
//         D8[i]=d; D8[i+1]=d; D8[i+2]=d;
//     }
//
//     /*
// 	// Try another strategy // 20200127 // Maybe not so fast
// 	var D32 = new Uint32Array( D8.buffer );
// 	for ( i=0,l=D32.length; i<l; i++ )
// 	{
// 		d = D32[i];
// 		D32[i] = GLU3[ (d&0xff) + ((d>>8)&0xff) + ((d>>16)&0xff) ];
// 	}
// 	*/
//
//     // Another attempt at a fast loop, looking at one channel only
//     //for ( i=0,l=D8.length; i<l; ) j=D8[i],D8[i++]=j,D8[i++]=j,D8[i++]=j,i++;
//
//
//     // Write the altered image data back to the hidden, and visible, canvases
//     ctxt.putImageData( I, 0, 0 );
//     I = null; // Repeated use of grey() causes memory use to keep going up! This no help.
//     //ctxv.putImageData( I, f?srcx1:srcx2, f?srcy1:srcy2 );
//     //ctxv.drawImage( canh, srcx1, srcy1 ); // Same effect, about same speed?
//
//     if (!sk) drawimages();	// Need only draw on one canvas?!?
//     drawobjects();	// No need to redo all this in all cases?!
//
//     t = ts()-t;
//     mess('ms-reg','Grey transform, '+(l>>2)+' pixels (j='+j+')');
//     mess('ms-tm',t+' ms');
//
// } // grey
//
//
// // A test function, January 2016: Count number of differing pixels between two canvases
// // endian danger
//
// function compare(e)
// {
//     let time = ts();
//     let sk = e.shiftKey;			// Indicates front visible canvas only
//     let ck = e.altKey||e.metaKey	// Ignore alpha - won't go, revert overrides!?
//
//     let cant = sk ? can1 : getbcvs(1);
//     let canb = sk ? can2 : getbcvs(2);
//     let w = cant.width, h = cant.height;
//     let ctxt = gctx(cant);
//     let ctxb = gctx(canb);
//
//     // CORS/crossOrigin: Should test for whether we can get the data or not!
//     // Check path, protocol, ACAF, ACAO, etc.
//     let D1 = ctxt.getImageData( 0,0, w,h ).data;
//     let D2 = ctxb.getImageData( 0,0, w,h ).data;
//
//     // Example of a very simple loop for transforming pixel by pixel
//     // For 4000x4000 images, FF over twice as fast as GC!
//     // But not always clear that this would be faster: browser, platform, version, etc.
//     let A=new Uint32Array(D1.buffer), B=new Uint32Array(D2.buffer);
//     let i=0, c=0, l=A.length;
//     let m = endian ? 0x00ffffff : 0xffffff00; // true == aaggbbrr
//
//     if (ck) for (; i<l; i++ ) c += (A[i]&m)!==(B[i]&m); // ignore alpha part of rgba/abgr
//     else for (; i<l; i++ ) c += A[i]!==B[i];
//     //if (A[i]===0||B[i]===0) continue;
//
//     time = ts()-time;
//     mess('ms-reg','Compare: '+(c?c +' pixels differ':'identical'));
//     mess('ms-tm',time+' ms');
//
// } // compare
//
//
// // Warning: code duplication, much like countfunc and greyfunc
// // Did this function ever work? Ever get called? Tested??
// // Parameter e unused
//
// function clean(e) // Maybe merge with other funcs, like grey and count?
// {
//     let t = ts();
//
//     let canv = canc===can1 ? bcv1 : bcv2;
//
//     // Maybe here we should set up bcv1 and bcv2??
//     // Do not draw the image backgrounds, if any
//     // If PNG (Tanya/mask) files already, just copy to backing canvases
//     // DOES NOT YET TAKE INTO ACCOUNT SHOW FLAG AND FADE STATE (should it??)
//     drawbigmask( canv, 0 );
//
//     // A big mess! bcx1 and bcx2 set up in above function!?
//     //var ctxt = bcx1;
//     let ctxt = gctx(canv);
//
//
//     // Get colours and prepare for comparison with 4-byte pixels (endian?)
//     let i,g,k, j,m,p, nc=catmenu.length;
//     let C=new Uint32Array(nc), D=new Array(nc), E=new Array(nc);
//     for ( i=0; i<nc; i++ ) C[i] = hextopix( catmenu[i][1] );
//     for ( i=0; i<nc; i++ ) D[i] = C[i].toString(16);
//     for ( i=0; i<nc; i++ ) E[i] = 0;
//
//     ///cl(C);
//     ///cl(D);
//
//     let ID = ctxt.getImageData( 0,0, canv.width,canv.height );
//     let A = new Uint32Array( ID.data.buffer );
//     let l = A.length;
//
//     // First idea - every time we meet a bad pixel, assign it to last good pixel
//     // Unfixed BUG: When last pixel on previous row
//     // endian usually 0xaabbggrr
//     ///var lastpixel = 0xff000000;
//     let lastpixel = 0x00000000;
//     for ( i=0,g=0,k=0,m=0; i<l; i++ )
//     {
//         if (A[i]===0) { m++; continue; }
//         ///if (((~A[i])>>24)!=0) { m++; continue; }
//
//         // Should hash the value here
//         for ( j=0; j<nc; j++ ) if (A[i]==C[j]) { lastpixel = A[i]; E[j]++; break; }
//         if (j==nc) { A[i] = lastpixel; k++; } // Did not find this pixel colour
//     }
//     cl('pixels = '+l+', trans = '+m+', bads = '+k);
//     cl(E);
//
//     // Write the altered image data back to the hidden canvas
//     ctxt.putImageData( ID, 0, 0 );
//
//     t = ts()-t;
//     mess('ms-tm',t+' ms');
//     mess('ms-reg','Clean complete, '+k+' bads');
//
// } // clean
//
//
// // This version of the colours counter uses a bitarray,
// // and is much faster than HashSet.
// // Should ck mean make categories from colours? (If not too many)
// // Or leave that to countfunc()?
//
// function getcolours(e)
// {
//     let time = ts();
//     let sk = e.shiftKey; // Look at visible rather than back canvas
//
//     mess('ms-reg','Colours ...'); // This never works!
//     mess('ms-tm','');
//
//     let i=0, l=1<<19; // 2^19 words * 2^5 bits/word = 2^24 bits
//     let C = new Uint32Array(l); // bits array, initially zero?
//     ///for (;i<l;++i) C[i]=0; // necessary?
//
//     let f = canc===can1;
//     let cant = sk ? canc : getbcvs(f?1:2);
//     let w = cant.width, h = cant.height;
//     let ctxt = gctx(cant);
//
//     let D1 = ctxt.getImageData( 0,0, w,h ).data;
//     let A = new Uint32Array( D1.buffer );
//
//     //var m = endian ? 0x00ffffff : 0xffffff00; // normal hex aabbggrr
//     l = A.length;
//     let j,p,r, n=0, w=0, t=0; // Count true colours, nulls, and "translucent"
//
//     // Here, could set a masking flag ... // 20190318
//     for ( i=0; i<l; i++ ) // for each pixel in image ...
//     {
//         j = A[i];
//         // Note we are not paying any attention to alpha!=255 colours!
//         if (!j) { t++; continue; } // Transparent (sky?) pixel
//         if (j>>>24!=0xff) { w++; continue; } // Weird non-black non-opaque pixel
//
//         j &= 0x00ffffff;	// 24 bits of colour
//         ///j &= 0x00f0f0f0; // 12 bits // 20190307
//         ///j &= 0x00e0e0e0; // 9 bits // 20190318
//         ///j &= 0x00c0c0c0; // 6 bits // 20190318
//         ///j &= 0x00808080; // 3 bits // 20190318
//
//         p = j&31;		// which bit
//         j = j>>>5;		// which word
//         if ((C[j]>>p)&1){} // is this the best expression?
//         else C[j]|=(1<<p),n++;
//     }
//
//     let s = 'Colours: '+n+' colours, '+l+' pixels';
//     if (w||t) s += (t?' '+t+' null':'') + (w?' '+w+' weird':'');
//     mess('ms-reg',s);
//
//     time = ts()-time;
//     mess('ms-tm',time+' ms');
//
// } // getcolours
//
//
// // Called only from external button 'Count' (GO)
// // Count pixels! Transparent is most common, then maybe our default colour, then the category colours.
// // Has turned into a real mess. Needs a complete redo.
//
// /** @param {...integer} ncf */
// function countfunc(e,ncf)
// {
//     // The Counts pop-up will not work if Chrome and file://, unless AFAFF (or DWS) flag set
//     if (tchrome(1)) return; // Must check here for cross-origin and file protocol Chrome problems.
//
//     let time = ts();
//
//     let f = ncan==1;				// Only one canvas visible
//     let sk = e.shiftKey;			// Take data from visible canvases (not hidden big back ones)
//     let ck = e.altKey||e.metaKey;	// Try to make colours
//
//     ///ck = 0;			// disconnect for now 20160315
//     ncf = ncf===1||ck;	// new colours flag
//
//     let cant = sk ? can1 : bcv1;	// canvas on top (1)
//     let canb = sk ? can2 : bcv2;	// canvas on bottom (2)
//
//     let cs = gid('cs')[SI]; // which variant? 1 2 3 // 20170122
//     //cl('countfunc, variant '+cs);
//
//     // Maybe here we should set up bcv1 and bcv2??
//     // If PNG (like Tanya) files already, just copy to backing canvases
//     // DOES NOT YET TAKE INTO ACCOUNT SHOW FLAG AND FADE STATE (should it??)
//     if (!sk) drawbigmask(null,0);
//
//     // A big mess! bcx1 and bcx2 set up in above function!?
//     let ctxt = sk ? ctx1 : bcx1;
//     let ctxb = sk ? ctx2 : bcx2;
//
//     let D1 = ctxt.getImageData( 0,0, cant.width,cant.height ).data;
//     let idata = f?null:ctxb.getImageData( 0,0, canb.width,canb.height );
//     let D2 = f?null:idata.data;
//
//
//     let C=[], N1=[], N2=[], N3=[], S=[]; // colours, number columns, sort indices
//     let i,l;
//     for ( i=0; i<catmenu.length; i++ ) C[i] = hextorgb( catmenu[i][1] );
//     let ni = C.length;
//     for ( i=0; i<ni; i++ ) N1[i]=N2[i]=N3[i]=0,S[i]=i;
//
//     let np=D1.length>>2, np1=0, np2=0,   np3=0, np4=0, np5=0; // pixel counters
//
//
//
//     let MAXC = 1000; // 50;	// Max number of colours to add to colour array
//     let MAXM = 60; // 30; // 20;	// Max number of colours to show in menu
//
//
//     // This main loop now augmented with code for altering image data
//     // Could rewrite this to use UInt32 array (seems to help only (a bit) with FF)
//
//     let newimage = ncan>2;
//     ///newimage = 1; // test!
//
//     // This stuff is to help draw a new image
//     let col = gid('clr2').value;
//     col = hextorgb(col);
//     let colr=col>>16&255,colg=col>>8&255,colb=col>>0&255;
//     let f1 = function(x){return 0.85*x;}
//     let f2 = function(x){return 0.65*x;} // 60
//     let ft = 255;
//
//     for ( i=0,l=D1.length; i<l; i+=4 ) // for each pixel
//     {
//
//         // Check for (fully) transparent/black/zero pixels
//         // alpha:i+3 blue:i+2 green:i+1 red:i+0 (3210 abgr)
//         let t1 = D1[i+3]; // 20210202 WTF?
//         let t2 = f?0:D2[i+3];
//
//         if (cs===2) if (!t1||!t2) continue; // 20180130 Julie's count
//         if (t1) np1++;
//         if (t2) np2++;
//         if (!t1&&!t2) continue;
//
//         // Make integers out of 3 colour channels
//         let c1 = (D1[i]<<16) + (D1[i+1]<<8) + D1[i+2];
//         let c2 = f?0:(D2[i]<<16) + (D2[i+1]<<8) + D2[i+2];
//
//         // Use a masking flag? // 20190318
//         ///c1 &= 0x00808080; // 20190318
//
//
//         // Check to see if each pixel is any of the known colours
//         if (t1) for (let j=0,k=C.length; j<k; j++)
//             if (c1==C[S[j]])
//             {
//                 N1[S[j]]++; var m=j;
//                 // Keep track of more common pixel colours via the S array (for speedup?)
//                 // 20180314 is S even ever used anymore?? try to remove for now? No
//                 while (m>0 && N1[S[m]]>N1[S[m-1]]) { var n=S[m];S[m]=S[m-1];S[m-1]=n;m--; }
//                 break;
//             }
//         // Maybe colour was not found
//         if (t1) if (j==k)
//         {
//             if (ncf && j<MAXC) { C[j]=c1; N1[j]=1; N2[j]=0; N3[j]=0; S[j]=j; } else np3++;
//             //if (1) for ( j=0,k=C.length; j<k; j++ )
//         }
//
//         // Faster if check for c1==c2? Often true.
//         if (t2) for (let j=0,k=C.length; j<k; j++)
//             if (c2==C[S[j]])
//             {
//                 N2[S[j]]++;
//                 break;
//             }
//         // Maybe colour was not found
//         if (t2) if (j==k)
//         {
//             if (ncf && j<MAXC) { C[j]=c2; N1[j]=0; N2[j]=1; N3[j]=0; S[j]=j; } else np4++;
//         }
//
//         if (cs==1&&!f) // try to do new 3rd column counts based on current colour/category 20180314
//         {
//             if (c1==col) if (j<k) N3[S[j]]++;
//         }
//         else if (c1==c2&&!f) if (j<k) N3[S[j]]++; else if (!ncf||!j<MAXC) np5++;
//
//
//         // Insert data for a new image, based on colour intersection 20151210
//         // We could have a number of colour functions defined
//         if (newimage)
//         {
//             if (cs===0)  // 20170122 - original function Count1  // rrggbbaa
//             {
//                 if (c1==c2)
//                 {
//                     if (c1!=col) {D2[i]=D2[i+1]=D2[i+2]=0xff,D2[i+3]=ft;} // white
//                 }
//                 else if (!t1) {D2[i]=D2[i+1]=D2[i+2]=0x00,D2[i+3]=ft;} // black
//                 else if (!t2) {D2[i]=D2[i+1]=D2[i+2]=0x7f,D2[i+3]=ft;} // darkgrey
//                 else if (c1==col) {D2[i]=f1(colr),D2[i+1]=f1(colg),D2[i+2]=f1(colb),D2[i+3]=ft;}
//                 else if (c2==col) {D2[i]=f2(colr),D2[i+1]=f2(colg),D2[i+2]=f2(colb),D2[i+3]=ft;}
//                 else {D2[i]=D2[i+1]=D2[i+2]=0xf0,D2[i+3]=ft;} // lightgrey
//             }
//             else if (cs===1) // Count2
//             {
//                 if (c1==col) // 20170122 - new function Count1
//                 {
//                     ///D2[i]=colr,D2[i+1]=colg,D2[i+2]=colb,D2[i+3]=ft;
//                     if (!D2[i+3]) D2[i]=0,D2[i+1]=0,D2[i+2]=0,D2[i+3]=ft;
//                 }
//                 else {D2[i]=D2[i+1]=D2[i+2]=0xff,D2[i+3]=ft;}
//             }
//             else // No special draw for Count2 yet!! // 20180314
//             {
//                 // How about ... show where categories remain the same
//                 if (c1==c2) {}
//                 else if (!t1) {D2[i]=D2[i+1]=D2[i+2]=0x00,D2[i+3]=ft;} // black
//                 else if (!t2) {D2[i]=D2[i+1]=D2[i+2]=0x7f,D2[i+3]=ft;} // darkgrey
//                 else if (c1==col) {D2[i]=f1(colr),D2[i+1]=f1(colg),D2[i+2]=f1(colb),D2[i+3]=ft;}
//                 else if (c2==col) {D2[i]=f2(colr),D2[i+1]=f2(colg),D2[i+2]=f2(colb),D2[i+3]=ft;}
//                 else {D2[i]=D2[i+1]=D2[i+2]=0xf0,D2[i+3]=ft;}
//                 /*
// 				//D2[i]=D2[i+1]=D2[i+2]=0,D2[i+3]=ft;
// 				if (t1&&t2) {D2[i]=0,D2[i+1]=255,D2[i+2]=0,D2[i+3]=ft;}
// 				else if (t1&&!t2) {D2[i]=255,D2[i+1]=0,D2[i+2]=0,D2[i+3]=ft;}
// 				else if (t2&&!t1) {D2[i]=0,D2[i+1]=0,D2[i+2]=255,D2[i+3]=ft;}
// 				else {D2[i]=255,D2[i+1]=0,D2[i+2]=0,D2[i+3]=ft;}
// 				*/
//             }
//         }
//     } // end of perpixel loop
//
//
//     if (newimage)
//     {
//         // For big data and no 3rd canvas, ctx will become bcx2
//         let ctx = can3.width ? gctx(can3) : ctxb;
//         //cl('countfunc: can3.width='+can3.width);
//
//         if (sk) // small data
//         {
//             ctx.putImageData( idata, 0, 0 ); // write to small canvas (can2 or can3)
//         }
//         else // big data
//         {
//             //cl('Big data draw');
//             //bcx2.clearRect(0,0,bcv2.width,bcv2.height);
//             bcx2.putImageData( idata, 0,0 ); // put big data in big hidden canvas
//             let s = sf/100;
//             let w = bcv2.width, h = bcv2.height;
//             ctx.clearRect(0,0, w,h); // scale factor??
//             if (ctx!=ctxb)
//             {
//                 cl('Big draw 1');
//                 ctx.drawImage( bcv2, 0,0, w,h, s*srcx1,s*srcy1, s*w, s*h );
//             }
//             else // Is it used anymore?
//             {
//                 cl('Big draw 2');
//                 ctx2.drawImage( bcv2, 0,0, w,h, 0,0, w,h );
//             }
//         }
//     }
//
//
//
//     if (ncf) cl('Old and new colours: '+ni+' '+(C.length-ni));
//     if (ncf) cl(S);
//
//
//     // We don't need our big work canvases anymore (??)
//     // What, neither one? We have to have more organized canvases. // 20180314
//     if (!sk)
//     {
//         bcv1.width = bcv1.height = 0;
//         if (!f) bcv2.width = bcv2.height = 0;
//     }
//
//     // Make a categories menu from the colour info gleaned from image
//     // But not too big, and cut off when number of pixels per colour gets too small
//     // (This old stuff doesn't work well anymore)
//
//     let nc = C.length;
//     if (ncf)
//     {
//         // Note all colours cut out would go towards the uncategorized counts?!
//         nc = nc>MAXM?MAXM:nc;
//
//         for ( i=ni; i<nc; i++ ) // for each new colour
//         {
//             let c = C[i];
//             let s = rgbtohex( c>>16&255, c>>8&255, c&255 );
//             catmenu[i] = [s,s];
//         }
//         /*
// 		var J = new Array(nc);
// 		for ( i=0; i<nc; i++ ) // for each colour (old and new)
// 		{
// 			// These guys would all go towards uncategorized counts
// 			//if (N1[S[i]]<np1/2000) break; // Omit any tiny fractions of pixel categories
// 			// Should nc be redefined here??
//
// 			var c = C[S[i]]; // More common colours at front
// 			var s = rgbtohex( c>>16&255, c>>8&255, c&255 );
// 			//catmenu[i] = [s,s];
// 			J[i] = [S[i]<ni?catmenu[S[i]][0]:s,s];
// 		}
// 		nc = i;
// 		catmenu = J; // copy array - does it work?
// */
//     }
//     cl('Colours: '+C.length+' nc='+nc+' width='+cant.width+' height='+cant.height+' menulength='+catmenu.length);
//     // We're in countfunc() ...
//
//
//     let oh = toh(); // Might need a redraw because of this writing
//     drawmenu(ncf?S:null,1); // S // f===1 => tell drawmenu to not do the height calculations
//
//
//     // Print out the counts to the web page (how much time taken in this part?)
//     let m = gid('counts');
//     m.innerHTML = ''; // removeChild()?
//
//     mess('ms-cts','Counts &nbsp; ('+np+' pixels, '+(np-np1)+' transparent)');
//
//     let fn = function( p1,p2, n1,n2,n3 ) // func to print out a row of data
//     {
//         let s='',x=65,y=45, sp='&nbsp; &nbsp;'; // 55 45
//         s += spanf(n1,x,0);		// count
//         s += spanf(n1,y,p1);	// percentage
//         if (!f)
//         {
//             s += sp;
//             s += spanf(n2,x,0);
//             s += spanf(n2,y,p2);
//             s += sp;
//             s += spanf(n3,x,0);
//             s += spanf(n3,y,p1);
//         }
//         let i = doc.createElement('li');
//         i.innerHTML = '<nobr>'+s+'</nobr>';
//         m.appendChild(i);
//     };
//     ///var nc=C.length;
//     ///cl([np1,np2,np3,np4]);
//     if (ncf)	for (let j=0;j<nc;j++) fn( np1,np2, N1[S[j]],N2[S[j]],N3[S[j]] );
//     else	for (let j=0;j<nc;j++) fn( np1,np2, N1[j],N2[j],N3[j] );
//
//     if (np3||np4) fn( np1,np2, np3,np4,np5 ); // Uncategorized pixels
//
//     time = ts()-time;
//     mess('ms-tm',time+' ms');
//     mess('ms-reg','Count: '+np+' pixels, '+np1+' opaque');
//
//     // Make the counts html div visible
//     gis('cts').display = 'inline-block';
//
//     // Must ensure that these counts are visible somewhere!
//     msend('cts');
//     //if (wcat) wcat.focus(); else if (!menuflag) showmenu();
//     catpopup(); // 20170228
//
//     // If the counts data is too big, a canvas resizing may be in order
//     if (oh!=toh()) resizefunc(4);
//
// } // countfunc
//
//
// function spanf(n,w,f) // We could use span, tr/td, nobr, white-space:nowrap, ...
// {
//     // How about making a style class? Less html to push around.
//     let s;
//     s = '<span style=text-align:right;display:inline-block;min-width:'+w+'px>';
//     s += f===0?n:(n*1000/f>>0)/10;
//     if (f!=0) s+= ' %'; // HACK
//     s += '</span> &nbsp;';
//     return s;
// }
//

//
// /**
//  * Align Function: Uses 3 Control Points
//  */
//
// function alignfunc3()
// {
//     // We need 3 pairs of control points. (What could we do with 4 or more?)
//     // Would 2 pairs be enough for translate/rotate/scale?
//
//
//     let p = CtrlPts;
//     let i,j,k,m, q,e, n=p.length;
//     let pf = function(x){return Math.floor(x*100)/100;}
//     let M,B,X,X1;
//
//     mess('ms-reg','Alignment attempt - '+p.length+' points');
//
//     M = [
//         [p[0][0],p[0][1],1,0,0,0],
//         [0,0,0,p[0][0],p[0][1],1],
//         [p[2][0],p[2][1],1,0,0,0],
//         [0,0,0,p[2][0],p[2][1],1],
//         [p[4][0],p[4][1],1,0,0,0],
//         [0,0,0,p[4][0],p[4][1],1]
//     ];
//     B = [p[1][0],p[1][1],p[3][0],p[3][1],p[5][0],p[5][1]];
//     X = lusolve(M,B,true);
//     X1 = X;
//
//     // The rest of this function is the Julie experiment with multiple points/transforms
//     let ppx,ppy, dx,dy,dd, s;
//
//     // Figure out best fit among all points by taking 3 at a time
//     cl('');
//     cl('Alignment 3 experiments: '+n+' points');
//     for ( i=m=0; i<n; i+=2 ) for ( j=i+2; j<n; j+=2 ) for ( k=j+2; k<n; k+=2,m++ )
//     {
//         // Make a 6x6 matrix with these 3 point pairs
//         M = [
//             [p[i][0],p[i][1],1,0,0,0],
//             [0,0,0,p[i][0],p[i][1],1],
//             [p[j][0],p[j][1],1,0,0,0],
//             [0,0,0,p[j][0],p[j][1],1],
//             [p[k][0],p[k][1],1,0,0,0],
//             [0,0,0,p[k][0],p[k][1],1]
//         ];
//         B = [p[i+1][0],p[i+1][1],p[j+1][0],p[j+1][1],p[k+1][0],p[k+1][1]];
//         X = lusolve(M,B,true);
//
//         // Check quality of this 6x6 matrix (or its 2 3x3 parts)
//         // Note M has been made diagonal by lusolve()
//         for ( var ii=0,jj=1; ii<6; ii++ ) jj *= M[ii][ii]/100;
//         cl('Matrix '+(m+1)+': ('+(i+1)+','+(j+1)+','+(k+1)+') determinant '+((jj*100>>0)/100));
//
//         // Run the other (n-3) points through the matrix
//         for ( s='',q=e=0; q<n-1; q+=2 ) if (q!==i && q!==j && q!==k)
//         {
//             ppx = X[0]*p[q][0] + X[1]*p[q][1] + X[2];
//             ppy = X[3]*p[q][0] + X[4]*p[q][1] + X[5];
//             dx = ppx-p[q+1][0];
//             dy = ppy-p[q+1][1];
//             dd = dx*dx + dy*dy;
//             s += ' '+(q+1)+'('+pf(dx)+','+pf(dy)+')';
//             ///cl('   q='+q+' d='+pf(dd));
//             e += dd;
//         }
//         let RMSE = Math.sqrt(e/(n/2-3));
//         //cl('Points '+i+','+j+','+k+' e='+pf(e)+' RMSE='+pf(RMSE));
//         cl('   d:'+s);
//         cl('   e='+pf(e)+' RMSE='+pf(RMSE));
//     }
//
//     // Fill the top/left hidden canvas with the transformed image
//     // Another way to do it is to keep the xform coords for can1
//     //cl(X);
//     //cl(X1);
//
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     bcv1.width = I1.width;
//     bcv1.height = I1.height;
//
//     // Now we have our coefficients for the transformation matrix
//     // So plug them in and use them to create a new image in left canvas
//     let ctx = gctx(bcv1);
//     ctx.setTransform(X1[0],X1[3],X1[1],X1[4],X1[2],X1[5]);
//     ctx.drawImage( I1, 0,0 );
//
//     // Once again, doing too much work! Only left canvas needs to be redrawn
//     drawimages();
//
// } // alignfunc3
//
// // Uint8ClampedArray
// // imagedata.data.set()
// // new ImageData()
//

//
//
// // Called from savefile(), for saving JSON txt
// var textfile = null;
// function makeblob(text,f) // f unused
// {
//     let data;
//     if (f===1) data = new Blob([text], {type: 'image/png'});
//     else data = new Blob([text], {type: 'text/plain'});
//     if (textfile !== null) window.URL.revokeObjectURL(textfile);
//     textfile = window.URL.createObjectURL(data);
//
// ///al('data '+data.slice(0,50));
// ///al('file '+textfile.slice(0,50));
//     //data.close(); ??
//     return textfile;
// }
//
//
//
//
//
// // Grabbed this from internet - not sure if fastest/smallest/best
// // Used only once, from saveuimg() (for JPG and PNG)
//
// function dataURLtoBlob( dataurl,t )
// {
//     let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
//         bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
//     while(n--)u8arr[n] = bstr.charCodeAt(n);
//     return new Blob([u8arr], {type:t==null?mime:t});
// }
//
// // From http://jsfiddle.net/VB59f/2/
// // Used to save TIF and BMP files
// // Why so complicated??
//
// var saveByteArray = (function () {
//     let a = doc.createElement('a');
//     doc.body.appendChild(a);
//     a.style = 'display: none';
//     return function (data, name) {
//         let blob = new Blob(data, {type: 'octet/stream'}),
//             url = window.URL.createObjectURL(blob);
//         a.href = url;
//         a['download'] = name; // 20171205
//         a.click();
//         //doc.body.removeChild(a); //??
//         window.URL.revokeObjectURL(url);
//     };
// }());
//
//
// // Called only from external button. Try to save canvas (visible or hidden) as PNG or JPG file.
//
// var saveurl = null;
// function saveuimg( e, jpg ) // jpg true if want that type instead of png
// {
//     let t = ts();
//     let sk = e.shiftKey;			// Save small visible canvas only
//     let ck = e.altKey||e.metaKey;	// Experiment: leave backstore untouched
//
//     let n = 'iat-image'; // boring default name - is this a reasonable one??
//     //var jpg = savetype==4; // HACK! This went bad after addition of UPNG type
//
//     n += jpg ? '.jpg' : '.png';
//     ///n = 'images/'+n; // Can't get tricky and try to set a location
//
//     // Which canvas are we trying to save? Left or right, big (back) or front?
//     let canv = canc===can1 ? sk?can1:bcv1 : sk?can2:bcv2;
//     if (canv.width==0||canv.height==0) // This is happening! Bug // 20200716
//     {
//         let s = 'ERROR: zero canvas in saveuimg()';
//         cl(s);
//         mess('ms-reg',s);
//         return;
//     }
//
//     // DOES NOT YET TAKE INTO ACCOUNT SHOW FLAG AND FADE STATE (should it??)
//     // Something wrong somewhere, if objects and images, objects not translated correctly!?
//     // If saving as JPG file, assume (!?!) we want underlying images too (but SHOW/FADE?)
//     // Use ck to save after clean()! 20180217
//
//     if (!sk) if (!ck) drawbigmask( canv, jpg );
//
//     // Why so much bigger than Tanya's corresponding PNG files??
//     // Ah, it seems that Chrome makes pretty big PNG, but does it quite fast.
//     // Use this to get smallest version: https://tinypng.com/ (but is it lossless?)
//     // Also https://kraken.io/web-interface (up to 1 MB)
//     // Also compresspng.com (unclear if kraken worse or better)
//
//     ///if (tchrome(1)) return; // Why is this after drawbig etc??
//
//
//
//     // mime: image/png? image/octet-stream? application/octet-stream?
//     // Eli Grey says: Try using application/octet-stream as the
//     // MIME type if you want to force the save dialog.
//     let v = jf; // JPG quality, if save as JPG, as a percentage
//     let d = canv.toDataURL( jpg?'image/jpeg':'image/png', jpg?isNaN(v)?0:v/100:0 );
//     cl('Saving file: '+(jpg?'image/jpeg':'image/png')+' '+(1.0));
//     //d = d.replace('image/png','image/octet-stream');
//
//     // Try these headers for when browser does not understand download=blah
//     ///d = d.replace(';',';headers=Content-Disposition%3A%20attachment%3B%20filename='+n+';');
// //al(d.substring(0,200));
//
//     // Note canvas.toBlob() does not work in Chrome. More about canvas.toBlob():
//     // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
//
//     let blob = dataURLtoBlob( d ); //, 'image/octet-stream' ); // 'application/octet-stream'
//     // blob.size blob.type
//     mess('ms-reg',(jpg ? 'JPG('+v+')' : 'PNG')+' file size '+(blob.size/1024>>0)+' KB');
//
//     // This is not a dignified approach to the URL problem
//     // I'm not sure if properly revoked
//     if (saveurl!=null) window.URL.revokeObjectURL( saveurl );
//     saveurl = window.URL.createObjectURL(blob);
//
//     let an = gid('anp');
//     an.href = saveurl;
//     an['download'] = n;
//     an.click(); // No work on Safari? Try making explicit (visible) link instead?
//
//     // Did that block? Revoke now??
//     t = ts()-t;
//     mess('ms-tm',t+' ms');
//
//     //win.location = d; //win.location.href = d; //return;
//
//     // Invalidate the big working canvas we just used, if applicable
//     // What?? Why? Is this always necessary? Ever necessary??
//     ///if (!sk) canv.width = canv.height = 0;
//
// } // saveuimg
//
//
// // Called from the Scale selector control, and elsewhere
// // Set the fadeflag, and the various slider variables (posn,max,val)
// // v: 0==SCALE 1==FADE 2==MASK 3==ALPHA 4==JPG 5==ANGLE
//
// function scalefunc(v)
// {
//     //cl('scalefunc: f='+f);
//     // Warning: On Chrome, gets called lots! Don't better do much.
//     // 0==SCALE 1==FADE 2==MASK 3==ALPHA 4==JPG 5==ANGLE
//     let A = [sf,ff,mf,af,jf,tf]; // Not even used!?
//     fadeflag = v;
//     let s = v>4 ? tf : v>3 ? jf : v>2 ? af : v>1 ? mf : v ? ff : sf;
//     s = (s*100>>0)/100;	// s might be non-integer, from a fit operation
//     gid('rng1').max = v==5 ? 360 : 100;	// 200 400 // Try different overscales?
//     gid('rng1').value = s;
//
//     mess1('ms-rng',s);
//
//     // If fading, perhaps get scaled image into backing store? Especially if GC (on iMac)?
// }
//
//
// // When constrained, images should fill their windows
// // It is unclear what/when to do scale
//
// function constrain()
// {
//     let I1 = bmpf && ecv1.width ? ecv1 : img1;
//     let I2 = bmpf && ecv2.width ? ecv2 : img2;
//
//     cl('constrain: '+consflag);
//     let f=0,t;
//
//     let m = can1.width*100/I1.width, n = can1.height*100/I1.height;
//     cl('sf='+sf+' m='+m+' n='+n);
//     m = m>n?m:n;
//     if (sf<m) // float tolerance?
//     {
//         sf = m;
//         setscale(sf/100);
//         if (gid('rs')[SI]===0) scalefunc(0); // GUI side effects
//         f=1;
//     }
//     if (srcx1>0) srcx1=srcx2=0,f=1;
//     if (srcy1>0) srcy1=srcy1=0,f=1;
//
//     ///if ((img1.width+srcx1)*sf/100<can1.width) { srcx1=srcx2= 100*can1.width/sf-img1.width>>0; f=1; }
//     ///if ((img1.height+srcy1)*sf/100<can1.height) { srcy1=srcy2= 100*can1.height/sf-img1.height>>0; f=1; }
//     if (t=100*can1.width/sf-I1.width>>0,srcx1<t) { srcx1=srcx2=t; f=1; }
//     if (t=100*can1.height/sf-I1.height>>0,srcy1<t) { srcy1=srcy2=t; f=1; }
//
//     if (f)
//     {
//         drawimages();
//         drawobjects();
//     }
// }
//
//
// // Callback for file type select and show mode select widgets
//
// function selectfunc(e)
// {
//     e = e.target; // convert to 'this' // e.shiftKey?
//     let t = e.id==='ts', i = e[SI];
//     cl('selectfunc: '+e.type+' '+e.id+' '+i+' '+e.value)
//
//     if (t) savetype = i; // TXT,HTM,PNG,JPG, ,TIF8G,TIF24,TIF32, ,BMP32
//     else
//     {
//         showflag = i-1; // HACK! subtract 1 because next call will add 1 (??)
//         redrawfunc(null,2);
//     }
// }
//
// // Set up local control panel AND popup panel for main callback function
// // These two functions get sent to popups too, so can't use local-to-this-file vars/funcs
// // Note cbk symbol below will get missed in the popup panel!
// // Many controls need onchange rather than onclick, eg select, input-color, etc.
// function setcb()
// {
//     //var x = doc.getElementsByTagName('button');
//     // 12 input 49 button 8 select
//     let i=0,x=document.querySelectorAll('button,input'),
//         l=x.length; // 'button.m'
//     //cl('Set '+l+' controls'); // cl not allowed (due to minification)!
//     for ( ; i<l; i++ ) x[i].addEventListener('click',cbk); // onchange?
// }
// // Set something in the control panel: style, message, etc.
// // This is not ideal
// function setpa(id,s)
// {
//     if (id=='bc'){ // background colour
//         // [body,divall],divtop,divtools, in-can,ms-rng
//         //document.documentElement.style.background=s;
//         for (var A=['body','divtools','in-can','ms-rng'],i=0;i<A.length;i++)
//             gid(A[i]).style.background=s;
//     }else if (id=='cs') // canvas size
//         gid('in-can').value = s;
//     else if (id=='vs') setvs(s);
//     else document.getElementById(id).innerHTML = s;
//     // should the psend be here, protected by wpan test?
// }
// // Set all the toolbars visible or hidden, or custom
// function setvs(j) // What's the mnemonic?? setvisible
// {
//     if (j==2) gid('metb').style.display = 'block'; else
//         gid('metb').style.display =
//             gid('fitb').style.display =
//                 gid('vitb').style.display =
//                     gid('edtb').style.display =
//                         gid('totb').style.display =
//                             gid('prtb').style.display =
//                                 gid('metb').style.display =
//                                     !j?'block':'none';
//
//     // Change top row word styles to match
//     let i,x=document.getElementsByClassName('b'),n=x.length;
//     for ( i=0; i<n; i++ ) x[i].style.color = tbflags[i]?TBHIGH:TBNORM;
// }
//
// function cbk(e) // button callback, for both local and popup control panels
// {
//     //if (typeof e == 'number') return CB(e);
//     let s = e.target.id; // button/control "name"
//     s = s&&s.length ? s : e.target.innerHTML;
//     CB(s,e);
// }
//
// // Starting to get messy!
// var dbshow=0; // 20201229 HACK
//
// function CB(i,e) // generic callback from HTML?!
// {
//     let j,k,l,p;
//     let sk=e?e.shiftKey:0;
//     let ck=e?e.altKey||e.metaKey?2:0:0; // test tolerance stuff, unused now
//
//     cl('CB: i='+i);
//
//     // Check whether a checkbox is checked?
//     if (i==='pa') { pathflag=1-pathflag; messfns(); } // path
//     if (i==='cr') cors(); // CORS cross-origin stuff
//     if (i==='gc') tchf=1-tchf; // Chrome
//     if (i==='bm') bmpf=1-bmpf; // Special (non-native) load for BMP files
//     if (i==='co') { if(consflag===1-consflag)constrain(); } // Constrain draw
//     if (i==='sm') { let v=1-smthflag;smthflag=v;ctxsmooth(ctx1,v);ctxsmooth(ctx2,v); }
//     if (i==='mw') { mousflag=1-mousflag; } // Mousewheel flag
//
//     // What the heck?? Called from Load button
//     // Maybe dates from dll (dynamic load) experiments
//     if (i==10)
//     {
//         if (sk) dll('dll'); // test - unused dynamic load of scripts
//         else
//         {
//             let o=gid('fipt'); j='webkitdirectory';
//             if (ck) o.setAttribute(j,'');
//             else o.removeAttribute(j);
//             o.click();
//         }
//
//     } // Bypass ugly system File button
//
//     /*
// 	// Experimental stuff for simplifying all or one polygon(s)
// 	if (i==3) if (sk) // simplify (ie. remove collinear points) all regions
// 	{
// 		for (j=k=0,l=Regions.length;j<l;j++) p=Regions[j][RPTS],k+=p.length-simplifypoly(p,ck);
// 		mess('ms-reg',''+l+' regions: '+k+' vertices eliminated');
// 	}
// 	else if (selectflag>VIEWSELECT)
// 	{
// 		k=simplifypoly(Regions[selectflag][RPTS],ck);
// 		mess('ms-reg',''+k+' vertices now');
// 	}
// 	*/
//
//     let tbars = function(i,f)
//     {
//         let x=0,j=tbflags[i]=1-tbflags[i];
//         if (f!=1&&j&&!sk){ for(;x<5&&(x==i||!tbflags[x]);x++); if(x<5)tbars(x,1); }
//
//         gis(tbs[i]).display = j?'block':'none';
//         tmb[i].style.color = j?TBHIGH:TBNORM;
//         if(f!=1)resizefunc(6);
//     }
//
//
//     // These are the new top row "buttons"
//     if (i==='File')
//     {
//         // File: Load/Save/Projects ... Quit?
//         tbars(FITB);
//     }
//     if (i==='View')
//     {
//         // View: Canvas/Display/Scale/Fade ... Sweep/Fade/Swap?
//         tbars(VITB);
//     }
//     if (i==='Edit')
//     {
//         // Edit: Drawing/Colours/Categories ... hide,back/fore,delete ... Clear/Swap?
//         tbars(EDTB);
//     }
//     if (i==='Tools')
//     {
//         // Tools: Transforms:invert,mirror,flip,reduce ... swap? Sweep/Fade/View?
//         tbars(TOTB);
//     }
//     if (i==='Prefs')
//     {
//         // Prefs: show/hide: fonts,colours,size,linewidth,linecolour ...
//         tbars(PRTB);
//     }
//     if (i==='Cats')
//     {
//         // Categories
//         ///showmenu();
//         ///resizefunc(6);
//         if (sk||ck) showmenu();
//         else catpopup();
//     }
//     //if (i==='Data')
//     //{
//     // Data: Count/Compare ... analysis
//     //}
//     //if (i==='Info')
//     //{
//     // Info: show/hide: image names, sizes, cursor locations, active canvas ...
//     //}
//
//     if (i==='All')
//     {
//         if (sk) return panpopup();
//         if (ck) return kd({keyCode:72}); // What the heck is this?? Hide I guess?
//
//         // All: show all the controls, or hide all the controls (except 1st row),
//         // or show 1st row and 2nd row (messages). Awkward!
//         if (tbflags[METB]===0)
//         {
//             tbflags[METB] = 1;
//             cl('Show messages');
//             j = 2;
//         }
//         else
//         {
//             j = tbflags[FITB]|tbflags[VITB]|tbflags[EDTB]|tbflags[TOTB]|tbflags[PRTB];
//             tbflags[FITB]=tbflags[VITB]=tbflags[EDTB]=tbflags[TOTB]=tbflags[PRTB]=tbflags[METB] = j?0:1;
//             cl('All controls '+(j?'hidden':'showing'));
//         }
//
//         // Tell local panel, and tell popup panel
//         setvs(j);
//         psend('vs',j);
//     }
//
//     if (i==='Help') help(e);
//     if (i==='Swap') {canc.focus(); swapfunc(e);} // 20171201 allow focus to allow keys HACK
//     if (i==='Fit') fitfunc(e);
//
//     //if (i==='Pointer') {} //function(e){cl('Pointer!');}(e);
//
//     if (i==='W') canvasresize(e,1,0);
//     if (i==='w') canvasresize(e,-1,0);
//     if (i==='H') canvasresize(e,0,1);
//     if (i==='h') canvasresize(e,0,-1);
//
//     if (i==='L') movefunc(e,1,0);
//     if (i==='R') movefunc(e,-1,0);
//     if (i==='U') movefunc(e,0,1);
//     if (i==='D') movefunc(e,0,-1);
//
//     if (i==='C') movefunc(e,0,0); // centre
//     if (i==='A') redrawfunc(e,4); // 4==Align
//     if (i==='F') fullscreen();
//
//     if (i==='Drag') modefunc(0);
//     if (i==='Pick') modefunc(7);
//     if (i==='Poly') modefunc(1);
//     if (i==='Area') modefunc(2,e);
//     if (i==='Line') modefunc(3);
//
//     if (i==='Delete') deletefunc(0,e);
//     if (i==='Hide') deletefunc(1,e);
//     if (i==='Set') deletefunc(3,e);
//     if (i==='Back') deletefunc(2,e);
//     if (i==='Clear') redrawfunc(e,1);
//     if (i==='Grid') gridfunc(e);
//
//     if (i==='GO1') greyfunc(e);
//     if (i==='GO2') countfunc(e);
//
//     if (i==='Viewer') modefunc(4,e);
//     if (i==='Sweep') modefunc(wipeflag?0:6,e); // modefunc(6,e);
//     if (i==='Align') modefunc(5,e);
//     if (i==='Clip') if (sk) simplifyregions(); else clipfunc(e);
//     if (i==='Crop') cropfunc(e); // 20200907 // Original attempts made in clipfunc()
//     if (i==='Zoom') zoomfunc(e); // not done yet (what was it supposed to do?)
//     //if (i==='Delete') deletefunc(0,e);
//
//     if (i==='Load') CB(10,e); // ? Why CB() still here?
//     if (i==='fipt') filefunc(e,e.target.files,-1); // extra
//     if (i==='Save') savefile(e);
//
//     if (i==='Add') menufunc(e,0);
//     if (i==='Rem') menufunc(e,1);
//     if (i==='Categories') menufunc(e,-1);
//
//     if (i==='clr2') colourfunc(2,e); // this
//     if (i==='in-can') inputfunc(e.target.value);
//
//     if (i==='ps') projectfunc(e);
//     if (i==='ss') selectfunc(e);
//     if (i==='ts') selectfunc(e);
//     if (i==='rs') scalefunc(e.target[SI]);
//     if (i==='ns') displayfunc(e.target[SI],0);
//     if (i==='ds') displayfunc(e.target[SI],1);
//     if (i==='fs') greyfunc(e.target);
//
//     if (i==='rng1') sliderfunc(e.target.value,1);
//     if (i==='ms-rng') sliderfunc(e.target.value,4);
//
//     if (i==='gcid') if (win.gc) { cl('garbage collect'); win.gc(); }
//
//     // 2020129 This is a hack for the DB version of IAT?!
//     // Could be disabled if no DB loaded
//     if (i==='Image:')
//     {
//         cl('Image button!');
//         dbshow = 1-dbshow;
//         gid('mapid').style.display = dbshow?'block':'none'; // divdb divvt mapid
//         gid('cid').style.display = !dbshow?'block':'none';
//     }
//
//     //if (i==='Pointer:') if (wpan) wpan.opener.focus(); // No works on GC? // wpan.blur();
//
// } // CB()
//
//
// // Get the HTML element's width/height. If display:none, try the 'absolute,hidden' technique
// // opacity:0 visibility:hidden display:none position:absolute/fixed
//
// function getwh(e)
// {
//     let r = [e.scrollWidth,e.scrollHeight];
//     if (r[0]) return r;
//
//     e = e.cloneNode(true); // true? (get child nodes)
//     e.style.visibility = 'hidden';
//     e.style.position = 'absolute';
//     doc.body.appendChild(e);
//     r = [e.scrollWidth,e.scrollHeight];
//     doc.body.removeChild(e);
//     return r;
// }
//
// /**
//  * flip corsflag and set things up for next image reads
//  * @param v
//  */
//
// function cors(v)
// {
//     let c = 'crossOrigin';
//     corsflag = v===undefined ? 1-corsflag : v;
//     cl('CORS: '+corsflag);
//     if (corsflag)
//         img1[c] = img2[c] = ''; // 'anonymous';
//     else
//         img1.removeAttribute(c),img2.removeAttribute(c);
//     ///mess('ms-reg','CORS '+(corsflag?'enabled':'disabled'));
// }
//
//
// // Dynamic load of scripts, taken from Scrabble 20170508
// // http://unixpapa.com/js/dyna.html
// // https://stackoverflow.com/questions/13515141/html-javascript-how-to-access-json-data-loaded-in-a-script-tag-with-src-set
// // How to tell what new func/var has been loaded?
// // How to tell if something was changed?
// // Assumed file name is dll.js. Need syntactically valid js (not JSON)
// // See also dynamicload() ... repeat code?! This dll() seems to be unused.
// // See also dynamic load efforts in IAD (for ZIP pako library)
//
// function dll(d)
// {
//     //gtime = ts();
//     let i,j=0,n=[];
//     for ( i in window ) {
//         console.log(j, i, typeof window[i] );
//         n[j] = i;
//         j++;
//     }
//
//     //var head = doc.getElementsByTagName('head')[0];
//     let s = doc.createElement('script');
//     //script.setAttribute("type", "text/javascript");
//     //type="application/json" - but maybe then can't set src??
//     //script.setAttribute("src", "url to the script file here");
//     ///s.type = 'text/javascript'; // probably not necessary
//     //s.async = ''; // ??
//     //s.setAttribute('async','async'); // ??
//     s.onload = function()
//     {
//         let i;
//         cl('Script apparently loaded, size of n is '+n.length);
//         for ( i in window ) // Not very efficient or elegant!!
//             if (n.indexOf(i,0)<0) cl('new symbol '+i);
//         //doc.head.removeChild(s); // ?
//
//     };
//     s.onerror = function() {cl('Script load failure '+d+'!');};
//     //s.onreadystatechange = F; // abundance of caution (AOC)?
//     s.src = d + '.js';  // .gz suffix for faster?
//     doc.head.appendChild(s); // or maybe body - head apparently says load NOW
//
// } // dll
//
//
//
//
// // target _self _blank _parent _top
//
//
// // Credit to David Walsh
//
// // Returns a function, that, as long as it continues to be invoked, will not
// // be triggered. The function will be called after it stops being called for
// // N milliseconds. If `immediate` is passed, trigger the function on the
// // leading edge, instead of the trailing.
//
// /** @param {...boolean} immediate */
// function debounce(func, wait, immediate) {
//     let timeout;
//     return function() {
//         let context = this, args = arguments;
//         let later = function() {
//             timeout = null;
//             if (!immediate) func.apply(context, args);
//         };
//         let callNow = immediate && !timeout;
//         clearTimeout(timeout);
//         timeout = setTimeout(later, wait);
//         if (callNow) func.apply(context, args);
//     };
// }
// // Right now, this is only used for the resize event
// var myEfficientFn = debounce(function() {
//     // All the taxing stuff you do
//     resizefunc(5);
// }, 250); // 250 // 150
//
//
// // http://jsfiddle.net/elisherer/y6RDB/
// // http://rosettacode.org/wiki/Sutherland-Hodgman_polygon_clipping
// // https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm
//
// // MJW: What about when clipped, subject poly is multiple??
//
// function clippoly( subjectPolygon, clipPolygon )
// {
//     let cp1, cp2, s, e, i,j;
//     let inside = function (p)
//     {
//         return (cp2[0]-cp1[0])*(p[1]-cp1[1]) > (cp2[1]-cp1[1])*(p[0]-cp1[0]);
//     };
//
//     let intersection = function ()
//     {
//         let dc = [ cp1[0] - cp2[0], cp1[1] - cp2[1] ],
//             dp = [ s[0] - e[0], s[1] - e[1] ],
//             n1 = cp1[0] * cp2[1] - cp1[1] * cp2[0],
//             n2 = s[0] * e[1] - s[1] * e[0],
//             n3 = 1.0 / (dc[0] * dp[1] - dc[1] * dp[0]);
//         return [(n1*dp[0] - n2*dc[0]) * n3, (n1*dp[1] - n2*dc[1]) * n3];
//     };
//
//     let outputList = subjectPolygon;
//     cp1 = clipPolygon[clipPolygon.length-1];
//
//     for (j in clipPolygon)
//     {
//         cp2 = clipPolygon[j];
//         let inputList = outputList;
//         outputList = [];
//         s = inputList[inputList.length - 1]; //last on the input list
//
//         for (i in inputList)
//         {
//             e = inputList[i];
//             if (inside(e))
//             {
//                 if (!inside(s))
//                 {
//                     outputList.push(intersection());
//                 }
//                 outputList.push(e);
//             }
//             else if (inside(s))
//             {
//                 outputList.push(intersection());
//             }
//             s = e;
//         }
//         cp1 = cp2;
//     }
//     return outputList;
//
// } // clippoly
//
//
// // Bresenham
// // http://rosettacode.org/wiki/Bitmap/Bresenham%27s_line_algorithm#JavaScript
//
// function bline(x0, y0, x1, y1) {
//
//     let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
//     let dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
//     let err = (dx>dy ? dx : -dy)/2;
//
//     while (true) {
//         ///setPixel(x0,y0);
//         if (x0 === x1 && y0 === y1) break;
//         let e2 = err;
//         if (e2 > -dx) { err -= dy; x0 += sx; }
//         if (e2 < dy) { err += dx; y0 += sy; }
//     }
// }
//
//

// // EXPORT (for minifier)
// // These need to be removed, except for CB() (or is that cb()? or both?)
// // cb renamed cbk because minification seemed to conflict with new cb?
//
// /*
// win['inputfunc']=inputfunc;
// win['canvasresize']=canvasresize;
// win['displayfunc']=displayfunc;
// win['movefunc']=movefunc;
// win['swapfunc']=swapfunc;
// win['redrawfunc']=redrawfunc;
// win['modefunc']=modefunc;
// win['deletefunc']=deletefunc;
// win['filefunc']=filefunc;
//
// win['greyfunc']=greyfunc;
// win['gridfunc']=gridfunc;
// win['projectfunc']=projectfunc;
// win['colourfunc']=colourfunc;
// win['fitfunc']=fitfunc;
// win['sliderfunc']=sliderfunc;
// win['savefile']=savefile;
//
// win['menufunc']=menufunc;
// //win['saveuimg']=saveuimg;
// win['countfunc']=countfunc;
//
// win['scalefunc']=scalefunc;
// win['selectfunc']=selectfunc;
// */
//
//
// win['CB']=CB;
// win['cbk']=cbk;
//
// // Having trouble with the 3 symbols setcb, setpa, setvs
// //win['setcb']=setcb;
// //win['setpa']=setpa;
// //win['setvs']=setvs;
//
//
// /**
//  * IAT Method: drawpoints
//  * Updated: 20171120
//  * New file iatdraw.txt
//  * Must try harder to separate out these canvas-related functions
//  * Will try to parameterize properly, but might resort to keeping global references
//  *
//  * For the points, we'll try a different approach: keep in image coordinates,
//  * keep track of transformation coordinates (srcx, srcy, scale, matrix M),
//  * draw in terms of the canvas coordinates
//  * Compare for example with drawgrids()
//
//  * save restore beginPath moveTo lineTo stroke lineWidth strokeStyle
//  * Globals: ctx1,ctx2 srcx1,srcx2 sf,canc,can1,can2, selectpnt, cp_clr1, cp_clr2
//  *
//  * @public
//  * @param P
//  * @return {String} capitalized string
//  */
//
// export const drawpoints = function(P) {
//
//     // Should we try XOR paint? 0.5 shift in x and y??
//     let l = 1; // // 4 7
//     let c = canc === can1;
//     let h = 60;
//     let w = 60;
//     let d = 0.5;
//
//     let clr1 = cp_clr1; // 'red';
//     let clr2 = cp_clr2; // 'green';
//     let clr2 = cp_clr2; // 'green';
//     let clrt = 'blue';
//     let fnt = 'bold 12px Arial';
//
//     // The points exist in image translated, scaled, and transformed space
//     // Must get them to the right place in the visible canvases
//     let i, f, x, y, x1, y1, x2, y2, n = P.length;
//
//     if (n > 0) {
//         ctx1.save();
//         ctx1.strokeStyle = c ? clr1 : clr2;
//         ctx1.font = fnt;
//         ctx1.setTransform(1, 0, 0, 1, 0, 0);
//         ctx2.save();
//         ctx2.strokeStyle = !c ? clr1 : clr2;
//         ctx2.font = fnt;
//         ctx2.setTransform(1, 0, 0, 1, 0, 0);
//     }
//     for (i = 0; i < n; i++) {
//         f = i === selectpnt ? 2 : 0;
//         x = P[i][0];
//         y = P[i][1];
//
//         // Perhaps a point should be transformed from image coordinates to warped image coordinates
//
//         // Must draw a point in each canvas, transformed to canvas coordinates
//         x1 = x;
//         x2 = x1 + srcx2;
//         x1 = x1 + srcx1;
//         x1 = x1 * sf / 100 >> 0;
//         x1 += d;
//         x2 = x2 * sf / 100 >> 0;
//         x2 += d;
//
//         y1 = y;
//         y2 = y1 + srcy2;
//         y1 = y1 + srcy1;
//         y1 = y1 * sf / 100 >> 0;
//         y1 += d;
//         y2 = y2 * sf / 100 >> 0;
//         y2 += d;
//
//         //if (i==0)
//         //{
//         //}
//
//         // Draw the number associated with the point
//         ctx1.strokeStyle = (i & 1) ? clr2 : clr1;
//         ctx1.fillStyle = f ? 'yellow' : clrt;
//         ctx1.lineWidth = l + f;
//         ctx1.beginPath();
//         ctx1.moveTo(x1, y1 - h / 2);
//         ctx1.lineTo(x1, y1 + h / 2);
//         ctx1.moveTo(x1 - w / 2, y1);
//         ctx1.lineTo(x1 + w / 2, y1);
//         ctx1.stroke();
//         ctx1.fillText(i + 1, x1 + 3, y1 - 3);
//
//         ctx2.strokeStyle = (i & 1) ? clr1 : clr2;
//         ctx2.fillStyle = f ? 'yellow' : clrt;
//         ctx2.lineWidth = l + f;
//         ctx2.beginPath();
//         ctx2.moveTo(x2, y2 - h / 2);
//         ctx2.lineTo(x2, y2 + h / 2);
//         ctx2.moveTo(x2 - w / 2, y2);
//         ctx2.lineTo(x2 + w / 2, y2);
//         ctx2.stroke();
//         ctx2.fillText(i + 1, x2 + 3, y2 - 3);
//
//     }
//     if (n > 0) {
//         ctx1.restore();
//         ctx2.restore();
//     }
//
// };
//
// /**
//  * IAT Method: readTIF
//  * For reading and writing TIF and BMP image formats
//  * See also: bitmap.js (now iad.js or iad.txt 20181126)
//  * https://en.wikipedia.org/wiki/BMP_file_format
//
//  * How should the readBMP and readTIF functions (optionally) return metadata?
//
//  * 20180501 All this code horribly out of date; last modified 20171205
//  * The IAD project has much "better" TIFF-parsing code, but it's messy
//
//  * @public
//  * @param P
//  * @return {String} capitalized string
//  */
//
// let fillorder = new Uint8Array(256); // fillorder lookup table // 20180501
// (function(A) {
//     for (let i = 0, j; i < 256; i++) for (j = 0; j < 8; j++) A[i] |= (i >> j & 1) << 7 - j;
// })(fillorder);
//
// export const readTIF = function (fbuff) {
//     let nstrip, nrpers, sotype, sbtype, soaddr, sbaddr, width, height, depth, photm;
//     let end;
//
//     let V = new DataView(fbuff); // Not sure if I want to use this. Fine for now
//     let B = {}; // fileheader
//
//     let sbf = function(b, n) // string from buffer
//     {
//         let i, c, s = '';
//         for (i = 0; i < n; i++) {
//             c = V.getUint8(b + i);
//             if (c == 0) break;
//             s += String.fromCharCode(c);
//         }
//         return s;
//     };
//
//     let gettiftag = function(tagid, tagtp, tagct, tagof) {
//         let i, j, x;
//         let f = function(i, t) {
//             return t == 4 ? i : t == 3 ? end ? i : i / 65536 >> 0 : -1;
//         };
//         //var g = function(s,n){return sb(s,n);}
//
//         switch (tagid) {
//             case 256: // width
//                 width = f(tagof, tagtp);
//                 //ms('\twidth='+width);
//                 break;
//             case 257: // height
//                 height = f(tagof, tagtp);
//                 //ms('\theight='+height);
//                 break;
//             case 258: // BitsPerSample - depth, scalar or array[3or4] for RGB 8,8,8
//                 depth = tagct == 1 ? f(tagof, tagtp) : -1;
//                 if (depth == -1) {
//                     for (i = 0, j = 0; i < tagct; i++) {
//                         //ms('\t\tnum='+V.getUint16(tagof+i*2,end));
//                         j += V.getUint16(tagof + i * 2, end);
//                     }
//                     depth = j;
//                 }
//                 //ms('\tdepth(bps)='+depth+' (size '+tagct+')');
//                 break;
//             case 259: // compression (1=>none)
//                 x = f(tagof, tagtp);
//                 //ms('\tcompression='+x);
//                 if (x != 1) return 0; //ms('Error: compression '+x+' unimplemented'),0;
//                 // 5==lzw 6,7==jpg 8==flate
//                 break;
//             case 262: // PhotometricInterpretation (0/1=>B/W/grey 2=>RGB 3=>CT)
//                 photm = f(tagof, tagtp);
//                 //ms('\tphotometric='+photm);
//                 break;
//             //case 270: // description
//             //ms('\tdescription='+g(tagof,tagct));
//             //break;
//             //case 271: // make
//             //ms('\tmake='+g(tagof,tagct));
//             //break;
//             //case 272: // model
//             //ms('\tmodel='+g(tagof,tagct));
//             //break;
//             //case 274: // Orientation ((0,0)upperleft=>1)
//             //ms('\torientation='+f(tagof,tagtp)+' (unused)');
//             //break;
//             //case 277: // SamplesPerPixel (should be 3 for RGB, 4 for RGBA)
//             //x = f(tagof,tagtp);
//             //ms('\tsamplesperpixel='+x+' (unused)');
//             //break;
//
//             // These next 3 hold the data
//             case 273: // StripOffsets (S/L) array
//                 // Watch out! Could be scalar or array. Could be indirect too.
//                 //ms('\tstripoffsets (size '+tagct+')');
//                 nstrip = tagct;
//                 sotype = tagtp;
//                 soaddr = tagof;
//                 break;
//             case 278: // RowsPerStrip (S/L)
//                 nrpers = f(tagof, tagtp);
//                 //ms('\trowsperstrip='+nrpers); // 7
//                 break;
//             case 279: // StripByteCounts (L/S) array
//                 // Watch out! Could be scalar or array. Could be indirect.
//                 if (nstrip != tagct) return 0; //ms('Error: inconsistent strip counts'),0;
//                 sbtype = tagtp;
//                 sbaddr = tagof;
//                 break;
//
//             case 284: // PlanarConfiguration (should be 1)
//                 x = f(tagof, tagtp);
//                 //ms('\tplanarconfig='+x+' (unused)');
//                 if (x != 1) return 0;
//                 break;
//             //case 296: // ResolutionUnit (default 2)
//             //ms('\tresolutionunit='+f(tagof,tagtp)+' (unused)');
//             //break;
//             //case 305: // software
//             //ms('\tsoftware='+g(tagof,tagct));
//             //break;
//             //case 306: // datetime
//             //ms('\tdatetime='+g(tagof,tagct));
//             //break;
//             //case 315: // artist
//             //ms('\tartist='+g(tagof,tagct));
//             //break;
//             //case 339: spp (1,1,1)
//             case 322: // TileWidth
//                 //ms('\ttilewidth='+f(tagof,tagtp));
//                 return 0; //return ms('Error: tiling unimplemented'),0;
//             case 323: // TileLength
//                 //ms('\ttilelengtht='+f(tagof,tagtp));
//                 return 0; // ms('Error: tiling unimplemented'),0;
//             //case 338: // ExtraSamples
//             //ms('\textrasamples='+f(tagof,tagtp)+' (unused)');
//             //break;
//             //case 339: // SampleFormat
//             //ms('\tsampleformat (size '+tagct+')'+' (unused)');
//             //break;
//             //case 700: // XML
//             //ms('xml='+g(tagof,tagct));
//             //break;
//         }
//         return 1;
//     };
//
//     // File Header: 8 bytes in 3 fields
//     B.fhID = V.getUint16(0); // 73/4949 (II-little) or 77/4d4d (MM-big)
//     B.fhVS = V.getUint16(2); // 42 (little) or 10752 (big)
//     end = B.fhID.toString(16) == '4949';	// endian of tif file
//     B.fhOF = V.getUint32(4, end); // offset of first IFD
//
//     // Eventually, may want to handle multiple IFDs
//     // But for now, process the first IFD and its image only
//     let nextifd = B.fhOF;
//     while (nextifd) {
//         let i, j, k;
//         let a = nextifd;
//         let nume = V.getUint16(a, end);
//         a += 2;
//         nextifd = V.getUint32(a + 12 * nume, end);
//         ///t = ' nume='+nume+' next='+nextifd;
//         ///ms(t);
//
//         // Set up vars that keep track of necessary variables
//         nstrip = 0;
//         nrpers = 0;
//         sotype = 0;
//         sbtype = 0;
//         soaddr = 0;
//         sbaddr = 0;
//         width = height = 0;
//
//         for (i = 0; i < nume; i++) {
//             let tagid = V.getUint16(a, end);
//             a += 2;
//             let tagtp = V.getUint16(a, end);
//             a += 2;
//             let tagct = V.getUint32(a, end);
//             a += 4;
//             let tagof = V.getUint32(a, end);
//             a += 4;
//             //ms('i='+i+' tagid='+tagid+' tagtp='+tagtp+' tagct='+tagct+' tagof='+tagof);
//             if (!gettiftag(tagid, tagtp, tagct, tagof)) return null;
//         }
//
//
//         // Assuming we got all necessary info, read the image data
//         // What was this "contructor" for?!
//
//         /** @constructor */
//         let I = new ImageData(width, height);
//         let D, CT;
//         if (depth == 8) // (depth==8 || depth==16) // (depth==8)
//             D = new Uint32Array(I.data.buffer);
//         else
//             D = new Uint8Array(I.data.buffer);
//
//
//         // Colour table for depth==8 test
//         if (depth == 8) {
//             CT = new Uint32Array(256);
//             for (i = 0; i < 256; i++) CT[photm ? i : 255 - i] = 0xff000000 | (i << 16) | (i << 8) | i;
//         }
//         // Colour table for depth==16 test (fail: very slow to use!?)
//         if (0 || depth == 16) {
//             CT = new Uint32Array(65536);
//             //for ( i=0; i<256; i++) for ( j=0; j<256; j++ ) CT[i*256+j] = 0xff000000|(i<<16)|(i<<8)|i;
//             // Use of i and j below should be reversed for different tif endian
//             for (i = 0; i < 256; i++) for (j = 0, k = 0xff000000 | (i << 16) | (i << 8) | i; j < 256; j++) CT[j * 256 + i] = k;
//             ///ms('CT.length='+CT.length);
//         }
//
//
//         for (i = k = 0; i < nstrip; i++) {
//             // Get address and number of bytes to read
//             // Could be short or long, could be indirect or direct. Geez.
//             let so = nstrip < 2 ? soaddr : V[sotype == 4 ? 'getUint32' : 'getUint16'](soaddr, end);
//             let sb = nstrip < 2 ? sbaddr : V[sbtype == 4 ? 'getUint32' : 'getUint16'](sbaddr, end);
//
//             // Increment these to get ready for next loop, if there is one
//             if (nstrip > 1) soaddr += sotype == 4 ? 4 : 2;
//             if (nstrip > 1) sbaddr += sbtype == 4 ? 4 : 2;
//
//             ///ms('\t\tso='+so+' sb='+sb);
//
//             let P = //depth==32 ? new Uint32Array(fbuff,so) :
//                 depth == 48 || depth == 16 ? new Uint16Array(fbuff, so) :
//                     new Uint8Array(fbuff, so, sb); // Seems to be best to always treat as byte array
//             // Added sb for the .set in 32-bit, below
//             //ms('\tstrip '+i+': so='+so)
//
//             if (depth == 48) for (j = 0; j < sb;) // 5 vars: D,P,j,k,sb, constant 255
//             {
//                 D[k++] = P[j++] & 0xff; // or >>8 ?? (doesn't always work, but why does this??)
//                 D[k++] = P[j++] & 0xff; // or eve >>>8? or nothing?
//                 D[k++] = P[j++] & 0xff;
//                 D[k++] = 0xff;
//             }
//                 /*
//                 else if (depth==32) for ( j=0; j<sb; )
//                 {
//                     //  GC 7400ms *0000B.tif (?? unverified) GC 2.66s?? verified
//                     D[k++] = P[j++];
//                     D[k++] = P[j++];
//                     D[k++] = P[j++];
//                     D[k++] = 0xff;j++;
//                 }
//                 */
//                 //else if (depth==32) for ( j=0; j<sb; j++,k++ )
//                 //{
//                 //	D1[k] = P[j]; // slowish? use a memcpy (array.set) instead?
//             //}
//             else if (depth == 32) {
//                 // This method will not always work. When, then? endian
//                 //typedarr.set(typedarray [,offset]) // offset into target array
//                 //clg('\t strip '+i+':
//                 ///D.set(P); // GC 2.08s!
//                 D.set(P, i * sb); // 20210211
//             } else if (depth == 24) for (j = 0; j < sb;) {
//                 D[k++] = P[j++];
//                 D[k++] = P[j++];
//                 D[k++] = P[j++];
//                 D[k++] = 0xff;
//             }
//
//             else if (depth == 16 && end) for (j = 0; j < sb; j++) // greyscale 16, photometric=1 (0?)
//             {
//                 // Should try table lookup?
//                 // Note both (>>>8) and (&0xff) needed (depend on endian), but latter much slower?!
//                 let x = P[j] >> 8; //&0xff; //>>8; 4d4d => 0xff?? >>>8 2.7s?
//                 D[k++] = x;
//                 D[k++] = x;
//                 D[k++] = x;
//                 D[k++] = 0xff;
//                 // GC 2.7s for 094.tif with >>> (incorrect) (3.9 with console??)
//                 // GC 3.36 094 (correct) 2.73 no console
//                 // GC 8.26s no console 90.tif, 8.55s
//             }
//             else if (depth == 16) for (j = 0; j < sb; j++) // greyscale 16, photometric=1 (0?)
//             {
//                 // Should try table lookup?
//                 // Note both (>>>8) and (&0xff) needed (depend on endian), but latter slower?!
//                 let x = P[j] & 0xff; //&0xff; //>>8; 4d4d => 0xff?? >>>8 2.7s?
//                 D[k++] = x;
//                 D[k++] = x;
//                 D[k++] = x;
//                 D[k++] = 0xff;
//             }
//             /*
//             else if (depth==16)
//             {
//                 // I could never make 16-bit table lookup go fast for some reason! Very slow
//                 let D1 = new Uint32Array(I.data.buffer,k);
//                 for ( j=0; j<sb; j++ ) // greyscale 16, photometric=1 (0?)
//                 {
//                     // Table lookup version (53s for huge one on GC?!)
//                     ///D[k] = CT[P[j]];
//                     D1[j] = CT[P[j]];
//                     ///if (!(k&0xfffff)) ms('k='+k);
//                     // GC 700ms gray_16bit.tif // GC 13.2s 094.tif , or 23s??
//                     // Super-fast 1100ms if access 8-bit array of pixels?? (incorrect of course)
//                 }
//                 k += j;
//             }
//             */
//             else if (depth == 8) for (j = 0; j < sb; j++, k++) // greyscale 8, photometric=[0,1]
//             {
//                 // Table lookup version - but is it actually faster? Need a huge test case
//                 D[k] = CT[P[j]];
//             }
//                 /*
//                 else if (depth==8) for ( j=0; j<sb; j++ ) // greyscale 8, photometric=1 (0?)
//                 {
//                     // Should try table lookup?
//                     let x = P[j];
//                     D[k++] = x;
//                     D[k++] = x;
//                     D[k++] = x;
//                     D[k++] = 0xff;
//                 }
//                 */
//             /*
//             else if (depth==1) //for ( j=0; j<sb; j++ ) // bi-level, photometric=1 (0?)
//             {
//                 ms('sb='+sb);
//                 let x = P[j];
//                 D[k++] = x;
//                 D[k++] = x;
//                 D[k++] = x;
//                 D[k++] = 0xff;
//             }
//             */
//             else return null; //ms('error: unrecognized format');
//         }
//
//         a += 4;
//         break; // We don't know how to handle multiple images (should we write a message?)
//     }
//     return I;
//
// } // readTIF
//
// /**
//  * IAT Method: saveTIF
//  *
//  * @public
//  * @return {String} capitalized string
//  * @param I
//  * @param f
//  * @param c
//  */
//
// const saveTIF = function(I, f, c) // f===0/null => G8, f===1 => RGB32, f===2 => RGB24
// {
//     // Options
//     let rbits = 0;	// rbits==1 => fillorder==2 (reverse bits)
//     let mac = 1;	// byteorder (4949/4d4d) (Intel/Mac)
//
//     // Not done yet: 1b,4b,16b, 8b-colour, nstrip>1, tiles, palette, planar, LZW, ZIP, PACKBITS
//     let spp = f == 1 ? 4 : f == 2 ? 3 : 1;		// samples/bytesperpixel
//     let ntag = 6 + rbits + (f ? 1 : 0);		// number of required tags
//     let nex = f ? 8 : 0;				// number of extra bytes for indirect things
//     let nhi = 4 * (2 + (2 + 3 * ntag));		// number of bytes in header plus ifd record
//
//     let w, h, i, j = 0, k;
//
//     function swap32(x) {
//         return x << 24 | (x & 0xff00) << 8 | x >> 8 & 0xff00 | x >>> 24;
//     }
//
//     function v32(x) {
//         return mac ? swap32(x) : x;
//     }
//
//     w = I.width;
//     h = I.height;
//     let D32 = new Uint32Array(I.data.buffer);
//
//     // Compression test - first we try reliable ZIP
//     ///var zipbytes = pako['deflate'](new Uint8Array(I.data.buffer));
//     ///clg('zip bytes: '+zipbytes.length);
//
//     /*
//         let nb = nhi + nex + w*h*spp;
//         let R8 = new Uint8Array( nb );
//         console.log('saveTIF: bytes '+nb);
//         let R32 = new Uint32Array( R8.buffer );
//         //console.log('saveTIF: bytes '+nb);
//     */
//     // Allocate the 4-byte buffer first to ensure alignment
//     let nb = nhi + nex + w * h * spp;
//     let R32 = new Uint32Array((nb + 3) >> 2);
//     let R8 = new Uint8Array(R32.buffer);
//     console.log('saveTIF: bytes ' + nb + ', uints ' + R32.length);
//
//     let R8a = new Uint8Array(R8.buffer, nhi + nex); // View into pixels section of file
//
//     /** @param {...*} c */
//     let tag = function(n, t, v, c) // write 12 bytes of a TIF tag
//     {
//         R32[j++] = mac ? v32(n << 16 | t) : t << 16 | n;
//         R32[j++] = v32(c ? c : 1); // default count is one, for direct info
//         ///R32[j++] = v32(v); // works for 8,24 4949, not 8,24 4d4d
//         // grey: single shorts no good
//         // RGB3: single shorts no good (indirect 8,8,8 depth ok)
//         ///R32[j++] = t==3&&(!c||c<3) ? v32(v<<16) : v32(v);
//         R32[j++] = t == 3 && (!c || c < 3) ? mac ? v32(v << 16) : v : v32(v);
//     };
//
//     // 8 byte header
//     R32[j++] = mac ? 0x2a004d4d : 0x002a4949; // 0x49490042 0x2a004d4d
//     R32[j++] = v32(0x0000000a); // in our scheme here, first IFD is at 10, not 8
//
//     // IFD, organized for 4-byte alignment except for first 2 bytes
//
//     // WARNING: must write the correct number ntag of tags!! // 20180501
//     R32[j++] = mac ? ntag << 24 : ntag << 16;
//
//     //tag(254,4,0);						// newsubtype (opt, dflt 0)
//     tag(256, 4, w);						// width(3/4)
//     tag(257, 4, h);						// height/length(3/4)
//     tag(258, 3, f ? nhi : 8, spp);			// bitspersample (dflt 1) (sometimes indirect!)
//     //tag( 259,3, 1);					// compression (opt, dflt 1)
//     tag(262, 3, f ? 2 : 1);					// photometricinterpretation
//     if (rbits) tag(266, 3, rbits ? 2 : 1);	// fillorder (opt, dflt 1)
//     tag(273, 4, nhi + nex);				// stripoffsets (could be indirect!) 4/3
//     if (spp != 1) tag(277, 3, spp);		// samplesperpixel (opt, dflt 1) (reqd? yes, for rgb)
//     //tag( 278,4, h);					// rowsperstrip (opt, dflt height) (4/3)
//     tag(279, 4, w * h * spp);				// stripbytecounts (could be indirect!) (3/4)
//
//     ///tag(282,5,4*(2+(2+3*ntag)));	// xres (reqd?) (indirect)
//     ///tag(283,5,8+4*(2+(2+3*ntag)));	// yres (reqd?) (indirect)
//     //296 resolutionunit
//     ///tag(338,3,1); // extrasamples - should be used if RGB32??
//
//     R32[j++] = 0;		// nextIFD
//
//     // 16 extra bytes for Xres and Yres
//     ///R32[j++] = 300;
//     ///R32[j++] = 1;
//     ///R32[j++] = 300;
//     ///R32[j++] = 1;
//
//     // 8 extra bytes (3 or 4 shorts) for RGB (8,8,8) or (8,8,8,8) depth spec
//     if (f) {
//         R32[j++] = v32(0x00080008);
//         R32[j++] = f == 1 ? v32(0x00080008) : mac ? 0x00000800 : 0x00000008;
//     }
//
//     console.log('saveTIF: image offset ' + (j * 4) + ' bytes');
//     if (f == 1) // 32-bit RGB  // use .set?? // use R8? // R32.set(D32,j*4,w*h*4);
//         R32.set(D32, j); // a straight memcpy // check for correct endian? // bytes vs words?
//     ///for ( i=0,k=w*h; i<k; i++,j++ ) R32[j] = D32[i];
//     else if (f == 2) // 24-bit RGB // Try using D8 for extra speed?
//     {
//         for (i = 0, j *= 4, k = w * h; i < k; i++)
//             R8[j++] = D32[i] & 0xff, R8[j++] = D32[i] >>> 8 & 0xff, R8[j++] = D32[i] >>> 16 & 0xff;
//     } else // 8-bit grey // Try R8? Use clamped??
//         ///for ( i=0,k=w*h; i<k; )
//         ///R32[j++] = (D32[i++]&0xff) | (D32[i++]&0xff)<<8 | (D32[i++]&0xff)<<16 | (D32[i++]&0xff)<<24;
//         for (i = 0, k = w * h; i < k; i++) R8a[i] = D32[i] & 0xff; // red component??
//
//     console.log('saveTIF: ' + i + ' pixels written');
//
//     if (rbits)
//         for (i = 0, j = R8a.length; i < j; i++) R8a[i] = fillorder[R8a[i]]; // 20180501
//
//     return R32; // truncate based on R8?
//
// };  // saveTIF
//
// /**
//  * IAT Method: readBMP
//  *
//  * @public
//  * @return {String} capitalized string
//  * @param fbuff
//  */
//
// function readBMP(fbuff) {
//
//     let V = new DataView(fbuff); // Not sure if I want to use this. Fine for now
//     let B = {}; // fileheader and infoheader, bf and bi prefixes
//
//     // See http://www.i-programmer.info/projects/36-web/6234-reading-a-bmp-file-in-javascript.html?start=1
//
//     // File Header: 14 bytes in 5 fields
//     B.bfType = V.getUint16(0, true); // "BM" 66,77 19778
//     if (B.bfType != 19778) return null;
//     B.bfSize = V.getUint32(2, true); // filesize in bytes
//     B.bfRes1 = V.getUint16(6, true); // reserved (must be 0)
//     B.bfRes2 = V.getUint16(8, true); // reserved (must be 0)
//     B.bfOffB = V.getUint32(10, true); // OffBits
//
//     // Image Header: 40 bytes in 11 fields
//     B.biSize = V.getUint32(14, true); // Should be 40
//     B.biWdth = V.getInt32(18, true); // width
//     B.biHght = V.getInt32(22, true); // height (<0 => top to bottom)
//     B.biPlan = V.getUint16(26, true); // Planes (must be 1)
//     B.biBitC = V.getUint16(28, true); // BitCount (1,4,8, 16,24,32)
//     B.biComp = V.getUint32(30, true); // compression type [0,RLE-8,RLE-4,bitf16/32]
//     B.biImgS = V.getUint32(34, true); // SizeImage
//     B.biXPPM = V.getUint32(38, true); // XPelsPerMeter
//     B.biYPPM = V.getUint32(42, true); // YPelsPerMeter
//     B.biClrU = V.getUint32(46, true); // ClrUsed: number colours in map actually used
//     B.biClrI = V.getUint32(50, true); // ClrImportant: significant colours
//
//     // Colour Table or Masks (for some formats) could go here
//
//     // Sanity tests could go here
//     let d = B.biBitC;
//     let w = B.biWdth;
//     let h = B.biHght;
//     let s = (((d * w + 31) / 32) >> 0) * 4; // stride (ie. bytes per row)
//     let P = new Uint8Array(fbuff, B.bfOffB); // start of pixels in bmp file
//
//     console.log('readBMP: w=' + w + ' h=' + h);
//
//     /** @constructor ImageData */
//     let I = new ImageData(w, h < 0 ? -h : h);
//     let D = I.data;
//
//     /*
//     // This loop originally set up for 24 bits only, works somewhat for 32
//     // Too many variables in loop!! Faster/simpler loops probably possible
//     if (h<0) h=-h; / A hack to allow to work albeit upside over
//     let m, x,y, i,j;
//     m = d==8 ? 1 : d==24 ? 3 : 4; // MJW
//     for ( y=0; y<h; y++ )
//         for ( x=0; x<w; x++ ) // ++x vs x++ ?
//         {
//             i = (x+w*(h-y))*4;
//             j = x*m + s*y; // 3/24 4/32
//             D[i] = P[j+2];
//             D[i+1] = P[j+1];
//             D[i+2] = P[j];
//             D[i+3] = 255;
//         }
//     return I;
//     */
//
//     // Cases: (1) h<>0, (2) 3/4 align, (3) d==1/4/8/16/24/32
//     let i, j, k, n;
//     let D32 = new Uint32Array(I.data.buffer);
//     if (h < 0) h = -h; // HACK! Could be upside over
//     if (d == 24)
//         if (w & 3) for (i = n = 0; n < h; n++) for (j = s * n, k = j + 3 * w; j < k;)
//             D32[i++] = 0xff000000 | P[j++] << 16 | P[j++] << 8 | P[j++];
//         else for (i = j = 0, k = w * h; i < k;) /// i++ here or below? // works only when x4!
//             D32[i++] = 0xff000000 | P[j++] << 16 | P[j++] << 8 | P[j++];
//     else if (d == 32) // bytewise or wordwise?
//         for (i = j = 0, k = w * h; i < k;) /// i++ here or below?
//             D32[i++] = 0xff000000 | P[j++] << 16 | P[j++] << 8 | P[j++], j++; //| P[j++]<<24;
//     else console.log('readBMP: unimplemented bit depth ' + d);
//
//     ///else // h>0
//     ///if (d==32)
//     ///for ( i=0,) for ( j=s*y
//     ///D32[i++] = 0xff000000 | P[j++]<<16 | P[j++]<<8 | P[j++], j++;
//
//     return I;
//
//
// } // readBMP
//
// /**
//  * IAT Method: saveBMP
//  *
//  * @public
//  * @param I
//  * @param f
//  */
//
// function saveBMP(I, f) // f===0/null => 24-bit standard
// {
//     // Cool things to do with saveBMP:
//     // (1) Convenient row order top-to-bottom with negative height
//     // (2) Bit depth (1,2,4,8,16,24,32,64) based on number of colours
//     // (3) Use RLE-4 or RLE-8 compression when could be of benefit
//     // (4) All rows 4-byte aligned, as well as x4 in length
//
//     let w = I.width, h = I.height, i, j = 0, k, b;
//
//     let D32 = new Uint32Array(I.data.buffer);
//     let D8 = new Uint8Array(D32.buffer);
//
//     // BMP files are always stored in Little Endian order
//     // See http://www.i-programmer.info/projects/36-web/6234-reading-a-bmp-file-in-javascript.html?start=1
//     // https://en.wikipedia.org/wiki/BMP_file_format#Bitmap_file_header
//
//     let d = f ? f : 24; // 32; // Easy case only for now
//     //var s = Math.floor((depth*w+31)/32)*4; // stride (ie. bytes per row)
//     let s = ((d * w + 31) / 32 >> 0) * 4; // stride (ie. bytes per row)
//     let nb = 56 + s * h;
//     console.log('w=' + w + ' h=' + h + ' depth=' + d + ' stride=' + s + ' bytes=' + nb);
//
//     let R8 = new Uint8Array(nb);
//     let RV = new DataView(R8.buffer);
//     let end = true; // needed? // BMP => little-endian format
//
//     // File Header: 14 bytes
//     RV.setUint16(0, 19778, end); // "BM" 66,77 19778
//     RV.setUint32(2, nb, end); // filesize in bytes
//     RV.setUint16(6, 0, end); // reserved (must be 0)
//     RV.setUint16(8, 0, end); // reserved (must be 0)
//     RV.setUint32(10, 56, end); // OffBits (4-byte aligned from 54)
//
//     // Image Header: 40 bytes in 11 fields
//     RV.setUint32(14, 40, end); // Should be 40
//     RV.setInt32(18, w, end); // width
//     RV.setInt32(22, -h, end); // height (<0 => top to bottom) (option?)
//     RV.setUint16(26, 1, end); // Planes (must be 1)
//     RV.setUint16(28, d, end); // BitCount (1,4,8, 16,24,32)
//     RV.setUint32(30, 0, end); // compression type [0,RLE-8,RLE-4,bitf16/32]
//     RV.setUint32(34, 0, end); // SizeImage (zero allowed if no compression?)
//     RV.setUint32(38, 0, end); // XPelsPerMeter (72*39.37=~2834.6) (300=~11811)
//     RV.setUint32(42, 0, end); // YPelsPerMeter
//     RV.setUint32(46, 0, end); // ClrUsed: number colours in map actually used (zero allowed if 2^n?)
//     RV.setUint32(50, 0, end); // ClrImportant: significant colours (zero allowed if 2^n?)
//
//     // Write color table here, if necessary
//
//     // Write pixels, ensuring each row is 32-bit aligned. But since not 32-aligned anyway,
//     // maybe should just use R8??
//     if (d == 32) {
//         for (i = 56, j = 0, k = w * h; j < k;) // -> bgra
//             b = D32[j++],
//                 R8[i++] = b >> 16 & 255, // blue
//                 R8[i++] = b >> 8 & 255, // green
//                 R8[i++] = b >> 0 & 255, // red
//                 i++; // R8[i++]=255; // alpha (could be 0, 255, or custom straight from imagedata)
//     }
//     /*
//     else if (d==24) for ( i=14+40,j=0; j<w*h; )
//     {
//         for ( k=j+w; j<k; )
//             b=D32[j++],
//             R8[i++]=b&255,
//             R8[i++]=b>>16&255,
//             R8[i++]=b>>8&255; // abgr -> rbg
//         while (i&3) R8[i++] = 0; // Up to 3 bytes of padding at end of row
//     }
//     */
//     else if (d == 24) for (i = 56, j = 0; j < w * h;) {
//         for (var xx = j + w; j < xx;) {
//             b = D32[j++];
//             R8[i++] = b >> 16 & 255;
//             R8[i++] = b >> 8 & 255;
//             R8[i++] = b >> 0 & 255;
//         }
//         // Up to 3 bytes of padding at end of row. Code only works when 4-byte aligned.
//         // Does this clause slow down the loop? Because it need not be here when rows are x4.
//         while (i & 3) R8[i++] = 0;
//     }
//
//     return R8;
