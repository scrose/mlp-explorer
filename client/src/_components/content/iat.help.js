/*!
 * MLP.Client.Components.Content.Help
 * File: index.help.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Icon from '../common/icon';
import Button from '../common/button';

/**
 * IAT "Getting Started" help page.
 *
 * @public
 */

const iatHelp = (gotoPage) => {


    const iatStartHelp = <>
        <h4>Getting Started</h4>
        <p>
            The Image Analysis Toolkit (IAT) is a basic image editor and visualizer that allows you to work directly
            with the images from the Mountain Legacy collection, or with other images loaded from your computer.
            Based on a similar application developed by Michael Whitney, this second generation IAT is very much in
            development, and not all of the original IAT features have been integrated.
        </p>

        <ol className={'list'}>
            <li><b>Basic Features:</b> Image panning, zooming, cropping and resizing. Files can also be saved.</li>
            <li><b>Comparative visualization:</b> Images can be viewed side-by-side and overlaid.</li>
            <li><b>Image Alignment:</b> Images can be aligned using user-selected control points.</li>
            <li><b>Image Registration:</b> Authenticated users can register aligned (mastered) images
                in the MLP collection.
            </li>
            <li><b>Proposed Features:</b> Advanced markup, mask overlays, image classification and segmentation.</li>
        </ol>

        <h5>Image Panels</h5>
        <p>The IAT has two image panels (Panel 1 on the left, Panel 2 on the right) each with independent controls.
            Images are loaded on to a <b>canvas</b> or artboard where different views and transformations to the image
            data are rendered. The canvas has two main virtual layers: (1) Rendered Layer, which displays the visible portion
            of the image within the bounds of the canvas; (2) Overlay Layer, where markup is drawn on top of the image
            (e.g. control points, crop boxes). The original image data is stored in state in case a reset is required.
        </p>
        <p>Each panel has a control subpanel or menu at the top to provide options for viewing or saving the image data
            (see <b>Panel Controls</b> for details). Below each panel is a table showing status data for the panel
            (see <b>Panel Info</b> for details).</p>

        <h5>Loading Images</h5>
        <p>
            The IAT has two image panels, each of which can display a single image on its view canvas. To view the
            supported formats, go to <Button icon={'help'} label={'Supported Image Formats'} onClick={() => {gotoPage(1, 2)}} />.
            There are multiple ways to load an image into a panel:
        </p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'load'} /></th>
                <th>Local Filesystem</th>
                <td>
                    <ol className={'list'}>
                        <li>Click the <Icon type={'load'} /> open file button in the panel controls, or
                            from the panel itself to open the file selector.
                        </li>
                        <li>Select "Import File" or drag and drop a file into the import box and click
                            "Load Image".
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'iat'} /></th>
                <th>From Explorer</th>
                <td>
                    <ol className={'list'}>
                        <li>Navigate to a capture or supplementary image.</li>
                        <li>Click the <b>Open in IAT</b> menu item in the viewer menu. This
                            will open the image in the left panel for historic and supplementary images; right panel
                            for modern images.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'align'} /></th>
                <th>Registration</th>
                <td>
                    <ol className={'list'}>
                        <li>For authenticated users, navigate to the capture image to be mastered.
                            This can be either the historic or modern repeat image.
                        </li>
                        <li>Click the <b>Master</b> menu item in the editor menu. Or, when viewed from
                            the capture info page under the <b>Images</b> tab, click the <Icon type={'master'} /> icon.
                            This will open the image in the left panel for historic images; right panel
                            for modern images.
                        </li>
                    </ol>
                </td>
            </tr>
            </tbody>
        </table>

        <h5>IAT Menu</h5>
        <p>The main IAT menu offers operations that apply to both images.</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'select'} /></th>
                <th>Select</th>
                <td>
                    <p>This is the default mode for IAT. In this mode you can move the image on the canvas by clicking
                        and dragging it. Click on the image (and release), then hold the shift key when the cursor is
                        over
                        the image
                        to magnify the region.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'crop'} /></th>
                <th>Crop</th>
                <td>
                    <p>Crop mode allows you to crop an image by dragging a cropbox across the image and hitting return.
                        The size of the crop box is shown in the crop adjustment options below the panel, where you can
                        change the dimensions of the crop. Clicking the crop icon below the panel also crops the
                        image.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'crosshairs'} /></th>
                <th>Mark</th>
                <td>
                    <p>Mark mode allows you to set control points on the image that can be used for image alignment.
                        Clicking on the image draws a control point marker on the image. You can move the markers by
                        clicking
                        and dragging them to a new location. Press the shift key to magnify the cursor region.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'compress'} /></th>
                <th>Match</th>
                <td>
                    <p>The match operation resizes the larger image to the same width as the smaller image. Both panels
                        must be loaded to use this operation.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'overlay'} /></th>
                <th>Compare</th>
                <td>
                    <p>Compare loads the images into an overlay viewer to compare.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'align'} /></th>
                <th>Align</th>
                <td>
                    <p>The align operation uses user-selected control points to apply a perspective transformation
                        on the image in the right panel to align with the image in the left panel. Four control points
                        must be selected for each image and the images must have the same dimensions to align the
                        images.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'master'} /></th>
                <th>Master</th>
                <td>
                    <p>Image mastering can be used by authenticated users to upload registered images to the MLP library
                        as
                        mastered. A confirmation prompt is opened to compare the aligned images before submitting.</p>
                </td>
            </tr>
            </tbody>
        </table>

        <h5>Panel Controls</h5>
        <p>Panel controls are operations that apply to the image data in the current panel.</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'load'} /></th>
                <th>Load</th>
                <td>
                    <p>Opens the image loader dialog to either open an image file from the local filesystem, or (for
                        mastering) load from the MLP library.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'upload'} /></th>
                <th>Upload</th>
                <td>
                    <p>(Authenticated Users) Uploads the current loaded image to the MLP library as a new image for the given
                        owner. Note that the image must be an historic or modern capture image.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'save'} /></th>
                <th>Save</th>
                <td>
                    <p>Saves the current loaded image as a file to the local filesystem. Available formats: JPEG, PNG,
                        TIFF.</p>
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
                    <p>Opens dialog to resize the rendered image or the canvas dimensions.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'compress'} /></th>
                <th>Fit</th>
                <td>
                    <p>Resizes the current loaded image to fit in the canvas.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'enlarge'} /></th>
                <th>Expand</th>
                <td>
                    <p>Resizes the current loaded image to the original image dimensions.</p>
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
            </tbody>
        </table>

        <h5>Panel Info</h5>
        <p>The panel info display provides basic status information such as cursor position and current image
            dimensions.</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th>File</th>
                <td>
                    <p>The currently loaded file. For images in the MLP library, you can view information about the
                        capture owner by clicking on the <Icon type={'show'} /> button.</p>
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
                    <p>The file size of the loaded image.</p>
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
            </tbody>
        </table>
    </>;

    /**
     * IAT "Basic Features" help page.
     *
     * @public
     */

    const iatBasicHelp = <>

        <h4>Basic Features</h4>

        <h5>Zoom</h5>
        <p>Zoom in or out of images by clicking the <Icon type={'zoomIn'} /> or  <Icon type={'zoomOut'} /> panel
            control buttons.</p>

        <h5>Panning</h5>
        <p>Loaded images can be moved on the canvas when in <b>Select</b> mode. Simply click and drag the image to
            change location. This translation <b>offset</b> is shown in the panel properties below the canvas.</p>

        <h5>Image/Canvas Resizing</h5>
        <p>To resize an image:</p>
        <ol className={'list'}>
            <li>Select the <Icon type={'resize'} /> <b>resize</b> control from the panel controls.
                This opens a dialog popup where you can resize the source image or the canvas dimensions.
            </li>
            <li>Update the width and/or height values of the image and/or canvas and click <b>Update</b>.
                The image can also be scaled by a constant.
            </li>
        </ol>

        <h5>Image Cropping</h5>
        <p>To crop an image:</p>
        <ol className={'list'}>
            <li>Select the <b>Crop</b> mode from the main IAT menu. This displays the crop tool below panels with
                loaded images.
            </li>
            <li>Click and drag on the image to draw the crop box. The (X, Y) offset and (W, H) dimensions of the
                selected area are shown in the crop tool. Note that these values are scaled by the rendered image scale.
            </li>
            <li>You can adjust the offset and dimensions of the crop box using the crop tool, or by redrawing the crop
                box.
                The crop box can be cleared using the <b>erase</b> control button, or by resetting, resizing or changing
                the
                view scale of the image.
            </li>
            <li>To apply the crop, Enter 'Return' or click the <Icon type={'crop'} /> <b>Crop</b> button in the crop
                tool.
            </li>
            <li>The image will be cropped, offset to the origin (0, 0) and scaled to full size.</li>
        </ol>

    </>;

    /**
     * IAT "Image Alignment" help page.
     *
     * @public
     */

    const alignmentIATHelp = <>
        <h4>Image Alignment</h4>
        <p>
            Image Alignment is the process of finding a spatial mapping between two images based on a meaningful
            correspondence between elements within each image.
        </p>
        <p>
            In IAT, the alignment transformation is applied to the <b>target</b> image, which is loaded
            in the right panel; whereas the <b>source</b> image is loaded into the left panel, and is not altered
            during alignment. When aligning images for registration (mastering), it is important to load each image from the
            historic and repeat pair into the correct panel. By convention, we transform the modern repeat image of the
            pair, so we load it into Panel 2, while the historic image is loaded into Panel 1.
        </p>
        <p>
            IAT's alignment tool for image pairs utilizes user-selected control points to map coordinates
            in one image to another. These control points are used to compute a transformation matrix that
            warps the target image to spatially correspond to the other. To align images loaded in the canvas, you must select four control points
            in each image for a total of eight
            points. Control points are coordinate pairs that map from one image to another and are used to warp the
            image to match
            the perspective.
        </p>

        <h5>Selecting Control Points</h5>
        <ol className={'list'}>
            <li>Load the source and target images into the panels by following the methods described in the
                <Button icon={'help'} label={'IAT: Getting Started'} onClick={() => {gotoPage(2, 0)}} /> section:
                <ol>
                    <li>Opening the file from the local filesystem</li>
                    <li>Loading the file selected from the Explorer.</li>
                    <li>(Administrators) Loading the file from the Explorer API for registration.</li>
                </ol>
            </li>
            <li>Select the <Icon type={'crosshairs'} /> <b>Mark</b> mode in the IAT menu.</li>
            <li>Click on the image to select four points applied to each images. Your control point selections are shown
                on the image using orange markers numbered in the order they were created. Any stored points are
                displayed
                below the panel. Note that pressing the shift-key magnifies the mouseover region.
            </li>
            <li>You can delete the last control point by clicking the <Icon type={'delete'} /> Delete button.</li>
            <li>Click "Overlay" to view both sets of control points. Overlay also refreshes control points.</li>
        </ol>

        <h5>Align, Adjust, Repeat</h5>
        <ol className={'list'}>
            <li>Once the control points have been selected, <b>Click "Align" in the IAT menu.</b> The
                image in the right panel will be transformed.
            </li>
            <li>You can make adjustments to the alignment by moving the positions of the control points and
                realigning. Click <Icon type={'undo'} /> in the panel control reset the image to the source data.
            </li>
            <li>You can delete the last control point by clicking the <Icon type={'delete'} /> Delete button in the
                control points display below the canvas.</li>
            <li>Click "Overlay" to overlay both sets of control points. Overlay also refreshes the panel's control
                points.
            </li>
        </ol>

    </>;

    /**
     * IAT "Image Registration" help page.
     *
     * @public
     */

    const iatRegistrationHelp = <>

        <h4>Image Registration</h4>
        <p>
            Image Registration is the process of aligning two images of the same scene.
            The Explorer editor allows administrators to to upload aligned images to the MLP data store.
            The registration process creates new historic and modern capture image files with metadata records
            that are indexed as comparisons and assigned the 'master' image state.
        </p>
        <h5>Preconditions</h5>
        <p>An image pair can be registered as 'mastered' in the MLP system if it meets the following preconditions:</p>
        <ol className={'list'}>
            <li><b>Capture images are both sorted</b> The loaded historic (Panel 1) and modern (Panel 2) capture images,
                must be attached to a historic visit and location (modern visit) respectively, which are associated
                with a common station node.
            </li>
            <li><b>Capture images are aligned</b> It is assumed the modern capture image has been aligned in Panel 2
                with an historic image loaded. Follow the instructions
                in <Button icon={'help'} label={'Image Alignment'} onClick={() => {gotoPage(2, 2)}} /> to
            align the images.</li>
        </ol>

        <h5>Instructions</h5>
        <p>
            There are multiple workflows to complete an image registration of an existing historic or modern repeat image. In each
            case, the</p>
        <ol>
            <li>
                <b>Select a Modern Image by either:</b>
                <ol className={'list'}>
                    <li>Navigate to the Modern Capture Image info page and select the 'Files' tab. From the files
                        table, click the <Icon type={'master'} /> icon to open the image in the IAT.
                    </li>
                    <li>Click the Load <Icon type={'load'} /> button in the panel controls to open the file selector
                        and select the image.
                    </li>
                </ol>
            </li>
        </ol>
    </>;


    /**
     * IAT "Basic Features" help page.
     *
     * @public
     */

    const iatBackgroundHelp = <>
        <h4>About the IAT</h4>
        <p>
            <em>Excerpt: <a
                target={"_blank"} rel={'noreferrer'}
                href={'https://bioone.org/journals/mountain-research-and-development/volume-36/issue-4/MRD-JOURNAL-D-16-00038.1/Exploring-Landscape-Change-in-Mountain-Environments-With-the-Mountain-Legacy/10.1659/MRD-JOURNAL-D-16-00038.1.full'}>
                Exploring Landscape Change in Mountain Environments With the Mountain Legacy Online Image Analysis
                Toolkit
                (November, 2016)
            </a>
            </em>
        </p>
        <p>In designing the IAT, MLP researchers worked with 4 central aims:</p>
        <ol className={'list'}>
            <li>
                Focus on oblique photographs—as Delaney (2008: 76) says, “From the earliest days of the photograph
                to the present, its value has been recognized by the scientific community to help them document
                and understand the natural world.” Much of the functionality in the IAT is based on observing
                practitioners from a broad range of disciplines, organizations, and communities working with
                photographs to better understand multifaceted mountain phenomena;
            </li>
            <li>
                Widely available access—allow anyone with an Internet connection and a modern web browser
                to see, manipulate, compare, and analyze their own mountain photographs from anywhere
                in the world and/or use images in the Mountain Legacy collection. Allow anyone to download
                the toolkit and use it without an Internet connection, thus making it usable in remote field
                locations.
            </li>
            <li>
                Comparative visualization—aligning and showing the images side by side as well as overlaid on
                one another. Allow for targeted, aligned window, polygon, and area views from one image onto the
                other in a manner similar to the Klett et al (2004) time-reveal window.
            </li>
            <li>
                Classification and interpretation—allow practitioners to apply their own expertise when exploring
                the images. Practitioners should be able to classify and quantify, change, annotate, mark up, and
                visualize images as required for their various lines of inquiry.
            </li>
        </ol>

        <p>
            Although some IAT components can be used on individual images, the toolkit is designed to display 2 or
            more images and afford practitioners different methods of visualizing, annotating, and quantitatively
            describing changes (and similarities) between the photographs. Although there is software available to
            georeference oblique images (see for example Stockdale et al 2015), the focus of this IAT version is
            the photographs themselves—all quantitative descriptions and visualizations are relative to the images,
            not to a digital elevation model or map. IAT was developed with the MLP in mind, but its use is not
            restricted to the Canadian mountain west.
        </p>
    </>;

    return [
        {
            label: 'Getting Started',
            data: iatStartHelp,
        },
        {
            label: 'Basic Features',
            data: iatBasicHelp,
        },
        {
            label: 'Image Alignment',
            data: alignmentIATHelp,
        },
        {
            label: 'Image Registration',
            data: iatRegistrationHelp,
        },
        {
            label: 'About the IAT',
            data: iatBackgroundHelp,
        },
    ];
}

export default iatHelp;