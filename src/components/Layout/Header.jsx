import styles from "./Header.module.css";
import logo from "../../assets/react.svg";
import Navbar from "./Navbar";

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <img
          src={logo}
          alt="Logo React"
          className={styles.logo}
        />
        <h1 className={styles.title}>Mi Tienda React</h1>
      </div>
      <Navbar />
    </header>
  );
}

export default Header;
