/*!
 * MLP.Client.Components.Content.Help
 * File: index.help.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import Icon from '../common/icon';

/**
 * Editor "Getting Started" help page.
 *
 * @public
 */

/**
 * Index of general help content
 */

export default (setSection, setPage) => {

    /**
     * Navigate to help section.
     */

    const _gotoPage = (section, page) => {
        setSection(section);
        setPage(page);
    };

    const editorStartHelp = <>
        <h4>Getting Started</h4>
        <p>
            Accessible to <a href={'/login'}>Authenticated Users</a>, the Mountain Legacy Explorer (MLE) Editor
            can be used to manage the digital assets and metadata of the MLP collection. Through the Editor, users can
            upload or delete images in the collection data store, add and update image metadata, as well as align and
            master historic and repeat digital photographs.
        </p>

        <h5>Navigation</h5>

        <p>Editor navigation is identical to the Explorer. To edit elements on a page, use either
           the <b>editor tools</b> menu or <b>inline tool</b> menus to navigate to edit forms. </p>

        <h6>Editor Menu</h6>
        <p>
            Editor users will see the editor tools menu below the breadcrumb trail. This menu
            provides the available options for viewing, adding, editing or deleting the item loaded
            on the page. Administrators have additional options, such as image registration uploads.
        </p>

        <h6>Inline Menus</h6>
        <p>
            Inline menus appear where dependent nodes or items are displayed within a particular info page.
            These menus allow users to add, edit and delete dependent items within the page using dialog popups.
        </p>

        <h5>User Permissions</h5>
        <p>Authenticated users are assigned roles that have defined access permissions to Editor features, as shown in
            the table below. </p>
        <table className={'files'}>
            <thead>
            <tr>
                <th colSpan={11}>Permissions</th>
            </tr>
            <tr>
                <th>User Role</th>
                <th>View</th>
                <th>Download*</th>
                <th>Raw Files*</th>
                <th>Export</th>
                <th>Create</th>
                <th>Edit/Move</th>
                <th>Delete</th>
                <th>Upload</th>
                <th>Master</th>
                <th>Edit Options</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th>Visitor</th>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td>-</td>
                <td><Icon type={'success'} /></td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
            <tr>
                <th>Contributor</th>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
            </tr>
            <tr>
                <th>Editor</th>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td>-</td>
                <td>-</td>
            </tr>
            <tr>
                <th>Administrator</th>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
                <td><Icon type={'success'} /></td>
            </tr>
            </tbody>
        </table>
        <p><small>* All users have access to high-resolution versions of the images and metadata files. However, only
            authenticated users
            have access to the original image uploads.</small></p>
    </>;

    /**
     * Editor "Basic Features" help page.
     *
     * @public
     */

    const editorBasicHelp = <>
        <h4>Basic Features</h4>
        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'new'} /></th>
                <th>Add Surveyor / Project</th>
                <td>
                    <ol className={'list'}>
                        <li>
                            Click on the <b>Add New</b> dropdown menu and select
                            either <b>Add New Surveyor</b> or <b>Add New Project</b>.
                        </li>
                        <li>
                            Complete the update form and submit. If no errors occur, accept the prompt
                            confirming the update.
                        </li>
                        <li>
                            You will be redirected to the new info page for this item.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'new'} /></th>
                <th>Add Other Items</th>
                <td>
                    <ol className={'list'}>
                        <li>
                            To add new items (e.g. a new survey or historic visit), first navigate to the
                            parent node of that item. For example, to add a survey to a specific surveyor, first
                            navigate
                            to that surveyor.
                        </li>
                        <li>
                            Click the <b>Add New</b> dropdown menu button and select
                            one of the dependent nodes (e.g. 'Add New Survey').
                        </li>
                        <li>
                            Complete the update form and submit. If no errors occur, accept the prompt
                            confirming the update.
                        </li>
                        <li>
                            You will be redirected to either the parent info page or the new item info page.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'edit'} /></th>
                <th>Edit Items</th>
                <td>
                    <p>
                        To edit an item's metadata, click the <b>Edit</b> menu button,
                        complete the form and submit.
                    </p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'move'} /></th>
                <th>Move Capture</th>
                <td>
                    <p>To move a capture to a new owner, drag the <b>Move</b> menu button in the editor
                        menu to the new owner in the list navigator.</p>
                    <p>Refer to the table below for allowed owner-dependent relationships.</p>
                    <table className={'help'}>
                        <tbody>
                        <tr>
                            <th>Historic Captures</th>
                            <td>Projects, Surveys, Survey Seasons, Historic Visits</td>
                        </tr>
                        <tr>
                            <th>Modern Captures</th>
                            <td>Projects, Surveys, Survey Seasons, Stations, Modern Visits, Locations</td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <th><Icon type={'delete'} /></th>
                <th>Delete Items</th>
                <td>
                    <p>To delete an item, click the <b>Delete</b> menu button and
                        confirm the deletion. Note that deleting an item requires that all of the dependent
                        files have first been deleted.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>;

    /**
     * Editor "Capture Images" help page.
     *
     * @public
     */

    const editorImagesHelp = <>
        <h4>Handling Images</h4>

        <h5>Capture Images</h5>
        <p>A capture corresponds to the capture of a view that is unique in location, azimuth, date, and time.
            Captures contain multiple image versions, and come in two forms: historic and modern (repeat).</p>

        <p>Typically, captures are sorted into either historic visits (for historic captures) or locations (for modern
            captures). However, "unsorted" captures can also be stored at the project, survey, survey season,
            and station levels. In the list navigator, unsorted captures appear as red icons. For more information
            about historic and modern capture images, visit the
            <Button icon={'help'} label={'Concepts'} onClick={() => {
            }} /> help page.
        </p>

        <h5>Options</h5>
        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'new'} /></th>
                <th>Add Capture Images</th>
                <td>
                    <p>Use this option to add capture image(s) to a single capture. A single capture image is
                        attached with the option of additional information such as digitization details,
                        camera settings, or Library Archives Canada (LAC) metadata.</p>
                    <ol className={'list'}>
                        <li>A single file can be attached by clicking the <b>Attach File</b> button or by
                            dragging and dropping files into the drop zone. At least one file is required.
                        </li>
                        <li>To attach additional files, click the <b>Add Image Upload</b> button. To delete any
                            additional attached images, click the <b>Delete Image Upload</b> button inside the fieldset.
                        </li>
                        <li>Select an image state (required).</li>
                        <li>Enter any other metadata and submit.</li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'import'} /></th>
                <th>Import Captures</th>
                <td>
                    <p>Use this option to bulk import captures. Each attached image will generate a unique historic or
                        modern capture entry. Metadata included below will apply to each imported capture.</p>
                    <ol className={'list'}>
                        <li>Files can be attached by clicking the <b>Import Files</b> button or by
                            dragging and dropping files into the drop zone.
                        </li>
                        <li>Select an image state (required). This designation is applied to all of the attached images.
                        </li>
                        <li>Enter any other metadata and submit. This metadata is applied to all of the attached images.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'new'} /></th>
                <th>Add Supplemental Images</th>
                <td>
                    <p>
                        Supplemental images are simply images that do not represent a particular capture -- i.e.
                        historic or
                        repeat photograph. These additional images can be attached to Locations, Stations, Survey
                        Seasons,
                        Surveys and Modern Visits.
                    </p>
                    <ol className={'list'}>
                        <li>
                            Navigate to the owner item. Click the <b>Add New</b> dropdown
                            menu button and select <b>Add New Supplemental Image</b>.
                        </li>
                        <li>
                            Complete the update form and submit. An Image Type (e.g. 'Location', 'Scenic' or 'Other) is
                            required.
                            If no errors occur, accept the prompt confirming the update.
                        </li>
                        <li>
                            You will be redirected to either the parent info page or the new item info page.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'edit'} /></th>
                <th>Edit Metadata</th>
                <td>
                    <p>
                        To edit capture image metadata, click the <b>Edit</b> menu button,
                        complete the form and submit.
                    </p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'move'} /></th>
                <th>Move Images</th>
                <td>
                    <p>To move an image, drag the <b>Move</b> menu button in the editor
                        menu to the new owner in the list navigator.</p>
                    <p>Refer to the table below for allowed owner-dependent relationships.</p>
                    <table className={'help'}>
                        <thead>
                        <tr>
                            <th>File Type</th>
                            <th>Allowed Owners</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>Historic Images</td>
                            <td>Historic Captures</td>
                        </tr>
                        <tr>
                            <td>Modern Images</td>
                            <td>Modern Captures</td>
                        </tr>
                        <tr>
                            <td>Supplemental Images</td>
                            <td>Surveys, Survey Seasons, Stations, Modern Visits, Locations</td>
                        </tr>
                        <tr>
                            <td>Metadata Files</td>
                            <td>Stations, Modern Visits</td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <th><Icon type={'delete'} /></th>
                <th>Delete Items</th>
                <td>
                    <p>To delete an item, click the <b>Delete</b> menu button and confirm the deletion.</p>
                </td>
            </tr>
            </tbody>
        </table>


    </>;

    /**
     * Editor "Metadata Files" help page.
     *
     * @public
     */

    const editorMetadataHelp = <>
        <h4>Handling Metadata Files</h4>
        <p>
            The Mountain Legacy collection includes an extensive assortment of survey-related data including
            maps, diaries, and view indices that can be attached to a Survey, Survey Season, or Project item.
            Users can attached metadata files to Stations and Modern Visits. There are currently two categories of
            metadata:
        </p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'metadata'} /></th>
                <th>Field Notes</th>
                <td>Digitized records taken during modern repeat visits to the station</td>
            </tr>
            <tr>
                <th><Icon type={'metadata'} /></th>
                <th>Ancillary</th>
                <td>Miscellaneous metadata files.</td>
            </tr>
            </tbody>
        </table>

        <h5>Options</h5>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'add'} /></th>
                <th>Add Metadata Files</th>
                <td>
                    <ol className={'list'}>
                        <li>
                            For Field Notes files, navigate to a Modern Visit; for other Metadata Files, navigate to
                            either a Modern Visit or Station info page. Select the <b>Files</b> tab to view attached
                            files.
                        </li>
                        <li>
                            Click on the <Icon type={'add'} /> button from the dropdown on the right of the 'Metadata
                            Files'
                            list and select <b>Add New Metadata File</b> to attach a file.
                        </li>
                        <li>
                            Attach a file using the file loader and choose a metadata type (e.g. 'Field Notes or
                            'Ancillary')
                            and submit.
                        </li>
                    </ol>
                </td>
            </tr>
            <tr>
                <th><Icon type={'edit'} /></th>
                <th>Edit Metadata Type</th>
                <td>
                    <p>You can change the metadata type of files by clicking on the <b>Edit</b> next to the file in the
                        table.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'move'} /></th>
                <th>Move Metadata Files</th>
                <td>
                    <p>Files can be moved to new owners. Metadata files can be attached to stations and field notes
                        can be attached to modern visits.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'delete'} /></th>
                <th>Delete Metadata Files</th>
                <td>

                    <p>Click the <b>Delete</b> button to delete a file and its metadata from the collection.
                        You will be prompted to confirm the deletion.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>;

    /**
     * Editor "Metadata Files" help page.
     *
     * @public
     */

    const editorOptionsHelp = <>
        <h4>Handling Metadata Options</h4>
        <p>
            Metadata options are global parameters available for select options in dropdown lists and other enumerated data.
            Administrators can edit these settings by clicking the <Icon type={'options'} /> <b>Options</b> menu item
            from the editor tools menu. This will open the options dialog popup.
        </p>
        <p>To add a new option, click the <Icon type={'add'}/> icon, or select an option to view available editing options.
        Once you have completed updating the options, close the popup. Note that this will reload the page.</p>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'metadata'} /></th>
                <th>Field Notes</th>
                <td>Digitized records taken during modern repeat visits to the station</td>
            </tr>
            <tr>
                <th><Icon type={'metadata'} /></th>
                <th>Ancillary</th>
                <td>Miscellaneous metadata files.</td>
            </tr>
            </tbody>
        </table>

        <h5>Options</h5>

        <table className={'help'}>
            <tbody>
            <tr>
                <th><Icon type={'historic_captures'} /></th>
                <th>Camera Type</th>
                <td>
                    <p>Edit available camera makes and models.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'historic_captures'} /></th>
                <th>Lens Type</th>
                <td>
                    <p>Edit available lens makes and models.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'participant_groups'} /></th>
                <th>Participants</th>
                <td>
                    <p>Edit available group participants for modern visits.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'participant_groups'} /></th>
                <th>Group Types</th>
                <td>
                    <p>Edit available group types for modern visits.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'images'} /></th>
                <th>Image Types</th>
                <td>
                    <p>Edit available supplementary image types.</p>
                </td>
            </tr>
            <tr>
                <th><Icon type={'metadata_files'} /></th>
                <th>Metadata Types</th>
                <td>
                    <p>Edit available metadata types.</p>
                </td>
            </tr>
            </tbody>
        </table>
    </>;

    // index of editor help content
    return [
        {
            label: 'Getting Started',
            data: editorStartHelp,
        },
        {
            label: 'Basic Features',
            data: editorBasicHelp,
        },
        {
            label: 'Handling Images',
            data: editorImagesHelp,
        },
        {
            label: 'Metadata Files',
            data: editorMetadataHelp,
        },
        {
            label: 'Metadata Options',
            data: editorOptionsHelp,
        },
    ];
}
