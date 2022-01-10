/*!
 * MLP.Client.Components.Content.Help
 * File: index.help.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Image from '../common/image';
import Icon from '../common/icon';
import Button from '../common/button';
import captureModel from '../img/capture_image_composition.jpg';
import dataModel from '../img/mlp_data_model.jpg';

/**
 * Index of general help content
 */

const explorerHelp = (gotoPage) => {

    /**
     * Explorer "Getting Started" help page.
     *
     * @public
     */

    const explorerHelp = <>
        <h4>Getting Started</h4>
        <p>
            Welcome to the The Mountain Legacy Explorer user guide. This guide is intended to
            provide background information along with step-by-step instructions on how to
            navigate the MLP collection. The guide covers usage of features available in both the Explorer
            and Image analysis Toolkit, as well as detailed info on using the Editor management tool.
        </p>

        <h5>What is Repeat Photography?</h5>
        <p>
            It’s as simple as it sounds. You start with one photo, which was taken at a specific location in a
            specific direction (azimuth), at a specific time. You repeat this photo when you find that same location,
            point the camera in the same direction, and press the shutter release of your camera. The big difference
            between the two photos is temporal. Repeat photographs leverage the systematic nature of the original work,
            allowing researchers to re-photograph the same continuous coverage of the landscape captured by the historic images.
            Taken together, the historic photo and the modern repeat form an image pair. Through careful
            interpretation and analysis, MLP image pairs can be used to explore the dynamics and interplay of
            ecological, climate, and human-induced changes in the landscape. Digital assets include multiple
            versions of historical digitized images (e.g., unprocessed scan; cropped master), repeat images
            (RAW, TIFF and various field-useable images), location images, EXIF camera data, survey and MLP
            field notes and maps.
        </p>

        <h5>Mountain Legacy Explorer (MLE)</h5>
        <p>The Explorer is a web-based tool for exploring Mountain Legacy Project's
            vast collection of historic survey photos, modern repeat images and metadata.
            Visitors can navigate, search and filter collection items by surveyor metadata or
            by geographical location of survey stations.</p>



        <table className={'help'}>
            <tbody>
            <tr>
                <th>Viewer</th>
                <td>
                    <p>Use the viewer to explore the MLP collection images and metadata in detail.
                        Go to <Button icon={'help'} label={'Viewer'} onClick={() => {
                            gotoPage(0, 1);
                        }} /> for more information.
                    </p>
                </td>
            </tr>
            <tr>
                <th>Navigator</th>
                <td>
                    <p>Use the navigator to explore the MLP collection from a bird's eye view.
                        Go to <Button icon={'help'} label={'Navigation'} onClick={() => {
                        gotoPage(0, 2);
                    }} /> for more information.
                    </p>
                </td>
            </tr>
            </tbody>
        </table>


    </>;

    /**
     * Explorer "Viewer" help page.
     */

    const viewerExplorerHelp = <>
        <h4>Viewer</h4>

        <p>The viewer is the main right-side panel where files and metadata is loaded from the navigator and menus.
            Any node in the MLP <Button icon={'help'} label={'Data Model'} onClick={() => {gotoPage(0, 3)}} /> can
            have its metadata and attached files loaded in the viewer. For example,
            survey data for surveyor <a href={"http://localhost:3000/surveyors/show/5"}>Morrison Parsons Bridgland</a> is
            listed under the "Surveys" tab. Each item in the list can be expanded to show metadata for that item, as well as
            any attached dependent items -- in this case, survey seasons. You can also click on the item label to go to
            open the page for that item.</p>

        <p>Search and filter results are also loaded in the viewer.</p>

        <h5>Viewer Tabs</h5>
        <table className={'help'}>
            <tbody>
            <tr>
                <th>Item Details</th>
                <td>
                    <p>The main metadata for this item.</p>
                </td>
            </tr>
            <tr>
                <th>Comparisons</th>
                <td>
                    <p>List of registered historic and modern image pairs.</p>
                </td>
            </tr>
            <tr>
                <th>Metadata</th>
                <td>
                    <p>Attached metadata: e.g. participants, glass plate slides, historic map metadata.</p>
                </td>
            </tr>
            <tr>
                <th>Files</th>
                <td>
                    <p>Attached metadata files: e.g. supplementary images, field note scans.</p>
                </td>
            </tr>
            <tr>
                <th>Captures</th>
                <td>
                    <p>List of attached historic or modern repeat captures. Historic captures are sorted if attached to
                        historic visits; modern captures are sorted if attached to locations.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>

    /**
     * Explorer "Model" help page.
     *
     * @public
     */

    const modelExplorerHelp = <>

        <h4>MLP Data Model</h4>

        <h5>Model Hierarchy</h5>

        <p>
            The MLP Library consists of thousands of captures and historic captures, and tens of thousands of associated
            images. To organize this data set, an hierarchical schema has been developed to organize images by
            surveyors, surveys, survey seasons, stations, visits, and locations.
            An example of this hierarchy can be seen in <b>Figure 1</b> below. A comparatively small number of
            of captures taken by MLP do not neatly fit into the surveyor model, and are instead grouped
            according to projects.
        </p>

        <p>Each element in the hierarchy is defined as a <b>node</b>, and represents a data object of core metadata
            that has both attributes and hierarchical relationships with other nodes. Nodes in the collection data model
            can serve as containers for other nodes, or as terminal nodes. For example, a Station node is a
            container for Visit nodes.</p>

        <Image
            url={dataModel}
            caption={`Figure 1. The data object hierarchy. Example nodes are shown in the tree, while hierarchy 
            levels are defined to the left.`}
        />

        <h5>Model Elements (Nodes)</h5>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'projects'} /></th>
                <th>Projects</th>
                <td>
                    <p>A project is a container for stations that do not fit into the surveyor model listed below. The
                        Alberta Fire Lookout Towers, is an example, where Each lookout tower contains a set of historic
                        photographs
                        from that tower -- not associated with a survey -- which have been repeated.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'surveyors'} /></th>
                <th>Surveyors</th>
                <td>
                    <p>The principal surveyor of a historic survey.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'surveys'} /></th>
                <th>Surveys</th>
                <td>
                    <p>A specific survey completed under a surveyor. A survey covers a large geographical region, and
                        may span
                        several years. Surveys by different surveyors may overlap in the regions they covered.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'survey_seasons'} /></th>
                <th>Survey Seasons</th>
                <td>
                    <p>A survey season is a container for all the stations completed in a certain year for a specific
                        survey.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'stations'} /></th>
                <th>Stations</th>
                <td>
                    <p>The concept of a station has its roots in the historic surveys. A surveyor would identify a high
                        point in the
                        landscape where photographs were required to be taken. Upon arrival to that location, several
                        photographs
                        would be taken, usually in as many directions as possible. In many circumstances, the camera
                        would have to be
                        moved around in order gain the best vantage point for a particular cardinal direction. Thus,
                        there were many sub
                        locations within the general location of the station. Therefore, a station can be loosely
                        defined as a broad
                        geographic location where the distance between sub locations is within a reasonable walking
                        distance. This
                        is intentionally loosely defined, since the distinction between station and location has
                        occasionally
                        differed between different surveyors (MLP always groups the images into stations defined by the
                        surveyor, if
                        known).</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'historic_visits'} /></th>
                <th>Historic Visits</th>
                <td>
                    <p>A historic visit refers to the first visit to a station by a particular surveyor. It can be
                        thought of as a container for historic captures. A station can have only one historic visit.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'modern_visits'} /></th>
                <th>Modern Visits</th>
                <td>
                    <p>A visit refers to a visit to the station with the specific purpose of repeating the historic
                        captures from
                        the historic visit. A visit is uniquely identified by the date at which it occurred. Multiple
                        visits may occur
                        for each station. The visit object is a container for all information related to that specific
                        visit, such as
                        field note data, captures, location images, and locations.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'locations'} /></th>
                <th>Locations</th>
                <td>
                    <p>Where a station is a somewhat broad geographical location, a location (as an object in MEAT) is a
                        sub
                        location of the station. It is a specific place where a capture was taken. </p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'historic_captures'} /></th>
                <th>Historic Captures</th>
                <td>Contain multiple historic survey images and are typically added under Historic Visits.</td>
            </tr>
            <tr>
                <th><Icon type={'modern_captures'} /></th>
                <th>Modern Captures</th>
                <td>Contain multiple modern repeat images and are typically added under Modern Visits > Locations.</td>
            </tr>
            </tbody>
        </table>

        <h5>Attached Metadata</h5>

        <p>Other metadata can be attached to specific model elements.</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'participant_groups'} /></th>
                <th>Participants</th>
                <td>
                    <p>Participants in visiting groups can be attached to modern visits. There are three types of
                        participant groups:</p>
                    <ol className={'list'}>
                        <li>Hiking Parties</li>
                        <li>Field Note Authors</li>
                        <li>Photographers</li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'glass_plate_listings'} /></th>
                <th>Glass Plate Listings</th>
                <td>
                    <p>Identification for the original glass plate negatives can be attached to survey seasons.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'maps'} /></th>
                <th>Maps</th>
                <td>
                    <p>Historic map metadata can be attached to survey seasons.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'historic_captures'} /></th>
                <th>Cameras</th>
                <td>
                    <p>Camera details can be attached to historic and modern captures.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'historic_captures'} /></th>
                <th>Lenses</th>
                <td>
                    <p>Lens details can be attached to historic and modern captures.</p>
                </td>
            </tr>
            </tbody>
        </table>

        <h5>Attached Files</h5>

        <p>In addition to capture images, there are other kinds of files available in the collection.</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'images'} /></th>
                <th>Supplementary Images</th>
                <td>
                    <p>As part of a visit, location images are used to create a visual record of where the captures were taken. A
                        location image object is associated with an image file. It differs from a capture image in that it does not
                        contain an image state.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'images'} /></th>
                <th>Scenic Images</th>
                <td>
                    <p>A scenic image is an image that was taken during a repeat field season, but not necessarily associated with
                        repeat photography or the visit records. Currently, the inclusion of scenic images at the user interface
                        level is not supported (though it is at the database layer).</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'file'} /></th>
                <th>Field Note Files</th>
                <td>
                    <p>Field notes are often recorded at each visit in a field note book or field note form, then digitized using a
                        scanner. While these field notes will be transcribed and stored in the database via the visit object, the
                        scanned copies are kept for historical reference. Field note files are associated with modern visits.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>;

    /**
     * Capture image help content.
     */

    const captureExplorerHelp = <>
        <h4>Historic and Modern Captures</h4>

        <h5>What is a capture?</h5>
        <p>
            The core artifact of the MLP collection is the capture, which corresponds to a landscape view
            that is unique in location, azimuth, date, and time. For example, given a tripod setup, with the
            camera pointed in a specific direction, suppose photos are taken at f/16, 1/50 sec, and then another
            with a different exposure setting. Though we might consider these photos as sharing the same view, they form
            different captures because they were taken at different times.
        </p>
        <p>The collection has two types of captures:</p>
        <ol>
            <li><b>Historic Capture</b> A historic capture may be associated with information related to
                where its glass plate negative is located.
            </li>
            <li><b>Modern (Repeat) Capture</b> The exposure settings of a capture are generally known.</li>
        </ol>

        <h5>Capture Images</h5>
        <p>
            A capture is typically not represented by a single image file, but can include many versions
            of the same image, as shown in <b>Figure 2</b> below. These versions, called <b>capture images</b>,
            are each designated an image state to distinguish different versions (see <b>Image States</b> table below)</p>
        <p>
            For example, a photo taken for a given date, time, and location is a capture. If you delete the
            image file associated with that capture, the capture still exists. This case is rare. What’s more
            common is that an image file associated with a capture is modified several times in the MLP workflow.
            Specifically, a capture is initially represented by a raw file (when the Hasselblad is used create
            the capture, this would be a 3FR file). The raw file would be converted into a tiff file.
            The tiff file would then be registered (aligned/overlaid) with the historic image.
        </p>
        <p>
            To recap, a capture can have zero to many capture images. Each capture image has both an image file
            and an image state, where the state distinguishes the versions of the image. All the capture images
            for a specific capture are derived (indirectly or directly) from the same image file (usually a raw file).
        </p>

        <Image url={captureModel}
               caption={`
               Figure 2. The relationship between a capture and its capture images shown pictorially. 
               The capture represents the photo taken at a specific time, while the capture images are 
               instances of that same photo, differentiated by image states,image modifications, and file types.`} />

        <h5>Image States</h5>
        <table className={'help'}>
            <tbody>
            <tr>
                <th>Raw</th>
                <td><p>Original uploaded image. Typically, the associated image format is uncompressed RAW captured by
                    a digital camera for modern images or a digital scanner for historic images.</p></td>
            </tr>
            <tr>
                <th>Master</th>
                <td><p>Mastered or registered image. Image is aligned and indexed with a historic or modern counterpart.</p></td>
            </tr>
            <tr>
                <th>Interim</th>
                <td><p>Intermediate state for image alignment.</p></td>
            </tr>
            <tr>
                <th>Gridded</th>
                <td><p>Grid lines are visible on the image.</p></td>
            </tr>
            <tr>
                <th>Miscellaneous</th>
                <td><p>Image has unconventional adjustments or transformations.</p></td>
            </tr>
            </tbody>
        </table>
    </>;

    /**
     * Explorer "Navigator" help page.
     *
     * @public
     */

    const navigatorExplorerHelp = <>
        <h4>Using the Navigator</h4>
        <p>
            Use the navigator (located on the left-side panel) to search, filter and open up the vast MLP photographic library and
            database. Click on the <Icon type={'expand'} /> icon to open or close the submenus.
            Selecting or searching clickable items in the navigator loads
            metadata in the <b>Viewer</b> pane on the right.
        </p>

        <h5>Navigator Features</h5>
        <p>The navigators offers four ways to explore the collection:</p>
        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'map'} /></th>
                <th>Map</th>
                <td>
                    <p>The map navigator marks the geographical locations of survey stations on
                        a geographical map. Multiple Stations are clustered in markers that
                        show the cluster size.</p>
                    <p>Click on the marker to view the list of stations in the
                        cluster. Double click on the marker to also zoom and center the map on the cluster.</p>
                    <p>Pan by dragging the map; zoom by double clicking the map area, or use the zoom controls at top
                        left. You can also view different layers by clicking the layers icon at top right.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'tree'} /></th>
                <th>Tree</th>
                <td>
                    <p>The list (or "hierarchical") navigator organizes the data by historical surveyor and
                        associated survey data.</p>
                    <p>Click on the menu labels to load data for an item in the viewer panel.</p>
                    <p>Note that each historic and modern capture is labelled using its field note photo reference
                        identifier. When this identifier is empty, the filename of one of its captures images is used. </p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'search'} /></th>
                <th>Search</th>
                <td>
                    <p>Query the data with full-text searches of the collection metadata. This loads results in
                        the navigator panel.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'filter'} /></th>
                <th>Filter</th>
                <td>
                    <p>Filter the map station markers by surveyor, survey and survey season.</p>
                </td>
            </tr>
            <tr>
                <th>
                    <div><Icon type={'hopenleft'} /></div>
                    <div><Icon type={'hcloseleft'} /></div>
                </th>
                <th>Minimize / Maximize</th>
                <td>
                    <p>Minimizes or maximizes the navigator panel.</p>
                </td>
            </tr>
            </tbody>
        </table>

        <h5>Cookie Crumb Trail</h5>

        <p>The cookie crumb trail is a navigational aid that helps track the location of the page loaded relative to
        the navigator model.</p>

        <h5>View Menu</h5>

        <p>The view menu is just below the cookie crumb trail, and provides some additional
            options such as metadata <b>Export</b> and <b>Help</b> pages.</p>

        <h5>Item Status</h5>
        <p>Icons used in the navigator tree are colour-coded to indicate the status of the metadata or images
        associated with that node.</p>

        <h6>Station Status</h6>
        <table className={'help'}>
            <thead>
            <tr>
                <th>Icon</th>
                <th>Status</th>
                <th>Description</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th className={'grouped'}><Icon type={'stations'} /></th>
                <th>
                    <p>Grouped Station</p>
                </th>
                <td>
                    <p>Station contains historic captures that have been grouped together as a single
                        historic station, but the location of this station as not been estimated.</p>
                </td>
            </tr>
            <tr>
                <th className={'located'}><Icon type={'stations'} /></th>
                <th>
                    <p>Located Station</p>
                </th>
                <td>
                    <p>Station contains grouped historic captures and the location of the station has been estimated.
                        Historic captures have not been repeated.</p>
                </td>
            </tr>
            <tr>
                <th className={'repeated'}><Icon type={'stations'} /></th>
                <th>
                    <p>Repeated Station</p>
                </th>
                <td>
                    <p>Station contains repeat captures, but at least one of these captures need to be mastered
                        with its historic capture counterpart.</p>
                </td>
            </tr>
            <tr>
                <th className={'partial'}><Icon type={'stations'} /></th>
                <th>
                    <p>Partially Mastered Station</p>
                </th>
                <td>
                    <p>Station contains repeat captures and at least one of them has been mastered, while
                        others still require mastering.</p>
                </td>
            </tr>
            <tr>
                <th className={'mastered'}><Icon type={'stations'} /></th>
                <th>
                    <p>Mastered Station</p>
                </th>
                <td>
                    <p>Station has been repeated and all of its captures have been mastered.</p>
                </td>
            </tr>
            </tbody>
        </table>

        <h6>Capture Status</h6>
        <table className={'help'}>
            <thead>
            <tr>
                <th>Icon</th>
                <th>Status</th>
                <th>Description</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th className={'mastered'}><Icon type={'historic_captures'} /></th>
                <th>
                    <p>Mastered Capture</p>
                </th>
                <td>
                    <p>Capture is sorted and has at least one image mastered with an historic/modern capture image.</p>
                </td>
            </tr>
            <tr>
                <th className={'repeated'}><Icon type={'historic_captures'} /></th>
                <th>
                    <p>Repeated Capture</p>
                </th>
                <td>
                    <p>Capture is sorted and has at least one image paired with an historic/modern capture image.</p>
                </td>
            </tr>
            <tr>
                <th className={'historic_captures'}><Icon type={'historic_captures'} /></th>
                <th>
                    <p>Sorted Capture</p>
                </th>
                <td>
                    <p>Capture is attached to either an: (1) historic visit for historic captures, or (2)
                    location for modern captures, but is not mastered.</p>
                </td>
            </tr>
            <tr>
                <th className={'unsorted'}><Icon type={'historic_captures'} /></th>
                <th>
                    <p>Unsorted Capture</p>
                </th>
                <td>
                    <p>Capture is <b>not</b> attached to either an: (1) historic visit for historic captures, or (2)
                        location for modern captures.</p>
                </td>
            </tr>
            <tr>
                <th className={'missing'}><Icon type={'historic_captures'} /></th>
                <th>
                    <p>Missing Images</p>
                </th>
                <td>
                    <p>Capture has zero attached capture images.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>;


    return [
        {
            label: 'Getting Started',
            data: explorerHelp,
        },
        {
            label: 'Viewer',
            data: viewerExplorerHelp,
        },
        {
            label: 'Navigator',
            data: navigatorExplorerHelp,
        },
        {
            label: 'MLP Model',
            data: modelExplorerHelp,
        },
        {
            label: 'Historic/Modern Captures',
            data: captureExplorerHelp,
        },
    ];
}

export default explorerHelp;