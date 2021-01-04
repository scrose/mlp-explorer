import {Component} from 'react'

class Header extends Component {

    render() {
        console.log('Header data:', this.props.data)
        return (
            <header className="page-header">
            <nav id="user_menu"></nav>
            <h1>
                <a href="/">
                    {this.props.data.projectName}:
                    {this.props.data.appName}
                </a>
            </h1>
            <nav id="main_menu">
                <ul className="main_menu">
                    <li><a href="/">Home</a></li>
                    <li><a href="#">About</a></li>
                    <li><a href="#">User Guide</a></li>
                    <li><a href="#">Tools</a></li>
                    <li><a href="#">MLP Website</a></li>
                    <li><a href="#">Help</a></li>
                </ul>
            </nav>
            <nav id="breadcrumb_menu"></nav>
            <nav id="editor_menu"></nav>
            <aside id="msg_container"></aside>
        </header>
        )
    }
}

export default Header;
