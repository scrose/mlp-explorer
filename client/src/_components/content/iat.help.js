/*!
 * MLP.Client.Components.Content.Help
 * File: index.help.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Image from '../common/image';
import Icon from '../common/icon';

/**
 * IAT "Getting Started" help page.
 *
 * @public
 */

export const iatStartHelp = <>
    <h4>Getting Started</h4>
    <p>
        The Image Analysis Toolkit (IAT) is an image editor and annotator based on the
        standalone JavaScript application of the same name developed by Michael Whitney in 2016.
        Very much in development, this second generation IAT does not yet include all of the
        original IAT features, though the long-term aim is for full integration of the application in Explorer.
    </p>
        <ul className={'list'}>
            <li><b>Basic Features:</b> Image resizing, cropping and translation. Files can be saved.</li>
            <li><b>Comparative visualization:</b> Images can be viewed side-by-side and overlaid.</li>
            <li><b>Image Alignment:</b> Images can be aligned using user-selected control points.</li>
            <li><b>Image Registration:</b> Authenticated users can register aligned (mastered) images
                in the MLP collection.
            </li>
            <li><b>Proposed Features:</b> Advanced markup, mask overlays, image classification and segmentation.</li>
        </ul>
    <h5>Setup</h5>
    <p>
        The IAT consists of two image panels, each of which can display a single image on its view canvas.
        To load an image into a panel:
    </p>
        <ul>
            <li>
                <b>Local Filesystem:</b>
                <ol className={'list'}>
                    <li>Select the Load <Icon type={'load'} /> control to open the file selector.</li>
                </ol>
            </li>
        </ul>



    <p>
    </p>
</>;


/**
 * IAT "Basic Features" help page.
 *
 * @public
 */

export const iatBackgroundHelp = <>
    <h5>About the IAT</h5>
    <p>
        <em>Excerpt: <a
        href={'https://bioone.org/journals/mountain-research-and-development/volume-36/issue-4/MRD-JOURNAL-D-16-00038.1/Exploring-Landscape-Change-in-Mountain-Environments-With-the-Mountain-Legacy/10.1659/MRD-JOURNAL-D-16-00038.1.full'}>
        Exploring Landscape Change in Mountain Environments With the Mountain Legacy Online Image Analysis Toolkit
        (November, 2016)
        </a>
        </em>
    </p>
        <p>In designing the IAT, MLP researchers worked with 4 central aims:</p>
            <ul className={'list'}>
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
                    other
                    in a manner similar to the Klett et al (2004) time-reveal window.
                </li>
                <li>
                    Classification and interpretation—allow practitioners to apply their own expertise when exploring
                    the images. Practitioners should be able to classify and quantify, change, annotate, mark up, and
                    visualize images as required for their various lines of inquiry.
                </li>
            </ul>

        <p>
            Although some IAT components can be used on individual images, the toolkit is designed to display 2 or
            more images and afford practitioners different methods of visualizing, annotating, and quantitatively
            describing changes (and similarities) between the photographs. Although there is software available to
            georeference oblique images (see for example Stockdale et al 2015), the focus of this IAT version is
            the photographs themselves—all quantitative descriptions and visualizations are relative to the images,
            not to a digital elevation model or map. IAT was developed with the MLP in mind, but its use is not
            restricted to the Canadian mountain west. It is lightweight (approximately 45 KB), uses ubiquitous
            technology, has minimal dependency on other software, and is a single file that can readily be downloaded
            and used with any imagery and by practitioners not affiliated with the MLP.

        </p>
    </>

    /**
    * IAT "Basic Features" help page.
    *
    * @public
    */

    export const iatBasicHelp = <>

    <h4>Basic Features</h4>
    <p>
        Start using the following basic features for image visualizations and pixel manipulations.
    </p>

    <h5>Image Translation</h5>
    <p>
        Loaded images can be moved when in the <Icon type={'select'} label={'Select'} /> mode.
    </p>

    <h5>Resizing Images</h5>
    <p>
        TBA
    </p>

    <h5>Cropping Images</h5>
    <p>
        TBA
    </p>

