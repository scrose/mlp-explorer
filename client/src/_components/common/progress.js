/*!
 * MLP.Client.Components.Common.Progress
 * File: progress.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import Button from './button';
import Dialog from './dialog';

/**
 * Alert dialog component.
 *
 * @param title
 * @param description
 * @param progress
 * @param messages
 * @param callback
 * @public
 */

const Progress = ({
                      title,
                      description,
                      progress,
                      messages,
                      callback=()=>{}}
                      ) => {

    const [toggle, setToggle] = React.useState(false);
    const [done, setDone] = React.useState(false);
    const _isMounted = React.useRef(true);

    const handleClose = () => {
        setToggle(null);
        callback();
    };

    // Open progress bar dialog when progress state is not empty
    React.useEffect(() => {
        _isMounted.current = true;
        setToggle(Object.keys(progress).length > 0);

        // check if progress has completed
        setDone(true);
        Object.keys(progress).map(key => {
            if (!progress[key].done) setDone(false)
        })
        return () => {
            _isMounted.current = false;
        };
    }, [progress, setToggle]);

    return toggle ?
        <Dialog title={title} setToggle={setToggle}>
            {description}
            {
                Object.keys(progress).map(key => {

                    // get progress indicator data
                    const data = progress[key];

                    // get progress status message (if available)
                    const { msg = '', type = '' } = messages[key] || {};

                    const progressBar = {
                        width: `${data.percent}%`,
                    };

                    // render progress indicator for imports
                    return (
                        <div className={`msg ${type}`} key={key}>
                            <div>{msg}</div>
                            <div className={'progress-bar'} style={progressBar}>{`${data.percent}%`}</div>
                            <div>
                                <span>{`${(data.loaded)}MB of ${(data.total)}MB`}</span>
                                {data.name ?
                                    <span>{` (File: ${data.name})`}</span> : ''
                                }
                            </div>
                        </div>
                    );
                })
            }
            {
                done
                    ? <div className={'alert-box-buttons'}>
                        <Button icon={'success'} name={'ok'} label={'Done!'} onClick={handleClose} />
                    </div>
                    : ''
            }
        </Dialog> : ''

}

export default Progress;
