import styles from "./Footer.module.css";
//import staffImage from "./NuestroStaf.jpg";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>Sobre Nosotros</h3>
          <p>Nos dedicamos al software en Groelandia</p>
          <p>Experiencia en todo lo conocido</p>
        </div>

        <div className={styles.footerSection}>
          <h3>Nuestro Staff</h3>
          <ul>
            <li>Lio Musquito</li>
            <li>Larry Dirty</li>
            <li>Mark Bazuca</li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Contacto</h3>
          <p>Dirección: Calle Principal 123, Groelandia</p>
          <p>Teléfono: +555 123-4567</p>
          <p>Email: lio.musquito@groelandia.com</p>
        </div>

        <div className={styles.footerSection}>
          <img src="/NuestroStaf.jpg" alt="Nuestro Staff" className={styles.staffImage} />
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; 2026 - Mi Tienda React - Groelandia Software</p>
      </div>
    </footer>
  );
}

export default Footer;
