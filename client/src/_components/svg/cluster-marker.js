import React from 'react';

const ClusterMarker = ({n, selected}) => {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 149 178">
        <path
            fill={selected ? '#E34234' : '#008896'}
            stroke="#FFFFFF"
            strokeWidth="6"
            strokeMiterlimit="10"
            d="M126 23l-6-6A69 69 0 0 0 74 1a69 69 0 0 0-51 22A70 70 0 0 0 1 74c0 21 7 38 22 52l43 47c6 6 11 6 16 0l48-51c12-13 18-29 18-48 0-20-8-37-22-51z" />
        <circle
            fill={selected ? '#E34234' : '#008896'}
            cx="74"
            cy="75"
            r="61"
        />
        <text
            x="50%"
            y="50%"
            fill="#FFFFFF"
            fontWeight="bold"
            fontFamily="sans-serif"
            fontSize="3em"
            textAnchor="middle">
            {n}
        </text>
    </svg>
};

export default ClusterMarker;