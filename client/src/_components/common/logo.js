/*!
 * MLP.Client.Components.Common.Logo
 * File: logo.js
 * Copyright(c) 2022 Runtime Software Development Inc.
 * Version 2.0
 * MIT Licensed
 */

import React from 'react';
import { getRoot } from '../../_utils/paths.utils.client';
import {getInfo} from "../../_services/schema.services.client";

export const MLPWordmark = ({colour='white'}) => {
    return (
        <svg viewBox="0 0 103.219 34.891" width="103.219" height="34.891" xmlns="http://www.w3.org/2000/svg">
            <g fill={ colour }><path d="M 5.923 21.803 L 11.503 21.803 C 12.07 21.803 12.46 21.746 12.673 21.633 L 12.733 21.653 L 12.593 25.083 L 2.353 25.083 L 2.353 6.803 C 2.6 6.823 2.873 6.836 3.173 6.843 L 4.133 6.873 C 4.773 6.893 5.466 6.903 6.213 6.903 C 8.3 6.903 10.363 6.866 12.403 6.793 C 12.303 7.593 12.253 8.663 12.253 10.003 C 12.253 10.15 12.263 10.26 12.283 10.333 L 12.253 10.373 C 11.78 10.233 11.106 10.163 10.233 10.163 L 5.923 10.163 L 5.923 13.653 L 9.163 13.653 C 10.163 13.653 10.763 13.626 10.963 13.573 L 11.013 16.953 C 10.573 16.906 10.006 16.883 9.313 16.883 L 5.923 16.883 L 5.923 21.803 ZM 14.168 25.083 L 19.138 17.793 L 14.298 10.793 L 18.578 10.793 L 21.108 15.153 L 23.848 10.793 L 27.818 10.793 C 27.811 10.793 27.711 10.926 27.518 11.193 L 23.068 17.553 L 28.128 25.083 L 23.888 25.083 L 21.148 20.453 L 18.448 25.083 L 14.168 25.083 ZM 33.681 24.793 L 33.681 28.813 C 33.681 29.6 33.701 30.11 33.741 30.343 L 30.331 30.343 L 30.331 10.793 L 33.681 10.793 L 33.681 11.683 C 34.788 10.91 35.848 10.523 36.861 10.523 C 37.868 10.523 38.765 10.663 39.551 10.943 C 40.338 11.23 41.025 11.67 41.611 12.263 C 42.918 13.543 43.571 15.373 43.571 17.753 C 43.571 19.333 43.201 20.743 42.461 21.983 C 41.835 23.03 40.965 23.866 39.851 24.493 C 38.865 25.053 37.798 25.333 36.651 25.333 C 35.505 25.333 34.515 25.153 33.681 24.793 Z M 33.681 14.763 L 33.681 21.353 C 34.375 21.933 35.275 22.223 36.381 22.223 C 38.181 22.223 39.348 21.353 39.881 19.613 C 40.061 19.02 40.151 18.383 40.151 17.703 C 40.151 17.03 40.088 16.49 39.961 16.083 C 39.835 15.676 39.668 15.323 39.461 15.023 C 39.255 14.73 39.025 14.486 38.771 14.293 C 38.518 14.093 38.258 13.933 37.991 13.813 C 37.525 13.606 37.048 13.503 36.561 13.503 C 36.068 13.503 35.555 13.616 35.021 13.843 C 34.495 14.07 34.048 14.376 33.681 14.763 ZM 49.609 4.713 L 49.609 23.553 C 49.609 24.333 49.629 24.843 49.669 25.083 L 46.189 25.083 L 46.189 4.713 L 49.609 4.713 ZM 52.412 18.013 C 52.412 17.013 52.582 16.053 52.922 15.133 C 53.268 14.22 53.758 13.42 54.392 12.733 C 55.785 11.26 57.595 10.523 59.822 10.523 C 62.035 10.523 63.795 11.22 65.102 12.613 C 66.348 13.946 66.972 15.673 66.972 17.793 C 66.972 19.92 66.328 21.68 65.042 23.073 C 63.688 24.553 61.888 25.293 59.642 25.293 C 57.328 25.293 55.515 24.566 54.202 23.113 C 53.008 21.793 52.412 20.093 52.412 18.013 Z M 55.732 17.933 C 55.732 18.506 55.828 19.063 56.022 19.603 C 56.215 20.136 56.488 20.596 56.842 20.983 C 57.602 21.81 58.595 22.223 59.822 22.223 C 60.962 22.223 61.858 21.82 62.512 21.013 C 63.152 20.226 63.472 19.203 63.472 17.943 C 63.472 16.67 63.145 15.64 62.492 14.853 C 61.785 14.02 60.822 13.603 59.602 13.603 C 58.362 13.603 57.392 14.05 56.692 14.943 C 56.052 15.763 55.732 16.76 55.732 17.933 ZM 73.044 15.133 L 73.044 23.553 C 73.044 24.333 73.061 24.843 73.094 25.083 L 69.694 25.083 L 69.694 10.793 L 73.044 10.793 L 73.044 11.853 C 73.817 10.966 74.631 10.523 75.484 10.523 C 76.337 10.523 77.007 10.626 77.494 10.833 L 77.254 14.513 L 77.194 14.553 C 76.874 13.986 76.214 13.703 75.214 13.703 C 74.834 13.703 74.444 13.833 74.044 14.093 C 73.651 14.353 73.317 14.7 73.044 15.133 ZM 78.484 18.053 C 78.484 16.986 78.664 16 79.024 15.093 C 79.391 14.18 79.907 13.38 80.574 12.693 C 81.994 11.246 83.854 10.523 86.154 10.523 C 88.094 10.523 89.651 11.166 90.824 12.453 C 91.984 13.693 92.564 15.25 92.564 17.123 C 92.564 17.843 92.507 18.336 92.394 18.603 C 91.487 18.856 89.634 18.983 86.834 18.983 L 82.024 18.983 C 82.257 19.963 82.807 20.723 83.674 21.263 C 84.541 21.803 85.667 22.073 87.054 22.073 C 88.501 22.073 89.744 21.813 90.784 21.293 C 91.057 21.16 91.264 21.033 91.404 20.913 C 91.384 21.293 91.361 21.686 91.334 22.093 L 91.184 24.223 C 90.491 24.696 89.367 25.023 87.814 25.203 C 87.361 25.263 86.924 25.293 86.504 25.293 C 84.191 25.293 82.277 24.616 80.764 23.263 C 79.244 21.903 78.484 20.166 78.484 18.053 Z M 88.924 16.333 C 88.551 14.373 87.484 13.393 85.724 13.393 C 84.337 13.393 83.284 13.99 82.564 15.183 C 82.351 15.55 82.184 15.95 82.064 16.383 C 82.284 16.396 82.551 16.406 82.864 16.413 L 83.884 16.413 C 84.217 16.426 84.541 16.433 84.854 16.433 L 85.634 16.433 C 86.094 16.433 86.547 16.426 86.994 16.413 L 88.114 16.373 C 88.421 16.366 88.691 16.353 88.924 16.333 ZM 98.757 15.133 L 98.757 23.553 C 98.757 24.333 98.773 24.843 98.807 25.083 L 95.407 25.083 L 95.407 10.793 L 98.757 10.793 L 98.757 11.853 C 99.53 10.966 100.343 10.523 101.197 10.523 C 102.05 10.523 102.72 10.626 103.207 10.833 L 102.967 14.513 L 102.907 14.553 C 102.587 13.986 101.927 13.703 100.927 13.703 C 100.547 13.703 100.157 13.833 99.757 14.093 C 99.363 14.353 99.03 14.7 98.757 15.133 Z" /></g>
        </svg>
    );
}

