/*!
 * MLP.Client.Components.Content.Help
 * File: index.help.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from '../common/button';
import Badge from '../common/badge';

/**
 * Editor "Getting Started" help page.
 *
 * @public
 */

export const editorStartHelp = <>
    <h4>Getting Started</h4>
    <p>
        Accessible to <a href={'/login'}>authenticated users</a>, the Mountain Legacy Explorer (MLE) Editor
        can be used to manage the digital assets and metadata of the MLP collection. Through the Editor, users can
        upload and manage images in the collection data store, add and update image metadata, as well as align and master
        historic and repeat digital photographs.
    </p>
    <h5>User Permissions</h5>
    <p>
        TBA
    </p>
    <h5>Editor Menu</h5>
    <p>
        Authenticated users will see the main editor menu below the breadcrumb trail. This menu
        provides the available options for viewing, adding, editing or deleting the item loaded
        on the page. Administrators have additional options, such as image registration uploads.
    </p>
    <h5>Inline Menus</h5>
    <p>
        Inline menus appear where dependent nodes or items are displayed within a particular info page.
        These menus allow users to add, edit and delete dependent items within the page using dialog popups.
    </p>
</>

/**
 * Editor "Basic Features" help page.
 *
 * @public
 */

export const editorBasicHelp = <>
    <h4>Basic Features</h4>
    <h5>Add/Edit Surveyor or Project</h5>
    <p>
        <ol>
            <li>
                Click on the <Badge icon={'add'} label={"Add New"} /> dropdown menu and select
                either <Badge icon={'add'} label={"Add New Surveyor"} /> or
                <Badge icon={'add'} label={"Add New Project"} />.
            </li>
            <li>
                Complete the update form and submit. If no errors occur, accept the prompt
                confirming the update.
            </li>
            <li>
                You will be redirected to the new info page for this item. To edit the metadata,
                click the <Badge icon={'edit'} label={"Edit"} /> menu button. To delete it,
                click the <Badge icon={'delete'} label={"Delete"} /> menu button.
            </li>
        </ol>
    </p>
    <h5>Add/Edit Other Items</h5>
    <p>
        <ol>
            <li>
                To add new items (e.g. a new survey or historic visit), first navigate to the
                parent node of that item. For example, to add a survey to a specific surveyor, first navigate
                to that surveyor.
            </li>
            <li>
                Click the <Badge icon={'add'} label={"Add New"} /> dropdown menu button and select
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
    </p>
</>

/**
 * Editor "Capture Images" help page.
 *
 * @public
 */

export const editorImagesHelp = <>
    <h4>Handling Images</h4>
    <h5>Capture Images</h5>
    <p>
        Captures come in two forms: (1) <b>Historic Captures</b> contain multiple historic survey images and are typically added under
        Historic Visits; and (2) <b>Modern Captures</b> contain multiple modern repeat images and are typically added under
        Modern Visits. Capture images that do not have a known Historic or Modern Visit can be attached to other nodes as
        'unsorted' captures. For more information about historic and modern capture images, visit the
        <Button icon={'help'} label={'Concepts'} onClick={() =>{}} /> help pages.
    </p>
    <h5>Add/Edit Capture Image(s)</h5>
    <p>
        <ol>
            <li>Using the editor menu or an inline menu, select either:
                <ul>
                    <li>
                        <Badge icon={'add'} label={'Add New Historic/Modern Capture'} /> to add images to a single capture.
                        A single capture image is attached with the option of additional information such as
                        digitization details, camera settings, or Library Archives Canada (LAC) metadata.
                    </li>
                    <li>
                        <Badge icon={'import'} label={'Import Historic/Modern Captures'} /> to bulk import captures.
                        Each attached image will generate a unique historic or modern capture entry. Metadata
                        included below will apply to each imported capture.
                    </li>
                </ul>
            </li>
            <li>
                Complete the form and confirm the update. You will then be redirected to the new info page for this item.
            </li>
            <li>
                To edit capture metadata, click the <Badge icon={'edit'} label={"Edit"} /> menu button in the
                editor or inline menu.
            </li>
            <li>
                To delete a capture, click the <Badge icon={'delete'} label={"Delete"} /> menu button in the
                editor or inline menu. Note that individual files must first be deleted to delete a capture record.
            </li>
        </ol>
    </p>
    <p>
        <ol>
            <li>
                Click on the <Badge icon={'add'} label={"Add New"} /> dropdown menu and select
                either <Badge icon={'add'} label={"Add New Surveyor"} /> or
                <Badge icon={'add'} label={"Add New Project"} />.
            </li>
            <li>
                Complete the update form and submit. If no errors occur, accept the prompt
                confirming the update.
            </li>
            <li>
                You will be redirected to the new info page for this item. To edit the metadata,
                click the <Badge icon={'edit'} label={"Edit"} /> menu button. To delete it,
                click the <Badge icon={'delete'} label={"Delete"} /> menu button.
            </li>
        </ol>
    </p>
    <h5>Supplemental Images</h5>
    <p>
        Supplemental images are simply images that do not represent a particular capture -- i.e. historic or
        repeat photograph. These additional images can be attached to Locations, Stations, Survey Seasons,
        Surveys and Modern Visits.
    </p>
    <p>
        To add a supplemental image:
        <ol>
            <li>
                First navigate to the parent item and click the <Badge icon={'add'} label={"Add New"} /> dropdown
                menu button and select 'Add New Supplemental Image'.
            </li>
            <li>
                Complete the update form and submit. An Image Type (e.g. 'Location', 'Scenic' or 'Other) is required.
                If no errors occur, accept the prompt confirming the update.
            </li>
            <li>
                You will be redirected to either the parent info page or the new item info page.
            </li>
        </ol>
    </p>
</>

/**
 * Editor "Metadata Files" help page.
 *
 * @public
 */

export const editorMetadataHelp = <>
    <h4>Handling Metadata Files</h4>
    <p>
        The Mountain Legacy collection includes an extensive assortment of survey-related data including
        maps, diaries, and view indices that can be attached to a Survey, Survey Season, or Project item.
    </p>
    <p>
        Users can attached metadata files to Stations and Modern Visits. There are currently two categories of
        metadata: (1) <b>Field Notes</b>: These files correspond to repeat visits to the station; and
        (2) <b>Ancillary</b>: These correspond to miscellaneous metadata files.
    </p>

    <h5>Add/Edit Metadata Files</h5>
    <p>
        <ol>
            <li>
                For Field Notes files, navigate to a Modern Visit; for other Metadata Files, navigate to
                either a Modern Visit or Station info page. Select the 'Files' tab to view attached files.
            </li>
            <li>
                Click on the <Badge icon={'add'} /> item from the dropdown on the right of the 'Metadata Files'
                list and select <Badge icon={'add'} label={"Add New Metadata File"} /> to attach a file.
            </li>
            <li>
                Attach a file using the file loader and choose a metadata type (e.g. 'Field Notes or 'Ancillary').
                Click 'Add' and then 'Done' to complete the upload.
            </li>
            <li>
                You can change the metadata type of files by clicking on the <Badge icon={'edit'} label={"Edit"} />
                next to the file in the table.
            </li>
        </ol>
    </p>
    <h5>Delete a Metadata File</h5>
    <p>
        <ol>
            <li>
                Click the <Badge icon={'delete'} label={'Delete'} /> button to delete a file and its
                metadata from the collection. You will be prompted to confirm the deletion.
            </li>
        </ol>
    </p>
</>
