/*!
 * MLP.Client.Components.Navigator.Map
 * File: tree.navigator.js
 * Copyright(c) 2021 Runtime Software Development Inc.
 * MIT Licensed
 */

import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from '../../_providers/router.provider.client';
import { useData } from '../../_providers/data.provider.client';
import { createRoute } from '../../_utils/paths.utils.client';
import { debounce } from '../../_utils/events.utils.client';

/**
 * Map navigator component.
 * - Requires third-party tile layer
 *   (See: https://leaflet-extras.github.io/leaflet-providers/preview/)
 *
 * @public
 * @return {JSX.Element}
 */

function MapNavigator({ data, filter }) {

    // let mapContainer = React.createRef();
    const mapID = 'map-container';
    const router = useRouter();
    const api = useData();

    // get the current node ID (if available)
    const { query = [] } = api.data || {};
    const currentFilter = query.length > 0 ? query : api.nodes;

    // map initial settings
    const [selectedBaseLayer, setBaseLayer] = React.useState('Satellite');
    const [center, setCenter] = React.useState([51.311809, -119.249230]);
    const [zoom, setZoom] = React.useState(4);

    // leaflet map object
    const mapObj = React.useRef(null);
    const layerGrp = React.useRef(null);

    // destroy map instance
    const destroyMap = React.useCallback(() => {
        // check if map initialized
        if (mapObj.current) {
            // mapObj.current._leaflet_id = null;
            mapObj.current.off();
            mapObj.current.remove();
        }
    }, []);

    // set map view to new center coordinate and zoom level
    const reset = React.useCallback((coord, zoomLevel) => {
        if (coord && zoomLevel) {
            setCenter(coord);
            setZoom(zoomLevel);
        }
    }, [setZoom, setCenter]);

    // request stations in selected cluster
    const loadView = React.useCallback((ids = []) => {
        router.update(createRoute('/filter', { ids: ids }));
    }, [router]);

    // cluster station locations for n > 1
    const getClusterMarkers = React.useCallback((currentIDs) => {

        if (!currentIDs) return;

        // apply user-defined filter
        const applyFilter = (station) => {

            // filter is empty
            if (Object.keys(filter).length === 0) return true;

            // apply data field filters - include stations that:
            // - have the filter property
            // - either have an empty filter property or match in value
            return Object.keys(filter).reduce((o, key) => {
                return o && station.hasOwnProperty(key)
                    && (
                        !filter[key]
                        || parseInt(station[key]) === parseInt(filter[key])
                    );
            }, true);
        };

        // create map marker icon
        const getMarker = (n, isSelected = false) => {

            // select marker fill colour based on selection
            const fillColour = isSelected ? 'E34234' : '008896';

            // marker SVG templates
            const markers = {
                cluster: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 149 178">
                              <path 
                                  fill="#${fillColour}" 
                                  stroke="#FFFFFF" 
                                  stroke-width="6" 
                                  stroke-miterlimit="10" 
                                  d="M126 23l-6-6A69 69 0 0 0 74 1a69 69 0 0 0-51 22A70 70 0 0 0 1 74c0 21 7 38 22 52l43 47c6 6 11 6 16 0l48-51c12-13 18-29 18-48 0-20-8-37-22-51z"/>
                               <circle fill="#${fillColour}" cx="74" cy="75" r="61"/>
                               <text 
                                    x="50%" 
                                    y="50%" 
                                    fill="#FFFFFF"
                                    font-weight="bold"
                                    font-family="sans-serif"
                                    font-size="3em"
                                    text-anchor="middle">
                                  ${n}
                                </text>
                            </svg>`,
                single: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 149 178">
                              <path 
                                  fill="#${fillColour}" 
                                  stroke="#FFFFFF" 
                                  stroke-width="6" 
                                  stroke-miterlimit="10" 
                                  d="M126 23l-6-6A69 69 0 0 0 74 1a69 69 0 0 0-51 22A70 70 0 0 0 1 74c0 21 7 38 22 52l43 47c6 6 11 6 16 0l48-51c12-13 18-29 18-48 0-20-8-37-22-51z"/>
                               <circle fill="#${fillColour}" cx="74" cy="75" r="40"/>
                             </svg>`,
            };

            // select marker icon
            const iconSVG = n > 1 ? markers.cluster : markers.single;

            return L.icon({
                iconUrl: 'data:image/svg+xml;base64,' + btoa(iconSVG),
                iconSize: [38, 95],
                iconAnchor: [22, 94],
                popupAnchor: [-3, -76],
            });
        };

        // grid settings: number of grid cells is scaled by zoom level
        const latN = 2 * mapObj.current.getZoom();
        const lngN = 2 * mapObj.current.getZoom();

        // get map parameters
        // NOTE: The following bucket sort of geographic coordinates
        // only works for one side of the international date line.
        const maxBounds = [[66, -104], [44, -154]];
        const viewBounds = mapObj.current.getBounds();

        // Latitude: North > South (northern hemisphere)
        // Longitude: East > West (northern hemisphere)
        const [[latMax, lngMax], [latMin, lngMin]] = maxBounds;

        // get latitude/longitude range
        const latRange = latMax - latMin;
        const lngRange = lngMax - lngMin;
        const dLat = latRange / latN;
        const dLng = lngRange / lngN;

        // initialize cluster grid
        let grid = [...Array(latN).keys()].map(() => Array(lngN));

        // Sort station coordinates into grid areas
        return data
            // filter stations outside map view
            .filter(station => {
                // filter stations not in map view
                const coord = L.latLng(station.lat, station.lng);
                // apply user-defined filter
                return viewBounds.contains(coord) && applyFilter(station);
            })
            // bucket sort station locations into grid elements
            .reduce((o, station) => {
                const i = Math.floor((station.lat - latMin) / dLat);
                const j = Math.floor((station.lng - lngMin) / dLng);

                // create longitudinal array if none exists
                if (o[i][j] == null) {
                    o[i][j] = {
                        isSelected: false,
                        stations: [],
                        centroid: { lat: 0, lng: 0 },
                    };
                }
                o[i][j].isSelected = o[i][j].isSelected || currentIDs.includes(station.nodes_id);
                o[i][j].stations.push(station);
                o[i][j].centroid.lat += station.lat;
                o[i][j].centroid.lng += station.lng;
                return o;
            }, grid)
            // generate cluster marker for each grid element
            .reduce((o, row) => {
                row.map(cluster => {
                    // get number of stations in cluster
                    const n = cluster.stations.length;
                    // place cluster in centroid of grid element
                    const centroid = [
                        cluster.centroid.lat / n,
                        cluster.centroid.lng / n,
                    ];
                    // set z-index of marker (selected has higher index)
                    const zIndexOffset = cluster.isSelected ? 999 : 0;
                    // create marker using station coordinates
                    const marker = L.marker(centroid, {
                        icon: getMarker(n, cluster.isSelected),
                        zIndexOffset: zIndexOffset,
                        riseOnHover: true,
                    })
                        .on('click', (e) => {
                            // clicking on marker loads filter results in data pane
                            loadView(
                                cluster.stations.map(station => {
                                    return station.nodes_id;
                                }));
                        })
                        .on('dblclick', (e) => {
                            console.log('dbl click!')
                            // get new map center / zoom level
                            debounce(() => {
                                const coord = e.latlng;
                                const zoomLevel = mapObj.current.getZoom() + 1;
                                mapObj.current.flyTo(coord, zoomLevel);
                            }, 400)();
                        });
                    // add cluster marker to layer
                    o.push(marker);
                    return null;
                }, o);
                return o;
            }, []);
    }, [data, mapObj, filter, loadView]);


    // initialize map
    const initMap = React.useCallback((domNode, mapCenter = center, mapZoom = zoom) => {

        // create base tile layers
        const baseLayers = {
            'Map': L.tileLayer(
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    maxZoom: 23,
                    minZoom: 4,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }),
            'Satellite': L.tileLayer(
                'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                {
                    maxZoom: 23,
                    minZoom: 4,
                    attribution: '&copy; <a href="https://www.arcgisonline.com/copyright">ARCGIS</a> contributors',
                })
        };

        if (data && Object.keys(data).length > 0) {

            // remove old map instance
            destroyMap();

            // initialize map with DOM container and initial coordinates
            mapObj.current = L.map(domNode, {
                center: mapCenter,
                zoom: mapZoom,
                layers: [baseLayers[selectedBaseLayer]],
            });

            // set maximum bounds to map view
            // mapObj.current.setMaxBounds(maxBounds);

            // reset saved map centre coordinate / zoom level
            reset(mapCenter, mapZoom);

            // add marker layer to map
            layerGrp.current = L.layerGroup(getClusterMarkers(currentFilter)).addTo(mapObj.current);
            let overlays = {
                'Stations': layerGrp.current,
            };

            L.control.layers(baseLayers, overlays).addTo(mapObj.current);
            L.control.scale().addTo(mapObj.current);

            // callback for base layer changes
            mapObj.current.on('baselayerchange', e => {
                setBaseLayer(e.name);
            });

            // create callbacks for map zooming / panning
            mapObj.current.on('zoomend', e => {
                // reset saved map centre coordinate / zoom level
                reset(e.target.getCenter(), e.target.getZoom());

                // add markers layer to map
                layerGrp.current.clearLayers();
                layerGrp.current = L.layerGroup(getClusterMarkers(currentFilter)).addTo(mapObj.current);
            });

            mapObj.current.on('moveend', e => {
                reset(e.target.getCenter(), e.target.getZoom());

                // add markers layer to map
                layerGrp.current.clearLayers();
                layerGrp.current = L.layerGroup(getClusterMarkers(currentFilter)).addTo(mapObj.current);
            });
        }

    }, [
        data,
        destroyMap,
        currentFilter,
        center,
        zoom,
        reset,
        selectedBaseLayer,
        setBaseLayer,
        getClusterMarkers,
    ]);

    // Initialize map using reference callback to access DOM container
    const mapContainer = React.useCallback(domNode => {
        if (domNode) initMap(domNode);
    }, [initMap]);

    return (
        <div className={'map'}>
            <div
                id={mapID}
                className={mapID}
                ref={mapContainer} />
        </div>
    );
}

export default MapNavigator;