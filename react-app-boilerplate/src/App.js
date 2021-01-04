import React, {Component} from 'react'
import List from './components/list.js';
import Main from './components/main.js';
import api from './services/APIService.js';
import Header from './components/header.js';
import schema from './schema.js'

class App extends Component {

    constructor(props){
        super(props);
        this.state = {
            data: {}
        }
    }

    componentDidMount() {
        api()
            .then(data => {
                this.setState({ data : data })
                console.log('API data:', this.props)
            })
            .catch(err => console.error(err));
    }

    // Update state so the next render will show the fallback UI.
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    // Log error to reporting service
    componentDidCatch(error, errorInfo) {
        console.error(error, errorInfo);
    }

    render() {
        // let items = Object.keys(this.state.data)
        //     .map(function(key) {
        //         return this.state.data[key];
        //     });
        console.log('State data:', this.state.data.labels)
        return (
            <Header data={schema.labels.main} />
            // Object.keys(this.state.data)
            // <Main/>
                // <List data={['test1', 'test2']} />
        )
    }
}

export default App;