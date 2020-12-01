import { Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import APIService from './services/APIService'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            data: {}
        };
    }

    componentDidMount() {

        APIService.fetchFirst((resp1) => {
            APIService.fetchSecond(resp1.routeid, resp1.stationid, (resp2) => {
                this.setState({
                    tube: resp2
                });
            });
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
                <Header headerData={data} />
            );
        }
    }
}

export default App