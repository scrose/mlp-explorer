

const API = 'http://localhost:3001';
const DEFAULT_QUERY = '/';

export default async function(uri='') {
        const res = await fetch(`${API}/${uri}`);

        if (!res.ok) {
            const message = `An error has occured: ${res.status}`;
            throw new Error(message);
        }

        return await res.json();
    }



    // static fetchSecond(routeid, stationid, cb) {
    //     fetch(`${API}${routeid}/Arrivals/${stationid}`)
    //         .then(resp => {
    //             try {
    //                 resp = JSON.parse(resp._bodyText);
    //                 cb(resp);
    //             } catch(e) {
    //                 cb(e);
    //             }
    //         })
    //         .catch(e => cb(e));
    // }
