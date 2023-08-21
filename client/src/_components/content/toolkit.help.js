/*!
 * MLE.Client.Content.Help.Toolkit
 * File: toolkit.help.js
 * Copyright(c) 2023 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 *
 * ----------
 * Description
 *
 * Help pages for the Image Toolkit component.
 *
 * ---------
 * Revisions
 * - 09-07-2023   Updated instructions for upgraded Toolkit workflows and features.
 */

import React from 'react';
import Icon from '../common/icon';
import Button from '../common/button';

/**
 * MLE Toolkit tooltip selector
 *
 * @public
 */

export const getTooltip = (key) => {
    return tooltips.hasOwnProperty(key) ? tooltips[key] : null;
}

/**
 * MLE Toolkit instructions
 *
 * @public
 */

const tooltips = {
    loadMLPImage: <div>
        <p>To load an image from the MLP Library to the MLE Toolkit:</p>
        <ol className={'list'}>
            <li>Locate the capture image in the navigator tree</li>
            <li>Click the <Icon type={'iat'}/> icon to open the Toolkit loader dialog</li>
            <li>Select which Toolkit panel you want to load the image</li>
            <li>Select the image version you want to load</li>
            <li>Click the green 'Load Image in Toolkit' button</li>
        </ol>
    </div>,
    loadLocalImage: <div>
        <div>To load an image from a local directory to the MLE Toolkit:</div>
        <ol className={'list'}>
            <li>Click the <Icon type={'load'} /> open file button in the panel controls, or
                click 'Click to load' button on the centre of the panel.
            </li>
            <li>Select "Open Local Image File" or drag and drop a file into the import box and click
                "Open Image".
            </li>
        </ol>
    </div>,
    uploadMLPImage: <div>
        <p>To upload an image to the MLP Library from the MLE Toolkit:</p>
        <ol className={'list'}>
            <li>Locate the capture image in the navigator tree</li>
            <li>Click the <Icon type={'iat'}/> icon to open the Toolkit Loader tool</li>
            <li>Select which Toolkit panel you want to load the image</li>
            <li>Select the image format for the uploaded image</li>
            <li>Select the image version you want to upload</li>
            <li>Click the green 'Upload Image to MLP Library' button</li>
        </ol>
    </div>,
    cropImage: <div>
        <p>To crop an image to a smaller region:</p>
        <ol className={'list'}>
            <li>Select 'Crop' mode. This displays the crop tool below panels with
                loaded images.</li>
            <li>Click and drag on the image to outline the region of interest. The (X, Y) offset and (W, H) dimensions of the
                selected area are shown in the crop tool. Note that these values are scaled by the rendered image scale.
            </li>
            <li>Adjust the dimensions and position of the selected area from the crop panel or by
                dragging the selection box to a new location in the region. Using the 'Match' function you can also match
                the selected area to match the dimensions of the opposite panel image (if loaded). The selected area
                can be cleared using the <b>erase</b> control button, or by resetting, resizing or changing
                the view scale of the image.
            </li>
            <li>
                To apply the crop, click the green <Icon type={'crop'} /> <b>Crop</b> button in the lower crop panel.
            </li>
        </ol></div>,
    resizeImage: <div>
        <p>To resize an image:</p>
        <ol className={'list'}>
            <li>Click the 'resize' button above the image to open the Resizer tool</li>
            <li>In the Resizer tool, update the dimensions of the image (or canvas). You can match image width or height
                to the opposite panel image dimensions.
            </li>
            <li>Alternatively, you can scale the image by a factor. The aspect ratio of the image is maintained by default.
            </li>
            <li>
                Click the 'Update' button to resize the image. Note that it is necessary to also save the image state to
                update the source image.
            </li>
        </ol>
    </div>,
    alignImages: <div>
        <p>To select register two images in the MLE Toolkit:</p>
        <ol className={'list'}>
            <li>Load images into the left and right panels</li>
            <li>Correct differences in image size by resizing an image such that the largest height/width
                matches that of the opposite image. Use the Resizer tool 'Match' function to match the height or width of
                the corresponding image.</li>
            <li>If the two images are of different shapes, correct this by cropping the images
                to a matching shape which shows the most landscape detail. Use the crop tool 'Match' function to overlay a region of interest
                of the same dimensions as those of the corresponding image.</li>
            <li>Select <Icon type={'crosshairs'} /> <b>Register</b> mode from the MLE Toolkit menu.</li>
            <li>Identify four corresponding features in the image. Use these guidelines for selection: (1) The control
                points should be pixels that you can identify in both images that haven’t varied over time. (2) The
                control points need to be spread in a box shape around the image; (3) Select points that reduce
                the collinearity coefficient as close to zero as possible. (4) Use the region magnifier by pressing the spacebar
                to select more precise control points.
            </li>
            <li>Selected control points will appear on the image as cross-shaped markers numbered in the order they were created.
                The coordinates of control points are shown in the Register tool below the canvas. Click
                "Overlay" to view both sets of control points on the same image.</li>
            <li>You can adjust the coordinates or delete control point by clicking the marker icon in the Control
                Points tool.</li>
            <li>Once four control point pairs have been selected, from the panel of the 'target' image to be transformed,
                click the green "Align" button on the Register tool. The image will be transformed
                using perspective transformation
                (See <a target={'_blank'} href={'https://docs.opencv.org/4.x/da/d54/group__imgproc__transform.html'}>OpenCV documentation</a>).
            </li>
        </ol>
    </div>
}

