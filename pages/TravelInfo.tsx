import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from './TravelInfo.module.css';

interface Country {
  cca3: string;
  name: {
    common: string;
  };
}

const TravelInfo = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [fromCountry, setFromCountry] = useState<string>('');
  const [toCountry, setToCountry] = useState<string>('');
  const [transitCountry, setTransitCountry] = useState<string>('');
  const [visaInfo, setVisaInfo] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const sortedCountries = response.data.sort((a: Country, b: Country) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountries();
  }, []);

  const handleFromCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => setFromCountry(e.target.value);
  const handleToCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => setToCountry(e.target.value);
  const handleTransitCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => setTransitCountry(e.target.value);

  const handleSubmit = async () => {
    if (fromCountry && toCountry && transitCountry) {
      try {
        const response = await axios.post('/api/visa-info', {
          fromCountry,
          toCountry,
          transitCountry,
        });
        setVisaInfo(response.data.visaInfo);
        router.push(`/${fromCountry}/${toCountry}/${transitCountry}`);
      } catch (error) {
        console.error('Error fetching visa information:', error);
        alert('Error fetching visa information. Please try again.');
      }
    } else {
      alert('Please select all countries.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome to International Travel Information</h1>
      </header>
      <div>
        <label className={styles.label}>
          Country your passport is from:
          <select value={fromCountry} onChange={handleFromCountryChange} className={styles.select}>
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.cca3} value={country.name.common}>
                {country.name.common}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label className={styles.label}>
          The country you are going to:
          <select value={toCountry} onChange={handleToCountryChange} className={styles.select}>
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.cca3} value={country.name.common}>
                {country.name.common}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label className={styles.label}>
          Where is the transit in:
          <select value={transitCountry} onChange={handleTransitCountryChange} className={styles.select}>
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.cca3} value={country.name.common}>
                {country.name.common}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button onClick={handleSubmit} className={styles.button}>Submit</button>

      {visaInfo && (
        <div className={styles.visaInfo}>
          <h2>Visa Information</h2>
          <p>{visaInfo}</p>
        </div>
      )}
    </div>
  );
};

export default TravelInfo;
