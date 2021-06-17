/*!
 * MLP.Client.Components.Common.Progress
 * File: progress.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Dialog from './dialog';
import { UserMessage } from './message';
import Badge from './badge';

/**
 * Alert dialog component.
 *
 * @param title
 * @param description
 * @param progress
 * @param xhr
 * @param messages
 * @param setMessages
 * @param hasUploads
 * @param error
 * @param callback
 * @public
 */

const Progress = ({
                      title,
                      description,
                      progress = {},
                      xhr,
                      messages,
                      setMessages,
                      hasUploads = false,
                      error = false,
                      callback = () => {
                      },
                  }) => {

    const [toggle, setToggle] = React.useState(false);
    const [done, setDone] = React.useState(false);
    const _isMounted = React.useRef(true);

    // Open progress bar dialog when progress state is not empty
    React.useEffect(() => {
        _isMounted.current = true;
        setToggle(Object.keys(progress).length > 0);

        // check if progress has completed
        setDone(true);
        Object.keys(progress).forEach(key => {
            if (!progress[key].done) setDone(false);
        });
        return () => {
            _isMounted.current = false;
        };
    }, [progress, setToggle]);

    return toggle &&
        <Dialog title={title} setToggle={setToggle}>
            <Badge label={description} />
            {
                Object.keys(progress).map(key => {

                    // get progress indicator data
                    const data = progress[key];
                    const progressBar = {
                        width: `${data.percent}%`,
                    };

                    // render progress indicator for imports
                    return (
                        <div key={`${key}_msg_progress`}>
                            <UserMessage
                                onClose={() => {
                                    setMessages({});
                                }}
                                closeable={true}
                                message={messages[key]}
                            />
                            {
                                // show progress bar if import has file uploads and no errors
                                hasUploads && !error &&
                                (
                                    <>
                                        <div className={'progress-bar'} style={progressBar}>
                                            <span>{`${data.percent}%`}</span>
                                        </div>
                                        <div className={'h-menu'}>
                                            <ul>
                                                <li>
                                                    <Button
                                                        icon={'cancel'}
                                                        name={'cancel'}
                                                        label={'Cancel'}
                                                        onClick={
                                                        () => {
                                                            if (xhr.hasOwnProperty(key)) xhr[key].abort();
                                                            setMessages(data => (
                                                                {
                                                                    ...data,
                                                                    [key]: { msg: 'Upload Stopped!', type: 'warning' },
                                                                }),
                                                            );
                                                        }} />
                                                </li>
                                                <li><Badge
                                                    title={'Upload progress.'}
                                                    icon={'upload'}
                                                    label={`${(data.loaded)}MB of ${(data.total)}MB 
                                                    [File(s): ${data.name ? data.name : 'Multiple'}]`}
                                                    />
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                )
                            }
                        </div>
                    );
                })
            }
            {
                done && <div className={'alert-box-buttons'}>
                    <Button icon={'success'} name={'ok'} label={'Done!'} onClick={
                        () => {
                            callback();
                            setToggle(false);
                        }} />
                </div>
            }
        </Dialog>;
};

export default Progress;