/**
 * MLE Toolkit "Getting Started" help page.
 *
 * @public
 */

const toolkitHelp = (gotoPage) => {


    const gettingStarted = <>
        <h4>Toolkit: Getting Started</h4>
        <p>
            The MLE Toolkit is a basic image viewer, editor and alignment tool that allows you to work directly
            with the images from the Mountain Legacy collection, or with other images loaded from your computer.
        </p>

        <ol className={'list'}>
            <li><b>Basic Features:</b> Panning, zooming, cropping and resizing. Image files can also be
                downloaded to your local machine, or loaded/uploaded to the MLP Library.</li>
            <li><b>Image Comparison:</b> Images can be viewed side-by-side and as transparent overlays.</li>
            <li><b>Image Alignment:</b> Images of the same scene can be aligned using user-selected control points.</li>
        </ol>

        <h5>Image Panels</h5>
        <p>MLE Toolkit has left and right image panels each with a canvas where the image is displayed, and a
            control menu with different image operations. Panels have multiple canvases
            or layers that allow you to view and interact with images:
        </p>
        <ol className={'list'}>
            <li>Rendered or 'View' Layers, which display the scaled and visible portion of the image within
                the bounds of the canvas</li>
            <li>Markup or 'Overlay' Layers, where graphics such as control points and crop boxes appear
                superimposed on the image. </li>
        </ol>
        <p>Other hidden layers store multiple resolutions of the image. The original 'source' image data
            is stored in state in case a reset is required.
        </p>
        <p>The panel control menu above the canvas view applies operations to load, save, view or
            transform the panel image. See <b>Panel Controls</b> for details. The Info Panel above the canvas
            provides information about the loaded image. See <b>Panel Info</b> for details.</p>

        <h5>Loading Images</h5>
        <p>
            Use one of the following methods to load JPEG, PNG, or TIFF images into a panel:
        </p>
        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'load'} /></th>
                <th>Open an image from a local directory</th>
                <td>
                    {getTooltip('loadLocalImage')}
                </td>
            </tr>
            <tr>
                <th><Icon type={'iat'} /></th>
                <th>Open an Image from the MLP Library</th>
                <td>
                    {getTooltip('loadMLPImage')}
                </td>
            </tr>
            </tbody>
        </table>

    </>;

    /**
     * MLE Toolkit "Basic Features" help page.
     *
     * @public
     */

    const basicFeatures = <>

        <h4>Basic Features</h4>

        <h5>Zoom</h5>
        <p>Zoom in or out of images by clicking the <Icon type={'zoomIn'} /> or  <Icon type={'zoomOut'} /> panel
            control buttons.</p>

        <h5>Pan</h5>
        <p>Loaded images can be moved on the canvas when in <b>Pan</b> mode. Click and drag the image to
            move it on the canvas. Use the zoom controls to zoom into regions of the image. Hold the shift key when
            the cursor is over the image to magnify the region. Use panning to expand and explore different
            regions of the image.</p>

        <h5>Resize</h5>
        {getTooltip('resizeImage')}

        <h5>Crop</h5>
        {getTooltip('cropImage')}

    </>;


    /**
     * MLE Toolkit "Panel Info" help page.
     *
     * @public
     */

    const panelInfo = <>
        <h4>Panel Info</h4>
        <p>The Panel Info display shows basic image information such as dimension, format, and filename, as well as status
            information about the cursor position and scale.</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th>File</th>
                <td>
                    <p>The currently loaded file. For images loaded from the MLP library, additional information is
                        provided by clicking on the <Icon type={'show'} /> button.</p>
                </td>
            </tr>
            <tr>
                <th>Type</th>
                <td>
                    <p>The file type (MIME) of the loaded image.</p>
                </td>
            </tr>
            <tr>
                <th>Size</th>
                <td>
                    <p>The file size of the loaded image in MB.</p>
                </td>
            </tr>
            <tr>
                <th>Cursor</th>
                <td>
                    <p>The mouse position (x,y) on the view canvas.</p>
                </td>
            </tr>
            <tr>
                <th>Actual</th>
                <td>
                    <p>The actual mouse pixel position (X,Y) on the image.</p>
                </td>
            </tr>
            <tr>
                <th>Scale</th>
                <td>
                    <p>The current scale of the rendered image in the canvas. A 1:1 scale indicates the image
                        is shown at full size.</p>
                </td>
            </tr>
            <tr>
                <th>Offset</th>
                <td>
                    <p>Position offset (x,y) of the image from the top left corner of the view canvas.</p>
                </td>
            </tr>
            <tr>
                <th>Rendered</th>
                <td>
                    <p>Dimensions [width, height] of the scaled image in the view canvas.</p>
                </td>
            </tr>
            <tr>
                <th>Image</th>
                <td>
                    <p>Dimensions [width, height] of the full-sized image.</p>
                </td>
            </tr>
            <tr>
                <th>Canvas</th>
                <td>
                    <p>Dimensions [width, height] of the view canvas.</p>
                </td>
            </tr>
            <tr>
                <th>Original</th>
                <td>
                    <p>Dimensions [width, height] of the original source image.</p>
                </td>
            </tr>
            <tr>
                <th>Status</th>
                <td>
                    <p>Status of the panel [empty|loaded|error].</p>
                </td>
            </tr>
            <tr>
                <th>OpenCV</th>
                <td>
                    <p>Load status of the OpenCV.js library [loaded|not loaded].</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>


    /**
     * MLE Toolkit "Panel Controls" help page.
     *
     * @public
     */

    const panelControls = <>
        <h4>Panel Controls</h4>
        <p>Panel controls are operations that apply to a specific panel.</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'load'} /></th>
                <th>Load</th>
                <td>
                    <p>Opens the image loader dialog to either open an image file from the local filesystem, or to
                        load an image from the MLP library using the MLE Navigator tree.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'download'} /></th>
                <th>Download</th>
                <td>
                    <p>Downloads the panel image as a file to the local filesystem. Available formats: JPEG, PNG,
                        TIFF.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'upload'} /></th>
                <th>Upload</th>
                <td>
                    <p><b>(Authenticated Users Only)</b> Uploads the current loaded image to the MLP library as a new image
                        to a location selected by the MLE Navigator tree.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'save'} /></th>
                <th>Save</th>
                <td>
                    <p>Overwrites the current image source data with the current image data.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'undo'} /></th>
                <th>Reset</th>
                <td>
                    <p>Resets the loaded image to the original source image data. This will undo any image
                        transformations.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'resize'} /></th>
                <th>Resize</th>
                <td>
                    <p>Opens the Resizer tool that allows you to change the image or the canvas dimensions.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'compress'} /></th>
                <th>Fit</th>
                <td>
                    <p>Resizes the image view to fit the canvas.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'enlarge'} /></th>
                <th>Expand</th>
                <td>
                    <p>Resizes the image view to the full-sized image dimensions.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'zoomIn'} /></th>
                <th>Zoom In</th>
                <td>
                    <p>Enlarge the image view.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'zoomOut'} /></th>
                <th>Zoom Out</th>
                <td>
                    <p>Shrink the image view.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'erase'} /></th>
                <th>Erase</th>
                <td>
                    <p>Erases any markup or overlay. For example, erasing wll delete control points and crop boxes.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'delete'} /></th>
                <th>Remove</th>
                <td>
                    <p>Empties the canvas and deletes the current image data and metadata.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>

    /**
     * MLE Toolkit "Modes" help page.
     *
     * @public
     */

    const toolkitModes = <>
        <h4>MLE Toolkit Modes</h4>
        <p>Toolkit operations are available in four modes:</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'move'} /></th>
                <th>Pan (Default)</th>
                <td>
                    <p>Use this mode to move the image on the canvas by clicking and dragging it. Use the zoom
                        controls to zoom into regions of the image. Hold the shift key when the cursor is over
                        the image to magnify the region.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'crop'} /></th>
                <th>Crop</th>
                <td>
                    <p>Use this mode to crop an image to a smaller region of interest.</p>
                    {getTooltip('cropImage')}
                </td>
            </tr>
            <tr>
                <th><Icon type={'crosshairs'} /></th>
                <th>Register</th>
                <td>
                    <p>Use this mode to set control points on the image that can be used to align one image with another.
                        Clicking on the image places a control point marker on the image. You can adjust the position of
                        control points on an image by either clicking and dragging them to a new location, or by changing
                        the coordinate values. Press the shift key to magnify the cursor region before setting a
                        control point.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'images'} /></th>
                <th>Compare</th>
                <td>
                    <p>Use this mode to load both images into an overlay viewer for comparison. You can adjust
                        the position and opacity of the top image to overlay feature differences.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>

    /**
     * MLE Toolkit "Image Alignment" help page.
     *
     * @public
     */

    const alignmentIATHelp = <>
        <h4>Image Registration</h4>
        <p>
            Image registration is the process of aligning two images of the same scene so that corresponding
            features or points in the images are in spatial correspondence. In other words, it involves finding
            a transformation that maps the pixels of one image onto the pixels of another image, such that the
            two images are geometrically aligned.
            </p>
        <p>
            The goal of image registration is to compensate for any differences in rotation, translation,
            scale, or distortion between the images, so that they can be compared, fused, or used together for
            further analysis. By aligning the images, valuable information can be extracted, such as identifying
            changes over time.
        </p>
        <p>
            Images can be registered in the MLE Toolkit using the 'Control Point' tool to select coordinates for
            four matching features found in both images. These four paired features are marked in the images as
            'control points' (coordinates on the image) that are used to estimate the transformation parameters
            used to align the images.
        </p>

        <h5>Instructions</h5>
        {getTooltip('alignImages')}

    </>;

    const masteredImages = <>
        <h4>Image Mastering in MLE</h4>
        <p>For registered images classified as 'mastered' to be uploaded to the MLP library, they must meet the following preconditions:</p>
        <ol className={'list'}>
            <li><b>Capture images are aligned</b> Both capture image must be aligned Follow the instructions
                in <Button icon={'help'} label={'Image Registration'} onClick={() => {gotoPage(2, 2)}} /> to
                align the images.</li>
            <li><b>Capture images are sorted</b> The historic and modern capture images must be attached to a
                historic visit and location (modern visit) respectively, which are associated
                with a common station node.
            </li>
        </ol></>


    return [
        {
            label: 'Getting Started',
            data: gettingStarted,
        },
        {
            label: 'Basic Features',
            data: basicFeatures,
        },
        {
            label: 'Panel Info',
            data: panelInfo,
        },
        {
            label: 'Panel Controls',
            data: panelControls,
        },
        {
            label: 'Toolkit Modes',
            data: toolkitModes,
        },
        {
            label: 'Image Registration',
            data: alignmentIATHelp,
        },
        {
            label: 'Mastered Images in MLE',
            data: masteredImages,
        },
    ];
}

export default toolkitHelp;
