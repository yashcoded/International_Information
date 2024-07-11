import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './TravelInfoDetails.module.css';

const TravelInfoDetails = () => {
  const router = useRouter();
  const { fromCountry, toCountry, transitCountry } = router.query;

  const [transitVisaInfo, setTransitVisaInfo] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransitVisaInfo = async () => {
      try {
        const response = await axios.post('/api/visa-info', {
          fromCountry,
          toCountry,
          transitCountry,
        });
        setTransitVisaInfo(response.data.visaInfo);
      } catch (error) {
        console.error('Error fetching transit visa information:', error);
      }
    };

    if (fromCountry && toCountry && transitCountry) {
      fetchTransitVisaInfo();
    }
  }, [fromCountry, toCountry, transitCountry]);

  return (
    <div className={styles.container}>
      <h1>Travel Information</h1>
      <p><strong>From:</strong> {fromCountry}</p>
      <p><strong>To:</strong> {toCountry}</p>
      <p><strong>Transit:</strong> {transitCountry}</p>
      <div className={styles.visaInfo}>
        <h2>Transit Visa Information</h2>
        {transitVisaInfo ? (
          <p>{transitVisaInfo}</p>
        ) : (
          <p>Loading transit visa information...</p>
        )}
      </div>
    </div>
  );
};

export default TravelInfoDetails;
