import schema from '../../schema';
import React from 'react';
import { removeUserSession, useUserContext } from '../../services/session.services.client';

/**
 * User navigation menu component.
 *
 * @public
 */

function UserMenu() {
    const session = useUserContext();

    console.log('Session from Header:', session)

    function handleLogin() {
        const action = session.hasOwnProperty('token') ? 'logout' : 'login';
        console.log(action)
        const toggle = {
            login: () => {
                window.location.replace("/login");
            },
            logout: () => {
                removeUserSession();
            }
        }
        toggle[action]();
    }
    return (
        <nav className={'menu user'}>
            <button onClick={handleLogin}>
                {session.hasOwnProperty('token') ? 'Logout' : 'Login'}
            </button>
            {/*<button onClick={window.location.replace("/register")}>*/}
            {/*    {session.hasOwnProperty('user') ? 'Logout' : 'Login'}*/}
            {/*</button>*/}
        </nav>
    );
}

/**
 * Navigation menu component.
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

/**
 * Page header component.
 *
 * @public
 */

const Header = () => {

    // Page title
    const pageTitle = `${schema.main.appName}: ${schema.main.projectName}`;

    // get current path
    const rootURL = window.location.href;
    const session = useUserContext();
    const {id, email} = session;

    console.log('Header:', session, id, email)

    return (
        <header className="page-header">
            <UserMenu />
            <h1>
                <a href="/">{pageTitle}</a>
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
