import React, {Component} from 'react';

import Navigator from './navigator.js';

class Main extends Component {
    render() {
        const {data} = this.props

        return (
                <Navigator />,

            <main>
                Main page
            </main>

        )
    }
}

export default Main;
