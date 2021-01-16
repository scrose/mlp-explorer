import { Route, Switch } from 'react-router-dom';
import React from 'react';
import Icons from './_components/common/icon';
import APIService from './_services/api.services.client';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            data: {},
        };
    }

    componentDidMount() {
        APIService.fetchFirst((res) => {
            console.log(res)
            // APIService.fetchSecond(resp1.routeid, resp1.stationid, (resp2) => {
            //     this.setState({
            //         tube: resp2,
            //     });
            // });
        });
    }

    render() {
        const { error, isLoaded, data } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <Icons headerData={data} />
            );
        }
    }
}

export default App;