export const MLPLogo = ({colour='white'}) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 261.575 101.18" width="80" height="40">
            <g fill={ colour } transform="matrix(1 0 0 -1 -267.213989 356.589905)">
                <g className="B F">
                    <path d="M302.081 306.353l1.166.71c-.441 0-.812-.228-1.166-.71"/>
                </g>
                <g className="B C">
                    <path
                        d="M367.344 295.71a50.78 50.78 0 0 1 1.05 10.29c0 27.94-22.65 50.59-50.59 50.59s-50.59-22.65-50.59-50.59c0-8.369 2.042-16.256 5.643-23.208l12.133 7.419c1.757 1.097 3.77 3.284 5.646 5.404 1.995 2.254 3.833 4.432 5.035 5.142 1.34.792 1.864.955 2.227 1.269.27.233.451.55.808 1.269.446.898 1.872 2.078 3.375 3.058.354.482.726.711 1.166.711.057.032.116.068.172.1 1.908 1.06 2.429 1.226 2.429 1.226s.636-.424 0-1.272c-.168-.223-.432-.537-.738-.891-.857-.994-2.052-2.328-2.443-3.031-.53-.955-1.802-2.121-2.65-3.181s-1.06-1.59-1.484-2.12 1.484 1.484 2.862 2.65 2.544 2.545 3.074 3.181.637-.53-.848-3.075c-1.305-2.237-1.871-1.852-1.989-2.952a4.93 4.93 0 0 1-.025-.546c0-1.802.53 0 0-1.802s-1.484-1.802-1.484-3.074.318-1.166 0-2.544-1.272-2.65-2.438-4.241-1.908-1.964-3.286-3.791-3.71-4.477-4.24-6.385-.036-1.272-1.555-2.968l-1.52-1.696s6.891 2.332 7.633 3.18 1.06-.106.742-1.272-.106-1.272 1.272.106 6.042 5.406 6.36 5.3-.848-.318-1.378-2.544-3.18-5.831-3.816-6.679-.636-.636-1.378-1.908-2.65-2.862-2.65-3.392c0-.224-.196-.996-.311-1.834 7.201-3.942 15.457-6.199 24.246-6.199 10.582 0 20.401 3.254 28.522 8.809l-2.137 3.257c-.328.426-2.426 2.245-3.025 3.007s-1.828 2.133-1.991 2.389 2.89-5.406 2.562-4.862c-.467.773-2.607 2.844-3.173 3.947s-1.989 3.57-2.459 4.252-2.203 2.323-2.446 2.785-4.105 3.78-4.41 4.512c-.166.398-.439.901-.776 1.464-.711.54-1.437 1.208-2.033 2.027-1.696 2.332.848.742-1.908 2.756s-4.876 4.983-5.83 7.103c-.391.869-.832 1.657-1.221 2.296l-.865 1.116c-.046.056-.083.103-.099.129l.099-.129c.109-.13.294-.334.546-.604-.399.621-.687 1.008-.687 1.008v.636l11.767 14.947c1.908 2.544.636 2.226 2.862 5.088l5.937 7.633c.212.424-.848-2.226-.424-2.438s1.329-.318.452-1.484-4.374-6.255-4.162-6.573 3.18 3.816 3.286 3.074-3.074-8.904-3.074-8.904l-.849-1.59c-.212-.424 5.195 5.936 5.725 5.936s.954.636 0-1.06-1.378-1.484-1.378-1.908.848-.106.53-1.06-2.332-3.074-2.332-4.558-.636-2.015-1.272-2.969-1.591-2.968-1.591-3.286 7.739 5.3 8.163 5.83-.848-3.18-1.272-4.664-1.696-2.862-2.332-3.816-1.59-1.802-2.332-2.756-2.545-2.332-2.969-2.968.954-.106 2.015.742 1.59 1.802 2.014 1.696.318-.424-.106-1.272-.636-2.014-1.272-3.181-.954-.53-.636-1.166 2.544 0 2.544-.636-.424-.848-1.272-2.332-2.757-2.286-2.969-2.816c-.01-.026.589-.91.771-1.313.806-1.781 7.072-7.978 8.05-9.5.77-1.197 5.575-6.738 7.357-8.799 9.631 6.872 15.863 15.37 18.829 27.183-1.301 1.227-2.84 2.523-3.034 2.989-.564 1.352-1.89 4.298-3.625 6.649-1.823 2.469-3.613 4.988-4.875 6.364-1.533 1.67-9.098 11.802-10.283 13.354a178.56 178.56 0 0 0-1.463 2.323l.134-.176c1.718-2.121 19.236-20.769 19.674-22.076.445-1.327 3.288-4.096 4.283-6.105"/>
                </g>
                <g className="B C">
                    <path d="M305.11 306.227l.738.891c.636.848 0 1.272 0 1.272s-.52-.166-2.428-1.226l-.173-.1"/>
                </g>
                <g className="B C">
                    <path d="M302.081 306.353c-1.503-.98-2.929-2.16-3.375-3.058-.357-.72-.539-1.036-.808-1.269"/>
                </g>
                <g className="B C">
                    <path d="M316.614 300.268l-.099.129a1.19 1.19 0 0 1 .099-.129"/>
                </g>
                <g className="B C">
                    <path d="M316.614 300.268l.865-1.116-.319.512-.546.604"/>
                </g>
                <g className="B F">
                    <path
                        d="M377.889 321.154v16.297c0 .362.329.543.988.543h.889c.526 0 .872-.149 1.037-.444l4.667-8.099.642-1.556.642 1.407 4.667 8.248c.164.295.51.444 1.037.444h.815c.658 0 .987-.181.987-.543v-16.297c0-.362-.329-.544-.987-.544h-.173c-.659 0-.988.182-.988.544v13.284l-4.963-8.642c-.115-.214-.297-.321-.543-.321h-.988c-.247 0-.428.107-.543.321l-5.038 8.791v-13.433c0-.362-.329-.544-.987-.544h-.173c-.659 0-.988.182-.988.544"/>
                </g>
                <g className="B C D G H">
                    <path
                        d="M377.889 321.154v16.297c0 .362.329.543.988.543h.889c.526 0 .872-.149 1.037-.444l4.667-8.099.642-1.556.642 1.407 4.667 8.248c.164.295.51.444 1.037.444h.815c.658 0 .987-.181.987-.543v-16.297c0-.362-.329-.544-.987-.544h-.173c-.659 0-.988.182-.988.544v13.284l-4.963-8.642c-.115-.214-.297-.321-.543-.321h-.988c-.247 0-.428.107-.543.321l-5.038 8.791v-13.433c0-.362-.329-.544-.987-.544h-.173c-.659 0-.988.182-.988.544z"/>
                </g>
                <g className="B C D E">
                    <path id="B"
                          d="M405.537 324.166c.913-1.185 2.242-1.777 3.987-1.777s3.078.592 4 1.777 1.383 2.91 1.383 5.174-.461 3.975-1.383 5.136-2.255 1.741-4 1.741-3.074-.581-3.987-1.741-1.371-2.873-1.371-5.136.457-3.988 1.371-5.174m-1.667-1.395c-1.301 1.506-1.951 3.7-1.951 6.581s.646 5.058 1.938 6.531 3.182 2.21 5.667 2.21 4.379-.737 5.68-2.21 1.95-3.651 1.95-6.531-.65-5.075-1.95-6.581-3.189-2.259-5.667-2.259-4.367.753-5.667 2.259"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M424.562 326.191v11.26c0 .362.329.543.987.543h.198c.658 0 .988-.181.988-.543v-11.334a3.29 3.29 0 0 1 1.296-2.679c.864-.7 1.955-1.05 3.272-1.05s2.407.35 3.272 1.05 1.296 1.592 1.296 2.679v11.334c0 .362.329.543.988.543h.197c.658 0 .987-.181.987-.543v-11.26c0-1.795-.584-3.189-1.752-4.186s-2.836-1.494-5-1.494-3.828.498-4.989 1.494-1.74 2.391-1.74 4.186"/>
                </g>
                <g className="B C D E">
                    <path id="C"
                          d="M446.267 321.154v16.297c0 .362.329.543.987.543h.519c.461 0 .807-.156 1.037-.469l7.877-11.902.741-1.383v13.211c0 .362.329.543.987.543h.173c.658 0 .988-.181.988-.543v-16.297c0-.362-.33-.544-.988-.544h-.494c-.428 0-.716.115-.864.346l-8.149 12.297-.667 1.259v-13.358c0-.362-.329-.544-.987-.544h-.173c-.658 0-.987.182-.987.544"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M471.477 321.154v14.914h-4.741c-.329 0-.493.247-.493.741v.395c0 .494.164.741.493.741h11.581c.329 0 .494-.247.494-.741v-.395c0-.494-.165-.741-.494-.741h-4.667v-14.914c0-.362-.329-.544-.987-.544h-.198c-.659 0-.988.182-.988.544"/>
                </g>
                <g className="B C D E">
                    <path id="D"
                          d="M487.824 326.932h5.901l-2.592 7.358-.322 1.433-.394-1.433zm-4.272-5.901c0 .082.025.198.074.345l5.852 16.224c.082.263.411.395.988.395h.716c.576 0 .905-.132.988-.395l5.852-16.248c.049-.115.073-.223.073-.321 0-.281-.353-.42-1.061-.42h-.197c-.576 0-.906.132-.989.395l-1.456 4.05h-7.259l-1.408-4.05c-.083-.263-.412-.395-.988-.395h-.123c-.708 0-1.062.139-1.062.42"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M504.739 321.154v16.297c0 .362.329.543.987.543h.198c.658 0 .988-.181.988-.543v-16.297c0-.362-.33-.544-.988-.544h-.198c-.658 0-.987.182-.987.544"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M514.48 321.154v16.297c0 .362.329.543.987.543h.519c.461 0 .807-.156 1.037-.469l7.877-11.902.741-1.383v13.211c0 .362.329.543.987.543h.173c.658 0 .988-.181.988-.543v-16.297c0-.362-.33-.544-.988-.544h-.494c-.428 0-.716.115-.864.346l-8.149 12.297-.667 1.259v-13.358c0-.362-.329-.544-.987-.544h-.173c-.658 0-.987.182-.987.544"/>
                </g>
                <g className="B F">
                    <path
                        d="M384.478 298.1v16.05c0 .362.329.543.988.543h.198c.658 0 .987-.181.987-.543v-14.914h7.79c.329 0 .495-.247.495-.741v-.395c0-.494-.166-.741-.495-.741h-9.222c-.494 0-.741.247-.741.741"/>
                </g>
                <g className="B C D G H">
                    <path
                        d="M384.478 298.1v16.05c0 .362.329.543.988.543h.198c.658 0 .987-.181.987-.543v-14.914h7.79c.329 0 .495-.247.495-.741v-.395c0-.494-.166-.741-.495-.741h-9.222c-.494 0-.741.247-.741.741z"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M401.919 298.1v15.803c0 .494.247.741.741.741h8.617c.33 0 .495-.247.495-.741v-.395c0-.494-.165-.741-.495-.741h-7.185v-5.63h6.445c.328 0 .494-.247.494-.741v-.395c0-.494-.166-.741-.494-.741h-6.445v-6.024h7.211c.328 0 .494-.247.494-.741v-.395c0-.494-.166-.741-.494-.741h-8.643c-.494 0-.741.247-.741.741"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M418.364 305.853c0 5.959 2.667 8.938 8.001 8.938 1.185 0 2.268-.168 3.247-.505s1.469-.679 1.469-1.025c0-.231-.103-.527-.309-.889s-.383-.543-.531-.543c-.033 0-.209.09-.53.271s-.779.362-1.371.544-1.235.271-1.926.271c-2.091 0-3.58-.577-4.469-1.728s-1.334-2.856-1.334-5.111c0-4.66 1.844-6.989 5.531-6.989 1.301 0 2.363.107 3.186.322v4.987h-2.889c-.33 0-.494.247-.494.741v.395c0 .494.164.741.494.741h4.321c.494 0 .741-.247.741-.741v-6.543c0-1.186-1.836-1.779-5.507-1.779-5.086 0-7.63 2.881-7.63 8.643"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M442.07 303.63h5.901l-2.592 7.358-.322 1.433-.394-1.433zm-4.272-5.901c0 .082.025.198.074.345l5.852 16.224c.082.263.411.395.988.395h.716c.576 0 .905-.132.988-.395l5.852-16.248c.049-.115.073-.223.073-.321 0-.281-.353-.42-1.061-.42h-.197c-.576 0-.906.132-.989.395l-1.456 4.05h-7.259l-1.408-4.05c-.083-.263-.412-.395-.988-.395h-.123c-.708 0-1.062.139-1.062.42"/>
                </g>
                <g className="B C D E">
                    <path id="E"
                          d="M457.995 306.001c0 5.86 2.667 8.79 8.001 8.79 1.185 0 2.268-.169 3.247-.506s1.469-.679 1.469-1.024c0-.232-.103-.528-.309-.89s-.383-.543-.531-.543c-.033 0-.209.091-.53.272s-.779.362-1.371.544-1.235.271-1.926.271c-1.992 0-3.457-.552-4.396-1.654s-1.407-2.853-1.407-5.248.465-4.148 1.396-5.259 2.366-1.667 4.308-1.667c.741 0 1.441.102 2.099.309s1.169.411 1.531.617.568.308.617.308c.149 0 .329-.18.543-.543s.322-.626.322-.79c0-.379-.515-.769-1.543-1.173s-2.219-.605-3.569-.605c-2.716 0-4.721.712-6.013 2.136s-1.938 3.642-1.938 6.655"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M481.626 297.853v8.37l-5.161 7.606c-.132.181-.197.329-.197.444 0 .28.379.42 1.135.42h.272c.544 0 .897-.123 1.062-.37l4.049-6.074 4.149 6.098c.148.231.559.346 1.235.346s1.012-.14 1.012-.42c0-.066-.066-.214-.198-.444l-5.185-7.679v-8.297c0-.362-.329-.544-.987-.544h-.199c-.658 0-.987.182-.987.544"/>
                </g>
                <g className="B F">
                    <path
                        d="M386.25 283.291h3.852c.626 0 1.243.197 1.852.593.329.213.601.547.815 1s.321.991.321 1.617c0 1.102-.33 1.872-.988 2.309s-1.441.654-2.346.654h-3.506zm-2.173-8.741v16.05c0 .494.247.741.741.741h5.012c1.268 0 2.436-.28 3.506-.84.609-.313 1.095-.812 1.457-1.494s.544-1.486.544-2.407-.145-1.708-.432-2.359-.634-1.148-1.037-1.494a5.04 5.04 0 0 0-1.396-.839c-.806-.33-1.605-.494-2.395-.494h-3.827v-6.864c0-.363-.33-.544-.988-.544h-.198c-.658 0-.987.181-.987.544"/>
                </g>
                <g className="B C D G H">
                    <path
                        d="M386.25 283.291h3.852c.626 0 1.243.197 1.852.593.329.213.601.547.815 1s.321.991.321 1.617c0 1.102-.33 1.872-.988 2.309s-1.441.654-2.346.654h-3.506v-6.173zm-2.173-8.741v16.05c0 .494.247.741.741.741h5.012c1.268 0 2.436-.28 3.506-.84.609-.313 1.095-.812 1.457-1.494s.544-1.486.544-2.407-.145-1.708-.432-2.359-.634-1.148-1.037-1.494a5.04 5.04 0 0 0-1.396-.839c-.806-.33-1.605-.494-2.395-.494h-3.827v-6.864c0-.363-.33-.544-.988-.544h-.198c-.658 0-.987.181-.987.544z"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M404.093 283.538h3.259c.873 0 1.618.3 2.235.9s.926 1.35.926 2.247-.297 1.585-.889 2.063-1.408.716-2.445.716h-3.086zm-2.173-8.988v16.05c0 .494.247.741.74.741h4.149c1.975 0 3.461-.351 4.457-1.05s1.494-1.807 1.494-3.321c0-2.025-.947-3.416-2.84-4.173v-.099c.478-.165.877-.486 1.197-.963s.663-1.185 1.026-2.124l1.926-4.864a1.2 1.2 0 0 0 .074-.346c0-.263-.346-.395-1.037-.395h-.247c-.56 0-.889.132-.988.395l-1.877 4.84c-.362.939-.814 1.576-1.358 1.913s-1.317.507-2.321.507h-2.222v-7.111c0-.363-.33-.544-.988-.544h-.198c-.658 0-.987.181-.987.544"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M423.562 277.562c.913-1.185 2.242-1.777 3.987-1.777s3.078.592 4 1.777 1.383 2.91 1.383 5.174-.461 3.975-1.383 5.136-2.255 1.741-4 1.741-3.074-.581-3.987-1.741-1.371-2.873-1.371-5.136.457-3.988 1.371-5.174m-1.667-1.395c-1.301 1.506-1.951 3.7-1.951 6.581s.646 5.058 1.938 6.531 3.182 2.21 5.667 2.21 4.379-.737 5.68-2.21 1.95-3.651 1.95-6.531-.65-5.075-1.95-6.581-3.189-2.259-5.667-2.259-4.367.753-5.667 2.259"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M440.686 274.697c0 .165.049.433.147.803s.231.555.396.555c.017 0 .201-.037.556-.111s.687-.11 1-.11c1.217 0 2.098.238 2.641.716s.816 1.251.816 2.321v11.975c0 .363.329.543.987.543h.198c.658 0 .988-.18.988-.543v-11.729c0-3.473-1.746-5.21-5.235-5.21-1.663 0-2.494.264-2.494.79"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M456.81 274.797V290.6c0 .494.247.741.74.741h8.618c.33 0 .494-.247.494-.741v-.395c0-.494-.164-.741-.494-.741h-7.185v-5.63h6.444c.329 0 .494-.247.494-.741v-.395c0-.494-.165-.741-.494-.741h-6.444v-6.024h7.21c.329 0 .494-.247.494-.741v-.395c0-.494-.165-.741-.494-.741h-8.643c-.493 0-.74.247-.74.741"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M473.255 282.698c0 5.86 2.667 8.79 8.001 8.79 1.185 0 2.268-.169 3.247-.506s1.469-.679 1.469-1.024c0-.232-.103-.528-.309-.89s-.383-.543-.531-.543c-.033 0-.209.091-.53.272s-.779.362-1.371.544-1.235.271-1.926.271c-1.992 0-3.457-.552-4.396-1.654s-1.407-2.853-1.407-5.248.465-4.148 1.396-5.259 2.366-1.667 4.308-1.667c.741 0 1.441.102 2.099.309s1.169.411 1.531.617.568.308.617.308c.149 0 .329-.18.543-.543s.322-.626.322-.79c0-.379-.515-.769-1.543-1.173s-2.219-.605-3.569-.605c-2.716 0-4.721.712-6.013 2.136s-1.938 3.642-1.938 6.655"/>
                </g>
                <g className="B C D E">
                    <path
                        d="M496.811 274.55v14.914h-4.741c-.329 0-.493.247-.493.741v.395c0 .494.164.741.493.741h11.581c.329 0 .494-.247.494-.741v-.395c0-.494-.165-.741-.494-.741h-4.667V274.55c0-.362-.329-.544-.987-.544h-.198c-.659 0-.988.182-.988.544"/>
                </g>
            </g>
        </svg>
    );
};

