import React, {Component} from 'react'
import Table from './components/Table';
import Form from './components/Form';

class App extends Component {
    state = {
        characters: [
            {
                name: 'Charlie',
                // the rest of the data
            },
        ],
    }
    render() {
        const { characters } = this.state
        return (
            // <div className="container">
            //     <Table characterData={characters} />
            // </div>
            <div className="container">
                <Table characterData={characters} removeCharacter={this.removeCharacter} />
                <Form />
            </div>
        )
    }
}

export default App
