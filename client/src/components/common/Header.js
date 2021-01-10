import schema from '../../schema';
import React from 'react';

/**
 * Build messages container.
 *
 * @public
 * @param id
 */

const NavMenu = ({data}) => {
    const {email} = data;
    return (
        <nav className={`menu user`}>{email}</nav>
    )
}

const pageHeading = `${schema.main.appName}: ${schema.main.projectName}`;

/**
 * Build page header.
 *
 * @public
 */

const Header = () => {

    // get current path
    const rootURL = window.location.href;
    const [userData, setUserData] = React.useState(
        sessionStorage.getItem('user') || {}
    );
    const {id, email} = userData;
    console.log('Header:', userData, id, email)

    return (
        <header className="page-header">
            <NavMenu data={userData} />
            <h1>
                <a href="/">{pageHeading}</a>
            </h1>
            <nav id="main_menu">
                <ul className="main_menu">
                    <li><a href={rootURL}>Home</a></li>
                    <li><a href={rootURL}>About</a></li>
                    <li><a href={rootURL}>User Guide</a></li>
                    <li><a href={rootURL}>Tools</a></li>
                    <li><a href={rootURL}>MLP Website</a></li>
                    <li><a href={rootURL}>Help</a></li>
                </ul>
            </nav>
            <nav id="breadcrumb_menu"></nav>
            <nav id="editor_menu"></nav>
            <aside id="msg_container"></aside>
        </header>
    );
}


//
// class Header extends Component {
//
//     constructor(props) {
//         super(props)
//         this.rootURL = window.location.href;
//     }
//
//     render() {
//         console.log('Header data:', this.props.data)
//         return (
//             <header className="page-header">
//             <nav id="user_menu"></nav>
//             <h1>
//                 <a href="/">
//                     {this.props.data.projectName}:
//                     {this.props.data.appName}
//                 </a>
//             </h1>
//             <nav id="main_menu">
//                 <ul className="main_menu">
//                     <li><a href={this.rootURL}>Home</a></li>
//                     <li><a href={this.rootURL}>About</a></li>
//                     <li><a href={this.rootURL}>User Guide</a></li>
//                     <li><a href={this.rootURL}>Tools</a></li>
//                     <li><a href={this.rootURL}>MLP Website</a></li>
//                     <li><a href={this.rootURL}>Help</a></li>
//                 </ul>
//             </nav>
//             <nav id="breadcrumb_menu"></nav>
//             <nav id="editor_menu"></nav>
//             <aside id="msg_container"></aside>
//         </header>
//         )
//     }
// }

export default Header;
