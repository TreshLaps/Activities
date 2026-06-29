import styles from './LandingPage.module.css';
import { Droplet, Activity, PersonStanding } from 'lucide-react';
import foto from '../../assets/markus_ser_viktig_ut.jpg';

const LandingPage = () => (
    <div className={styles.landingContainer}>
        <div className={styles.bannerWrapper}>
            <span>“All you need is red cells”</span>
            <img src={foto} alt="Markus ser viktig ut" />
        </div>
        <div className={styles.contentWrapper}>
            <div className={styles.boxWrapper}>
                <Activity size={96} />
                <p className={styles.boxText}>
                    Prinsippet bak vår trening er å bygge aerob kapasitet, som
                    er den viktigste faktoren i langdistanseløping
                </p>
            </div>
            <div className={styles.boxWrapper}>
                <Droplet size={96} />
                <p className={styles.boxText}>
                    Treningen intensitetsstyres med å måle laktat, et direkte
                    mål på anaerob energiforbruk
                </p>
            </div>
            <div className={styles.boxWrapper}>
                <PersonStanding size={96} />
                <p className={styles.boxText}>
                    Terskelintervaller gir mulighet for et stort volum på
                    relativt høy intensitet, og stimulerer effektivt den aerobe
                    kapasiteten
                </p>
            </div>
        </div>
    </div>
);

export default LandingPage;
