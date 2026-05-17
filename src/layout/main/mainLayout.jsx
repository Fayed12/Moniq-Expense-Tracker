// local
import styles from "./MainLayout.module.css";

function MainLayout({ children }) {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}

export default MainLayout;