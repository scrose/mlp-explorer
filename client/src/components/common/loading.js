import React from 'react'

const Loading = () => {
    const spinner = '/assets/img/load_spinner.gif'
    return (
        <div><img src={spinner}  alt={'Loading...'}/></div>
    )
}

export default Loading;
