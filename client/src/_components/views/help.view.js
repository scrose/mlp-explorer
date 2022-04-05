/*!
 * MLP.Client.Components.Common.Views.Help
 * File: help.view.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import Dialog from '../common/dialog';
import explorerHelpContent from '../content/explorer.help';
import iatHelpContent from '../content/iat.help';
import editorHelpContent from '../content/editor.help';
import Button from '../common/button';

/**
 * Tab layout for help pages.
 * - Creates tab to toggle data panels (<Tab>).
 * - Input Data Format:
 *   {[ID]: { label: <LABEL>, data: <CONTENT>}, ... }
 *
 * @public
 * @return {JSX.Element}
 */

const HelpTabs = ({
                      items = [],
                      selectedTab = 0,
                      setSelectedTab = ()=>{},
                      className = '',
                      orientation = 'vertical',
                  }) => {

    // highlight selected tab (via classname)
    const onToggle = (id) => {
        return orientation === 'vertical'
            ? id === selectedTab ? 'hclose' : 'hopen'
            : id === selectedTab ? 'hopen' : 'hclose';
    };

    // select view orientation
    const tabOrientation = orientation === 'vertical' ? 'h-menu' : 'v-menu';
    const menuOrientation = orientation === 'vertical' ? 'v-menu' : 'h-menu';

    return (
        <div className={`tab ${tabOrientation} ${className}`}>
            <ul>
                <li className={`tab-menu ${menuOrientation}`}>
                    <ul>
                        {
                            items.map((item, id) => {
                                const { label = '' } = item || {};
                                return <li key={`tab_${id}`}>
                                    <Button
                                        disabled={!item.data}
                                        className={selectedTab === id ? 'active' : ''}
                                        icon={onToggle(id)}
                                        title={`View ${label}.`}
                                        label={label}
                                        onClick={() => {
                                            setSelectedTab(id);
                                        }}
                                    />
                                </li>;
                            })
                        }
                    </ul>
                </li>
                <li className={`tab-data ${orientation}`}>
                    {
                        items.hasOwnProperty(selectedTab)
                            ? items[selectedTab].data || ''
                            : ''
                    }
                </li>
            </ul>
        </div>
    );
};

/**
 * Help info dialog component.
 *
 * @public
 */

const HelpView = ({ setToggle, section = 0, page = 0 }) => {

    const [sectionSelected, setSectionSelected] = React.useState(section);
    const [explorerPageSelected, setExplorerPageSelected] = React.useState(page);
    const [editorPageSelected, setEditorPageSelected] = React.useState(page);
    const [iatPageSelected, setIATPageSelected] = React.useState(page);

    /**
     * Navigate to help section.
     */

    const gotoPage = (section, page) => {
        setSectionSelected(section);

        const pageSelector = [
            setExplorerPageSelected,
            setEditorPageSelected,
            setIATPageSelected
        ]

        // set selected page
        if (section < pageSelector.length) {
            pageSelector[section](page);
        }
    };

    const exploreHelp = explorerHelpContent(gotoPage);
    const editorHelp = editorHelpContent(gotoPage);
    const iatHelp = iatHelpContent(gotoPage);

    // index of help sections
    const _sections = [
        {
            label: 'MLE Explorer',
            data: <HelpTabs
                orientation={'vertical'}
                items={exploreHelp}
                selectedTab={explorerPageSelected}
                setSelectedTab={setExplorerPageSelected}
                className={'help'}
            />,
        },
        {
            label: 'MLE Editor',
            data: <HelpTabs
                orientation={'vertical'}
                items={editorHelp}
                selectedTab={editorPageSelected}
                setSelectedTab={setEditorPageSelected}
                className={'help'}
            />,
        },
        {
            label: 'Image Analysis Toolkit (IAT)',
            data: <HelpTabs
                orientation={'vertical'}
                items={iatHelp}
                selectedTab={iatPageSelected}
                setSelectedTab={setIATPageSelected}
                className={'help'}
            />,
        },
    ];

    return <Dialog setToggle={setToggle} title={'Mountain Legacy Explorer User Guide'}>
        <HelpTabs
            orientation={'horizontal'}
            items={_sections}
            selectedTab={sectionSelected}
            setSelectedTab={setSectionSelected}
            className={'help'}
        />
    </Dialog>;
};

export default HelpView;
