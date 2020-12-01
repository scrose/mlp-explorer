

const API = 'http://localhost:3001/api';
const DEFAULT_QUERY = '/';

class APIService {
    static fetchFirst(cb) {
        fetch('FIRST_URL')
            .then(resp => {
                try {
                    resp = JSON.parse(resp._bodyText);
                    cb(resp);
                } catch(e) {
                    cb(e);
                }
            })
            .catch(e => cb(e));
    }

    static fetchSecond(routeid, stationid, cb) {
        fetch(`${API}${routeid}/Arrivals/${stationid}`)
            .then(resp => {
                try {
                    resp = JSON.parse(resp._bodyText);
                    cb(resp);
                } catch(e) {
                    cb(e);
                }
            })
            .catch(e => cb(e));
    }
}

module.exports = APIService;