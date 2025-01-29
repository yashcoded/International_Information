'use client'; // Marks this as a Client Component

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './TravelInfoDetails.module.css';

interface Country {
  cca3: string;
  name: {
    common: string;
  };
}

const TravelInfoDetails = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [fromCountry, setFromCountry] = useState<string>('');
  const [toCountry, setToCountry] = useState<string>('');
  const [transitCountry, setTransitCountry] = useState<string>('');
  const [layoverDuration, setLayoverDuration] = useState<string>('');
  const [visaInfo, setVisaInfo] = useState<string | null>(null);

  // Fetch country data for the dropdowns
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const sortedCountries = response.data.sort((a: any, b: any) =>
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountries();
  }, []);

  // Fetch visa information on form submission
  const handleSubmit = async () => {
    if (fromCountry && toCountry && transitCountry && layoverDuration) {
      try {
        const response = await axios.post('/api/visa-info', {
          fromCountry,
          toCountry,
          transitCountry,
          layoverDuration,
        });
        setVisaInfo(response.data.visaInfo);
      } catch (error) {
        console.error('Error fetching visa information:', error);
      }
    } else {
      alert('Please fill in all fields, including the layover duration.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Travel Information</h1>

      {/* Passport From Country Dropdown */}
      <div>
        <label className={styles.label}>
          Country your passport is from:
          <select
            value={fromCountry}
            onChange={(e) => setFromCountry(e.target.value)}
            className={styles.select}
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.cca3} value={country.name.common}>
                {country.name.common}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Travelling From Country Dropdown */}
      <div>
        <label className={styles.label}>
          Travelling from:
          <select
            value={toCountry}
            onChange={(e) => setToCountry(e.target.value)}
            className={styles.select}
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.cca3} value={country.name.common}>
                {country.name.common}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Transit Country Dropdown */}
      <div>
        <label className={styles.label}>
          Transit country:
          <select
            value={transitCountry}
            onChange={(e) => setTransitCountry(e.target.value)}
            className={styles.select}
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.cca3} value={country.name.common}>
                {country.name.common}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Layover Duration Textbox */}
      <div>
        <label className={styles.label}>
          Duration of the layover (in hours):
          <input
            type="text"
            value={layoverDuration}
            onChange={(e) => setLayoverDuration(e.target.value)}
            className={styles.input}
            placeholder="Enter layover duration"
          />
        </label>
      </div>

      {/* Submit Button */}
      <button onClick={handleSubmit} className={styles.button}>
        Submit
      </button>

      {/* Visa Information Display */}
      {visaInfo && (
        <div className={styles.visaInfo}>
          <h2 className={styles.subheader}>Visa Information</h2>
          <p className={styles.info}>{visaInfo}</p>
        </div>
      )}
    </div>
  );
};

export default TravelInfoDetails;
