import React, {Component} from 'react'

const List = (items) => {
    console.log(typeof items);
    return (
        <ul>
            {items.map((key) => {return (<li>{items[key]}</li>)})}
        </ul>
    )
}

export default List;
