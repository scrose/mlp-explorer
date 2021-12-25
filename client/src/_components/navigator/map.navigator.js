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
import {createNodeRoute, createRoute} from '../../_utils/paths.utils.client';
import {debounce, useWindowSize} from '../../_utils/events.utils.client';
import Loading from "../common/loading";
import {getPref, setPref} from "../../_services/session.services.client";
import {useNav} from "../../_providers/nav.provider.client";
import { getMarker, baseLayers } from "../tools/map.tools";


/**
 * Map navigator component.
 * - Requires third-party tile layer
 *   (See: https://leaflet-extras.github.io/leaflet-providers/preview/)
 *
 * @public
 * @return {JSX.Element}
 */

function MapNavigator({ filter, hidden }) {

    // let mapContainer = React.createRef();
    const mapID = 'map-container';
    const router = useRouter();
    const api = useData();
    const nav = useNav();

    // mounted component flag
    const _isMounted = React.useRef(false);

    // get the current node ID (if available)
    const { query = [] } = api.data || {};
    const currentFilter = query.length > 0 ? query : api.nodes;

    // centre map on selected node
    const initCenter = {lat: 51.311809, lng: -119.249230};
    const { lat=initCenter.lat, lng=initCenter.lng } = api.metadata;

    // map initial settings
    const [loaded, setLoaded] = React.useState(false);
    const [selectedBaseLayer, setBaseLayer] = React.useState(getPref('mapBase') || 'Satellite Imagery');
    const [center, setCenter] = React.useState([lat, lng]);
    const [zoom, setZoom] = React.useState(4);
    const [clustered, setClustered] = React.useState(true);

    // window dimensions
    const [winWidth, winHeight] = useWindowSize();

    // leaflet map object
    const mapPane = React.useRef(null);
    const mapObj = React.useRef(null);
    const layerGrp = React.useRef(null);

    // request station(s) view in selected cluster
    // - if single station, go to that station info page
    // - for multiple station, go to filter page for ids
    const loadView = React.useCallback((ids = []) => {
        ids.length === 1
            ? router.update(createNodeRoute('stations', 'show', ids[0]))
            : router.update(createRoute('/filter', { ids: ids }));
    }, [router]);

    // cluster station locations for n > 1
    const getClusterMarkers = React.useCallback((currentIDs) => {

        if (!currentIDs) return;

        // apply user-defined filter
        const _applyFilter = (station) => {

            // filter is empty
            if (Object.keys(nav.filter).length === 0) return true;

            // apply data field filters - include stations that:
            // - have the filter property
            // - either have an empty filter property or match in value
            return Object.keys(nav.filter).reduce((o, key) => {
                return o && station.hasOwnProperty(key)
                    && (
                        !nav.filter[key]
                        || parseInt(station[key]) === parseInt(nav.filter[key])
                    );
            }, true);
        };

        // create map marker icon
        const _getMarker = (n, isSelected = false) => {

            // select marker fill colour based on selection
            const fillColour = isSelected ? 'E34234' : '008896';

            // select marker icon
            const iconSVG = n > 1 ?
                getMarker('cluster', fillColour, n)  :
                getMarker('single', fillColour);

            return n > 1
                ? L.icon({
                    iconUrl: 'data:image/svg+xml;base64,' + btoa(iconSVG),
                    iconSize: [50, 50],
                    iconAnchor: [25, 50],
                    tooltipAnchor: [10, 0]
                })
                : L.icon({
                    iconUrl: 'data:image/svg+xml;base64,' + btoa(iconSVG),
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    tooltipAnchor: [10, 0]
                });
        };

        // grid settings: number of grid cells is scaled by zoom level
        // - increase granularity exponentially
        const latN = Math.ceil(0.2 * zoom * zoom * zoom);
        const lngN = Math.ceil(0.2 * zoom * zoom * zoom);

        // get map parameters
        // NOTE: The following bucket sort of geographic coordinates
        // only works for one side of the international date line.
        const maxBounds = [[66, -104], [44, -154]];
        const viewBounds = mapObj.current.getBounds();
        const paddedViewBounds = viewBounds.pad(1.0);

        // Latitude: North > South (northern hemisphere)
        // Longitude: East > West (northern hemisphere)
        const [[latMax, lngMax], [latMin, lngMin]] = maxBounds;

        // get latitude/longitude range
        const latRange = latMax - latMin;
        const lngRange = lngMax - lngMin;

        let dLat, dLng, grid;
        if (latN > 0 && lngN > 0) {
            dLat = latRange / latN;
            dLng = lngRange / lngN;

            // initialize cluster grid
            grid = [...Array(latN).keys()].map(() => Array(lngN));
        }

        // filter stations outside (padded) map view
        const FilteredData = nav.map
            .filter(station => {
                // filter stations not in map view
                const coord = L.latLng(station.lat, station.lng);
                // apply user-defined filter
                return paddedViewBounds.contains(coord) && _applyFilter(station);
            });

        // Sort station coordinates into grid areas
        // - check if grid exists and apply
        // - otherwise use single station markers
        const clusters = clustered ?
            // bucket sort station locations into grid elements
            FilteredData.reduce((o, station) => {

                const i = Math.round((station.lat - latMin) / dLat);
                const j = Math.round((station.lng - lngMin) / dLng);

                // reject null grid elements
                if (!o || isNaN(i) || o[i] == null) return o;

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
            : // (no clustering) show individual station markers
            FilteredData.reduce((o, station) => {
                o.push([{
                    isSelected: station.isSelected || currentIDs.includes(station.nodes_id),
                    stations: [station],
                    centroid: {
                        lat: station.lat,
                        lng: station.lng
                    }
                }]);
                return o;
            }, []);

        // generate cluster marker for each grid element
        return clusters.reduce((o, row) => {
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
                    icon: _getMarker(n, cluster.isSelected),
                    zIndexOffset: zIndexOffset,
                    riseOnHover: true,
                })
                    .on('click', (e) => {
                        // clicking on marker loads filter results in data pane
                        debounce(() => {
                            loadView(
                                cluster.stations.map(station => {
                                    return station.nodes_id;
                                }));
                            // recenter map
                            const coord = e.latlng;
                            if (mapObj.current) mapObj.current.panTo(coord);
                        }, 400)();
                    })
                    .on('dblclick', (e) => {
                        const coord = e.latlng;
                        const zoomLevel = mapObj.current.getZoom() + 1;
                        mapObj.current.flyTo(coord, zoomLevel);
                    })
                    .on('mouseover', function () {
                        this.bindTooltip(`
                        Lat: ${centroid[0].toFixed(3)}, 
                        Lng: ${centroid[1].toFixed(3)}
                        `).openTooltip();
                    })
                    .on('mouseout', function () {
                        this.closeTooltip();
                    });
                // add cluster marker to layer
                o.push(marker);
                return null;
            }, o);
            return o;
        }, []);
    }, [nav, mapObj, loadView, zoom, clustered]);

    /**
     * Reset map view to new center coordinate and zoom level.
     * - Redraws markers based on new center and zoom values
     *
     * @param coord
     * @param zoomLevel
     * @type {function(*=, *=): void}
     */

    const reset = React.useCallback((coord, zoomLevel) => {
        if (coord && zoomLevel && layerGrp.current) {
            setCenter(coord);
            setZoom(zoomLevel);
        }
    }, [setZoom, setCenter]);

    // assign selected nodes on map
    React.useEffect(() => {
        _isMounted.current = true;
        if (_isMounted.current && layerGrp.current) {
            layerGrp.current.clearLayers();
            layerGrp.current = L.layerGroup(getClusterMarkers(currentFilter)).addTo(mapObj.current);
        }
        return () => {_isMounted.current = false;}
    }, [getClusterMarkers, currentFilter, filter, zoom, center])

    // API data change detected: recenter map to selected coordinate (if available)
    // - if on station info page, center and zoom to location on the map
    React.useEffect(() => {
        _isMounted.current = true;
        if (_isMounted.current && mapObj.current) {
            const {lat = null, lng = null} = api.metadata;
            if (lat && lng && mapObj.current) {
                mapObj.current.flyTo([lat, lng], 12);
            }
        }

        return () => {_isMounted.current = false;}
    }, [api, setClustered])

    // Redraw map if container was resized.
    React.useEffect(() => {
        _isMounted.current = true;
        if (_isMounted.current && mapObj.current) {
            mapObj.current.invalidateSize();
        }
        return () => {
            _isMounted.current = false;
            nav.setResize(false);
        }
    }, [nav.resize, nav.setResize, winWidth, winHeight]);


    /**
     * Initialize leaflet map.
     *
     * @param domNode
     * @param mapCenter
     * @param mapZoom
     * @type {function(*=, *=, *=): (undefined)}
     */

    const initMap = React.useCallback((domNode) => {

        // adjust height to fill window
        domNode.style.height = window.innerHeight - 140 + 'px';

        if (api.loaded && center && zoom && nav.map && Object.keys(nav.map).length > 0) {

            if (mapObj.current) return;

            // centre map on selected node
            const [lat=initCenter.lat, lng=initCenter.lng] = center;

            // initialize map with DOM container and initial coordinates
            mapObj.current = L.map(domNode, {
                center: [lat, lng],
                zoom: zoom,
                layers: [baseLayers[selectedBaseLayer]],
            });

            // set maximum bounds to map view
            // mapObj.current.setMaxBounds(maxBounds);

            // reset saved map centre coordinate / zoom level
            reset(center, zoom);

            // add marker layer to map
            layerGrp.current = L.layerGroup(getClusterMarkers(currentFilter)).addTo(mapObj.current);
            // let overlays = {
            //     'Stations': layerGrp.current,
            // };

            // Add marker cluster control
            L.Control.Cluster = L.Control.extend({
                onAdd: function(map) {
                    const label = L.DomUtil.create('label', 'map-cluster-control');
                    const input = L.DomUtil.create('input', 'map-cluster-control', label);
                    const button = L.DomUtil.create('button', 'map-cluster-control', label);
                    button.title = "Toggle Individual Station Markers";
                    L.DomUtil.addClass(button, 'activated');
                    input.value = "true";
                    input.type = 'hidden';
                    button.style.width = '30px';
                    button.style.height = '30px';
                    button.value = "Cluster";
                    button.innerHTML = getMarker('icon');
                    L.DomEvent.on(button, 'click', () => {
                        input.value = !(input.value === "true");
                        input.value === "true"
                            ? L.DomUtil.addClass(button, 'activated')
                            : L.DomUtil.removeClass(button, 'activated');
                        setClustered(input.value === "true");
                    });
                    return label;
                },

                onRemove: function(map) {}
            });
            L.control.cluster = function(opts) {
                return new L.Control.Cluster(opts);
            }
            L.control.cluster({ position: 'topleft' }).addTo(mapObj.current);

            // add layers to leaflet controls
            L.control.layers(baseLayers).addTo(mapObj.current);
            L.control.scale().addTo(mapObj.current);

            // callback for base layer changes
            // save as user preference
            mapObj.current.on('baselayerchange', e => {
                setBaseLayer(e.name);
                setPref('mapBase', e.name);
            });

            // create callbacks for map zooming / panning
            mapObj.current.on('zoomend', e => {
                // reset saved map centre coordinate / zoom level
                reset(e.target.getCenter(), e.target.getZoom());
            });
            mapObj.current.on('moveend', e => {
                reset(e.target.getCenter(), e.target.getZoom());
            });
            mapObj.current.on('error', err => {
                console.warn(err);
            });

            setLoaded(true);
        }

    }, [
        api,
        nav,
        initCenter,
        currentFilter,
        center,
        zoom,
        reset,
        selectedBaseLayer,
        baseLayers,
        setBaseLayer,
        getClusterMarkers,
        setClustered,
        setLoaded,
    ]);

    /**
     * Initialize map using reference callback to access DOM container.
     *
     * @param domNode
     * @type {function(*=): void}
     */

    const mapContainer = React.useCallback(domNode => {
        if (domNode) initMap(domNode);
    }, [initMap]);

    return (
        <div
            ref={mapPane} className={'map'}
            style={{
                display: hidden ? ' none' : ' block',
                height: (winHeight - 140) + 'px'
            }}
        >
            {
                !loaded && <Loading/>
            }
            <div
                id={mapID}
                className={mapID}
                ref={mapContainer}
            />
        </div>
    );
}

export default MapNavigator;