</>;

    /**
    * IAT "Image Alignment" help page.
    *
    * @public
    */

    export const alignmentIATHelp = <>

    <h4>Image Alignment</h4>
    <p>
        Start using the following basic features for image visualizations and pixel manipulations.
    </p>

    <h5>Image Translation</h5>
    <p>
        TBA
    </p>

    <h5>Resizing Images</h5>
    <p>
        TBA
    </p>

    <h5>Cropping Images</h5>
    <p>
        TBA
    </p>

</>;

    /**
    * IAT "Image Registration" help page.
    *
    * @public
    */

    export const iatRegistrationHelp = <>

    <h4>Concepts</h4>
    <p>
        The following is not meant to be a full scale overview of the MLP, but rather just enough to get you up to
        speed and starting using the application.
    </p>

    <h5>What is Repeat Photography?</h5>
    <p>
        It’s as simple as it sounds. You start with one photo, which was taken at a specific location in a
        specific direction (azimuth), at a specific time. You repeat this photo when you find that same location,
        point the camera in the same direction, and press the shutter release of your camera. The big difference
        between the two photos is temporal. Pretty straight forward.

        Repeat photographs leverage the systematic nature of the original work, allowing researchers to re-photograph
        the same continuous coverage of the landscape captured by the historic images. Taken together, the historic
        photo and the modern repeat form an image pair. Through careful interpretation and analysis, MLP image
        pairs can be used to explore the dynamics and interplay of ecological, climate, and human-induced
        changes in the landscape. Digital assets include multiple versions of historical digitized images
        (e.g., unprocessed scan; cropped master), repeat images (RAW, TIFF and various field-useable images), location
        images, EXIF camera data, survey and MLP field notes and maps.
    </p>

    <h5>Historic and Modern Captures</h5>
    <p>
        The core artifact of the MLP collection is the Capture, which corresponds to the capture of a view
        that is unique in location, azimuth, date, and time. For example, if I have a tripod setup, with the
        camera pointed in a specific direction, take one photo at f/16, 1/50 sec, then take another photo
        with a different exposure setting, while these two photos look mostly the same, they are different
        captures because they were taken at different times.
    </p>
    <p>The collection has two forms of Captures:</p>
    <ol>
        <li><b>Historic Capture</b> A historic capture may be associated with information related to
            where its glass plate negative is located.
        </li>
        <li><b>Modern (Repeat) Capture</b> The exposure settings of a capture are generally known.</li>
    </ol>

    <h5>Capture Images</h5>
    <p>
        A capture is typically not represented by a single image file, but can be represented by many versions
        of the same image. These versions are called capture images, which have a special property called the
        image state, which distinguishes the different versions.</p>
    <p>
        For example, if a photo is taken and someone writes down the date, time, and location of the photo,
        a capture is created. If you delete the image file associated with that capture, the capture still
        technically exists. This case is rare. What’s more common is that an image file, that is associated
        with a capture, is modified several times in the MLP workflow. Specifically, a capture is initially
        represented by a raw file (when the Hasselblad is used create the capture, this would be a 3FR file).
        The raw file would be converted into a tiff file. The tiff file would then be registered (aligned/overlaid)
        with the historic image, a process that generally involves cropping and slightly rotating the image.
    </p>
    <p>
        To recap, a capture can have zero to many capture images. Each capture image has both an image file
        and an image state, where the state distinguishes the versions of the image. All the capture images
        for a specific capture are derived (indirectly or directly) from the same image file (usually a raw file).
    </p>

    <Image url={''}
           label={'Figure 1. The relationship between a capture and its capture images shown pictorially. The capture represents the photo taken at a specific time, while the capture images are instances of that same photo, differentiated by image states,image modifications, and file types.'} />

    <h5>Metadata Schema</h5>
    <p>
        The MLP Library consists of thousands of captures and historic captures, and tens of thousands of associated
        images, thus, we need an easy way to organize these data elements. We take a hierarchical approach to data
        organization. An example of this hierarchy can be seen in Figure 2. The levels of the main hierarchy are,
        from top to bottom, surveyors, surveys, survey seasons, stations, visits, and locations. A small minority
        of the captures taken by MLP do not neatly fit into the surveyor model. In these cases, we group stations
        according to projects.
    </p>

    <Image
        label={'Figure 2. The data object hierarchy. Example nodes are shown in the tree, while hierarchy levels are defined to the left.'}
        url={''} />

    <h5>Project</h5>
    <p>
        A project is a container for stations that do not fit into the surveyor model listed below. An example of a
        project would be the Alberta Fire Lookout Towers. Each lookout tower contains a set of historic photographs from
        that tower. At the request of SRD, we repeated these photographs. However, these historic photographs weren’t
        taken under the context of a survey. Thus, a project is better suited for these types of stations.
    </p>
    <h5>Surveyor</h5>
    <p>The principal surveyor of a historic survey.</p>

    <h5>Survey</h5>
    <p>A specific survey completed under a surveyor. A survey covers a large geographical region, and may span several
        years. Surveys by different surveyors may overlap in the regions they covered.</p>

    <h5>Survey Season</h5>
    <p>A survey season is a container for all the stations completed in a certain year for a specific survey.</p>

    <h5>Station</h5>
    <p>The concept of a station has its roots in the historic surveys. A surveyor would identify a high point in the
        landscape where photographs were required to be taken. Upon arrival to that location, several photographs would
        be taken, usually in as many directions as possible. In many circumstances, the camera would have to be moved
        around in order gain the best vantage point for a particular cardinal direction. Thus, there were many sub
        locations within the general location of the station. Therefore, a station can be loosely defined as a broad
        geographic location where the distance between sub locations is within a reasonable walking distance. This is
        intentionally loosely defined, since the distinction between station and location (see below) seemed to have
        differed between different surveyors (MLP always groups the images into stations defined by the surveyor, if
        known)</p>

    <h5>Historic Visit</h5>
    <p>A historic visit refers to the first visit to a station by a particular surveyor. It can be thought of as a
        container for historic captures. A station can have only one historic visit.</p>

    <h5>Visit</h5>
    <p>A visit refers to a visit to the station with the specific purpose of repeating the historic captures from the
        historic visit. A visit is uniquely identified by the date at which it occurred. Multiple visits may occur for
        each station. The visit object is a container for all information related to that specific visit, such as field
        note data, captures, location images, and locations.</p>

    <h5>Location</h5>
    <p>Where a station is a somewhat broad geographical location, a location (as an object in MEAT) is a sub location of
        the station. It is a specific place where a capture was taken. </p>

    <h5>Other Files Stored in MEAT</h5>
    <p>The first class citizens of MEAT are the captures/historic captures and their associated capture images (the
        image files associated with the captures), but that’s not the only files that are stored. </p>

    <h5>Location Images</h5>
    <p>As part of a visit, location images are used to create a visual record of where the captures were taken. A
        location image object is associated with an image file. It differs from a capture image in that it does not
        contain an image state.</p>

    <h5>Scenic Images</h5>
    <p>A scenic image is an image that was taken during a repeat field season, but not necessarily associated with
        repeat photography or the visit records. Currently, the inclusion of scenic images at the user interface level
        is not supported (though it is at the database layer).</p>

    <h5>Field Note Files</h5>
    <p>Field notes from each visit have been written in a field note book or field note form, then digitized using a
        scanner. While these field notes will be transcribed and stored in the database via the visit object, the
        scanned copies are kept for historical reference. Field note files should be stored within a visit.</p>

    <h5>Metadata </h5>
    <h5>Managed Metadata Files</h5>
    <p>Various types of metadata files can be associated with stations and visits. This encompasses any files that don't
        neatly fit into the field note, location photo, or capture image categories.</p>
    <h5>Unmanaged Metadata Folders</h5>
    <p>In addition to historic photos and their repeats, the MLP has also accummulated significant portions of survey
        related data such as maps, diaries, and view indices. This data was sorted in a Metadata folder associated with
        a survey or survey season. The content of this folder varied (both in strucute and content) from survey to
        survey. In order to deal with this variety gracefully, we use unmanaged metadata folders. An unmanaged metadata
        folder is a folder named "Metadata" that resides under a survey, survey season, or project folder in the MLP
        Library. It is 'unmanaged' because the content of the folder is not managed by the application (it is not
        tracked by the database). To access this folder for a specific survey, survey season, or project, use MEAT to
        navigate to the object and click the 'Browse Metadata Folder' in the data pane sub menu. This will launch
        Finder, where you'll be able to navigate the folder, as well as add, edit, and delete content. REMEMBER: with
        the exception of these Metadata folders, never modify content in the MLP Library file structure.</p>


    <h5>Application Layout</h5>

    <p>The main layout of the application is divided up into a navigation pane on the left hand side and a data pane on
        the right hand side.</p>

    <Image
        url={''}
        label={'Figure 3. An overview of the typical application layout that you\'ll see when using the MEAT application'}
    />


    <h5>Navigation Pane</h5>

    <p>The Navigation Pane contains a navigation tree. Each folder level corresponds to a hierarchy level shown in
        Figure 3. Captures and historic captures are also shown in the navigation tree. The name used to reference a
        capture or historic capture in the navigation tree uses the field note photo reference field of the capture /
        historic capture. When the field note photo reference field is empty, the name of one of its captures images is
        used. </p>

    <p>When you click on an element in the navigation tree, the data pane will be loaded with information related to
        that specific object. </p>

    <h5>Data Pane</h5>

    <p>The Data Pane contains object data, which differs depending on the object being viewed. Common elements of the
        data pane is the menu bar and the bread crumb trail.</p>

    <h5>Features</h5>

    <h5>Adding an Object</h5>

    <p>Adding an object is done by first visiting the hierarchical parent of the object to be created, clicking the “Add
        [Child Obj ect]” link in the menu bar, filling out the form presented in the data pane, and pressing the
        "Submit" button. As an example, to create a survey season under the Wheeler Canadian Irrigation survey, you
        would first navigate to the Canadian Irrigation survey in the navigation tree, click the “Add Survey Season”
        link in the menu bar, fill out the year, and press “Submit”. If you did not fill out a required field or filled
        a field incorrectly, then you will be returned to the form to fix the error. </p>

    <p>Projects and surveyors do not have parent objects, and therefore created in a different workflow. [Currently not
        implement] At the top of the navigation pane are two link “Add Project” and “Add Surveyor”. Click either of
        these and proceed with the instructions previously described. </p>

    <h5>Optional Workflow</h5>
    <p>The visit and historic visit forms a created so that you can add multiple objects all in one form. Specifically,
        when you create a visit, you can create multiple locations for that visit, and for each location, you can create
        multiple captures. Correspondingly, when you create a historic visit you may also create multiple historic
        captures. These separate levels of object creation are represented by nested boxed areas within the visit
        form. </p>

    <p>To add another location to the visit form, navigate to the bottom of the form and click the “Add Location” link.
        To remove a location from the form, navigate to the top right hand corner of the nested box that holds the
        location fields and click the “Remove Location” link. </p>

    <p>Captures and historic captures, in their respective forms, can be added and removed in a similar manner.</p>

    <h5>Adding File Related Objects (Capture Images, Metadata Files, Location Images and Field Note Files)</h5>

    <p><strong>Capture Images</strong> can be added in the capture or historic capture forms by clicking the “Choose
        File” button, selecting a single file, choosing an image state, and optionally making the image available
        remotely. </p>
    <p><strong>Field Note Files</strong> can be added in the visit form by clicking the “Choose Files” button near the
        “Field Note Files” label and selecting one or more files.</p>
    <p><strong>Metadata Files</strong> can be added in the project, survey, survey season, station, and visits forms by
        clicking the “Choose Files” button near the “Metadata Files” label and selecting one or more files.</p>
    <p><strong>Location Images</strong> can be added in the location form by clicking the "Choose Files” button near the
        “Location Photos” label, selecting one or more file and optionally checking the “Make Remote” checkbox.</p>

    <h5>Editing Objects</h5>

    <p>An object can be edited by first navigating to the object so that it is shown in the data pane, clicking the
        “Edit” link in the menu, editing the desired fields in the form presented, and pressing the “Submit” button at
        the bottom of the form.</p>

    <h5>Deleting Objects</h5>

    <p>An object can be deleted by first navigating to the object so that it is shown in the data pane, clicking the
        “Delete” link, and accepting the prompt asking whether you would like to delete the object. Note that when you
        delete an object, you will delete any objects and files underneath it in the hierarchy, so be careful!!!</p>

    <h5>Administration Features</h5>

    <p>The administration features have been created to allow the user to manage the data in a reasonably flexible
        manner. By flexibility, I mean allowing data to be stored in less than ideal locations. To understand this,
        let’s start with what’s an ideal location for a specific data object.</p>

    <p>Ideally, the data objects discussed previously would be structured as follows. Given that a station has been
        repeated, it would contain an historic visit and one more more visits. The historic visit would contain one or
        more historic captures and each of those historic captures would contain 4 capture images: one for each of the
        raw, interim, master, and possibly gridded image states. The visits would each contain field notes information,
        one or more locations, and each location would contain location images and captures, and each capture would
        contain 3 capture images: one for each of the raw, interim, and master states.</p>

    <p>Of course, the ideal is not real. The MEAT application is inheriting a very large file system data tree that was,
        at best, semi structured. Furthermore, the type of record keeping (field notes) has varied over the years, so
        consistency is also a problem. Finally, we are still transcribing field notes, which contain data that simply
        could not be extracted from the the file system structure (i.e. you can’t sort captures in to locations without
        having the field notes transcribed). Therefore, the ideal circumstances aren’t always available. </p>

    <p>The administration features give the user the ability to sort data that may not have been imported at the ideal
        level of granularity (i.e. at the station level rather than the location level).</p>

    <h5>Unsorted Data</h5>

    <p>Captures stored at the project, survey, survey season, and station levels are shown in an “Unsorted Captures”
        folder underneath their respective parent object in the navigation tree. An unsorted capture may also appear
        directly underneath its visit. Historic captures at the project, survey, and survey season levels are shown in
        an “Unsorted Historic Captures” folder underneath their respective parent object in the navigation tree.</p>

    <h5>Moving Captures and Historic Captures</h5>

    <p>Moving captures and historic captures is simple. In the navigation tree, locate the capture or historic capture
        you would like to move and drag it to a destination object in the navigation tree. Captures may not be stored in
        historic visits, while historic captures may not be stored in visits or locations. While captures and historic
        captures are viewable in the data pane, they cannot be moved <em>from</em> the data pane (as opposed to location
        images and field notes). Multiple captures / historic captures may be moved at once if the select key is pressed
        while selecting the nodes in the navigation tree.</p>

    <h5>Moving Capture Images, Location Images and Metadata Files</h5>

    <p>Capture images, location photos and metadata files are viewed through parent object pages. When listed in these
        pages, an icon with 4 directional arrows appears to the left of each listed file, indicating that these objects
        are moveable. The user can move a file by dragging the drag icon to a new parent in the navigation tree. Capture
        images are restricted to captures and historic captures. Location photos are restricted to locations, visits,
        and stations. Metadata files can be moved to any level of the of the navigation tree with the exception of
        locations, captures, and historic captures. </p>

    <h5>Merging Captures and Historic Captures</h5>

    <p>This feature is especially useful in dealing with capture images that weren’t grouped together in the same
        capture or historic capture upon import. In the case of the captures, you may see more than one capture based
        off the same photo; e.g. one containing a capture image in the raw image state while another containing capture
        images in the master and interim states. These two captures should be one. To merge the two captures, select one
        capture so that it is shown in the data pane. Next, drag the other capture that you would like to merge from the
        navigation tree to the data pane. You will be prompted to confirm the merge action. Once confirmed, the two
        captures should be merged. </p>

    <p>It should be noted that two captures cannot be merged if they contain conflicting data fields. This is usually
        the case when they contain different photos, or both have the field note photo reference fields populated. In
        these cases, you do not want to merge the captures, as they are most likely different.</p>

    <p>If you find that you can’t merge two captures that should be merged, simply move the capture images from one
        capture to another and update another other related fields. After this process, you should be able to delete one
        of the captures, as it should no longer contain capture images. </p>


</>;;