'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './TravelInfo.module.css';

interface Country {
  cca3: string;
  name: {
    common: string;
  };
}

const TravelInfoDetails = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [passportFrom, setPassportFrom] = useState<string>('');
  const [travelFrom, setTravelFrom] = useState<string>('');
  const [travelTo, setTravelTo] = useState<string>('');
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

  // Handle form submission
  const handleSubmit = async () => {
    if (passportFrom && travelFrom && travelTo && transitCountry && layoverDuration) {
      try {
        const response = await axios.post('/api/visa-info', {
          passportFrom,
          travelFrom,
          travelTo,
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

  // Function to display visa information in a structured way
  const formatVisaInfo = (info: string) => {
    return info.split('\n').map((line, index) => {
      const urlMatch = line.match(/(https?:\/\/[^\s]+)/g);
      if (urlMatch) {
        return (
          <p key={index} className={styles.visaInfoPoint}>
            {line.split(urlMatch[0])[0]}
            <a href={urlMatch[0]} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {urlMatch[0]}
            </a>
          </p>
        );
      }
      return (
        <p key={index} className={styles.visaInfoPoint}>
          {line}
        </p>
      );
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Travel Information</h1>

      {/* Passport From Country Dropdown */}
      <div>
        <label className={styles.label}>
          Country your passport is from:
          <select
            value={passportFrom}
            onChange={(e) => setPassportFrom(e.target.value)}
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
            value={travelFrom}
            onChange={(e) => setTravelFrom(e.target.value)}
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

      {/* Travelling To Country Dropdown */}
      <div>
        <label className={styles.label}>
          Travelling to:
          <select
            value={travelTo}
            onChange={(e) => setTravelTo(e.target.value)}
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
            type="number"
            value={layoverDuration}
            onChange={(e) => setLayoverDuration(e.target.value)}
            className={styles.input}
            placeholder="Enter layover duration"
            min="0"
            step="1"
          />
        </label>
      </div>

      {/* Submit Button */}
      <button onClick={handleSubmit} className={styles.button}>
        Submit
      </button>

      {/* Visa Information Display */}
      {visaInfo && (
        <div className={styles.visaInfoContainer}>
          <h2 className={styles.subheader}>Visa Information</h2>
          <div className={styles.visaInfoContent}>
            {formatVisaInfo(visaInfo)}
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelInfoDetails;
