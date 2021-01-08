
const date = new Date();

const Footer = () => {
    return (
        <footer className="page-footer">
            <div>Copyright &copy; {date.getFullYear()}</div>
        </footer>
    );
}

export default Footer;