/**
 * Render branding heading (logo + wordmark).
 *
 * @public
 */

const Logo = ({colour='white'}) => {
    return (
        <div className={'logo'}>
            <a href={getRoot()}><MLPWordmark colour={colour} /></a>
            <a href={getInfo().mlp_url} rel="noreferrer" target={'_blank'}><MLPLogo colour={colour} /></a>
        </div>
    );
};


/**
 * Creative Commons logo
 *
 * @public
 */

export const CCLogo = ({colour='black'}) => {
    return (
        <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
             width="40px" height="40px" viewBox="5.5 -3.5 64 64" enableBackground="new 5.5 -3.5 64 64">
<g>
	<circle fill="#FFFFFF" cx="37.785" cy="28.501" r="28.836"/>
    <path fill={ colour } d="M37.441-3.5c8.951,0,16.572,3.125,22.857,9.372c3.008,3.009,5.295,6.448,6.857,10.314
		c1.561,3.867,2.344,7.971,2.344,12.314c0,4.381-0.773,8.486-2.314,12.313c-1.543,3.828-3.82,7.21-6.828,10.143
		c-3.123,3.085-6.666,5.448-10.629,7.086c-3.961,1.638-8.057,2.457-12.285,2.457s-8.276-0.808-12.143-2.429
		c-3.866-1.618-7.333-3.961-10.4-7.027c-3.067-3.066-5.4-6.524-7-10.372S5.5,32.767,5.5,28.5c0-4.229,0.809-8.295,2.428-12.2
		c1.619-3.905,3.972-7.4,7.057-10.486C21.08-0.394,28.565-3.5,37.441-3.5z M37.557,2.272c-7.314,0-13.467,2.553-18.458,7.657
		c-2.515,2.553-4.448,5.419-5.8,8.6c-1.354,3.181-2.029,6.505-2.029,9.972c0,3.429,0.675,6.734,2.029,9.913
		c1.353,3.183,3.285,6.021,5.8,8.516c2.514,2.496,5.351,4.399,8.515,5.715c3.161,1.314,6.476,1.971,9.943,1.971
		c3.428,0,6.75-0.665,9.973-1.999c3.219-1.335,6.121-3.257,8.713-5.771c4.99-4.876,7.484-10.99,7.484-18.344
		c0-3.543-0.648-6.895-1.943-10.057c-1.293-3.162-3.18-5.98-5.654-8.458C50.984,4.844,44.795,2.272,37.557,2.272z M37.156,23.187
		l-4.287,2.229c-0.458-0.951-1.019-1.619-1.685-2c-0.667-0.38-1.286-0.571-1.858-0.571c-2.856,0-4.286,1.885-4.286,5.657
		c0,1.714,0.362,3.084,1.085,4.113c0.724,1.029,1.791,1.544,3.201,1.544c1.867,0,3.181-0.915,3.944-2.743l3.942,2
		c-0.838,1.563-2,2.791-3.486,3.686c-1.484,0.896-3.123,1.343-4.914,1.343c-2.857,0-5.163-0.875-6.915-2.629
		c-1.752-1.752-2.628-4.19-2.628-7.313c0-3.048,0.886-5.466,2.657-7.257c1.771-1.79,4.009-2.686,6.715-2.686
		C32.604,18.558,35.441,20.101,37.156,23.187z M55.613,23.187l-4.229,2.229c-0.457-0.951-1.02-1.619-1.686-2
		c-0.668-0.38-1.307-0.571-1.914-0.571c-2.857,0-4.287,1.885-4.287,5.657c0,1.714,0.363,3.084,1.086,4.113
		c0.723,1.029,1.789,1.544,3.201,1.544c1.865,0,3.18-0.915,3.941-2.743l4,2c-0.875,1.563-2.057,2.791-3.541,3.686
		c-1.486,0.896-3.105,1.343-4.857,1.343c-2.896,0-5.209-0.875-6.941-2.629c-1.736-1.752-2.602-4.19-2.602-7.313
		c0-3.048,0.885-5.466,2.658-7.257c1.77-1.79,4.008-2.686,6.713-2.686C51.117,18.558,53.938,20.101,55.613,23.187z"/>
</g>
</svg>

    );
}

export default Logo;



