'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from './TravelInfo.module.css';
import NavbarPages from './_NavbarPages';
import ConversationSidebar from '../components/ConversationSidebar';
import { 
  getRequestData, 
  incrementRequestCount, 
  getRemainingRequests, 
  hasReachedLimit,
  formatResetDate,
  REQUEST_LIMIT 
} from '../lib/requestTracker';

interface Country {
  cca3: string;
  name: {
    common: string;
  };
}

interface VisaInfoResponse {
  visaInfo: string;
  conversationId?: string;
  suggestions?: string[];
}

const TravelInfoDetails = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [passportFrom, setPassportFrom] = useState<string>('');
  const [travelFrom, setTravelFrom] = useState<string>('');
  const [travelTo, setTravelTo] = useState<string>('');
  const [transitCountry, setTransitCountry] = useState<string>('');
  const [layoverDuration, setLayoverDuration] = useState<string>('');
  const [visaInfo, setVisaInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [countriesLoading, setCountriesLoading] = useState<boolean>(true);
  const [willLeaveAirport, setWillLeaveAirport] = useState<string>('');
  const [layoverType, setLayoverType] = useState<string>('single');
  
  // Multiple layover states
  const [secondTransitCountry, setSecondTransitCountry] = useState<string>('');
  const [secondLayoverDuration, setSecondLayoverDuration] = useState<string>('');
  const [secondWillLeaveAirport, setSecondWillLeaveAirport] = useState<string>('');
  const [isLoadedFromHistory, setIsLoadedFromHistory] = useState<boolean>(false);
  const [secondTransitSearch, setSecondTransitSearch] = useState<string>('');
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const [showSecondTransitDropdown, setShowSecondTransitDropdown] = useState<boolean>(false);
  const [secondTransitSelectedIndex, setSecondTransitSelectedIndex] = useState<number>(-1);
  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);
  
  // Rate limiting from localStorage
  const [requestCount, setRequestCount] = useState<number>(0);
  const [remainingRequests, setRemainingRequests] = useState<number>(REQUEST_LIMIT);

  // Auto-scroll to latest message when conversation updates
  useEffect(() => {
    if (conversationHistory.length > 0 && chatMessagesRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        chatMessagesRef.current?.scrollTo({
          top: chatMessagesRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [conversationHistory]);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const chatMessages = chatMessagesRef.current;
    if (!chatMessages) return;

    const handleScroll = () => {
      const scrollTop = chatMessages.scrollTop;
      setShowScrollToTop(scrollTop > 300);
    };

    chatMessages.addEventListener('scroll', handleScroll);
    return () => chatMessages.removeEventListener('scroll', handleScroll);
  }, [conversationHistory.length]);

  const scrollToTop = () => {
    chatMessagesRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Offline detection
  const [isOnline, setIsOnline] = useState<boolean>(true);
  
  // Search states for each country field
  const [passportSearch, setPassportSearch] = useState<string>('');
  const [travelFromSearch, setTravelFromSearch] = useState<string>('');
  const [travelToSearch, setTravelToSearch] = useState<string>('');
  const [transitSearch, setTransitSearch] = useState<string>('');
  
  // Show/hide dropdown states
  const [showPassportDropdown, setShowPassportDropdown] = useState<boolean>(false);
  const [showTravelFromDropdown, setShowTravelFromDropdown] = useState<boolean>(false);
  const [showTravelToDropdown, setShowTravelToDropdown] = useState<boolean>(false);
  const [showTransitDropdown, setShowTransitDropdown] = useState<boolean>(false);
  
  // Keyboard navigation states
  const [passportSelectedIndex, setPassportSelectedIndex] = useState<number>(-1);
  const [travelFromSelectedIndex, setTravelFromSelectedIndex] = useState<number>(-1);
  const [travelToSelectedIndex, setTravelToSelectedIndex] = useState<number>(-1);
  const [transitSelectedIndex, setTransitSelectedIndex] = useState<number>(-1);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking on a search option
      if (target.closest('.searchOption')) {
        return;
      }
      if (!target.closest('.searchWrapper')) {
        setShowPassportDropdown(false);
        setShowTravelFromDropdown(false);
        setShowTravelToDropdown(false);
        setShowTransitDropdown(false);
        setShowSecondTransitDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Static list of countries as fallback
  const staticCountries = [
    { cca3: 'AFG', name: { common: 'Afghanistan' } },
    { cca3: 'ALB', name: { common: 'Albania' } },
    { cca3: 'DZA', name: { common: 'Algeria' } },
    { cca3: 'AND', name: { common: 'Andorra' } },
    { cca3: 'AGO', name: { common: 'Angola' } },
    { cca3: 'ARG', name: { common: 'Argentina' } },
    { cca3: 'ARM', name: { common: 'Armenia' } },
    { cca3: 'AUS', name: { common: 'Australia' } },
    { cca3: 'AUT', name: { common: 'Austria' } },
    { cca3: 'AZE', name: { common: 'Azerbaijan' } },
    { cca3: 'BHS', name: { common: 'Bahamas' } },
    { cca3: 'BHR', name: { common: 'Bahrain' } },
    { cca3: 'BGD', name: { common: 'Bangladesh' } },
    { cca3: 'BRB', name: { common: 'Barbados' } },
    { cca3: 'BLR', name: { common: 'Belarus' } },
    { cca3: 'BEL', name: { common: 'Belgium' } },
    { cca3: 'BLZ', name: { common: 'Belize' } },
    { cca3: 'BEN', name: { common: 'Benin' } },
    { cca3: 'BTN', name: { common: 'Bhutan' } },
    { cca3: 'BOL', name: { common: 'Bolivia' } },
    { cca3: 'BIH', name: { common: 'Bosnia and Herzegovina' } },
    { cca3: 'BWA', name: { common: 'Botswana' } },
    { cca3: 'BRA', name: { common: 'Brazil' } },
    { cca3: 'BRN', name: { common: 'Brunei' } },
    { cca3: 'BGR', name: { common: 'Bulgaria' } },
    { cca3: 'BFA', name: { common: 'Burkina Faso' } },
    { cca3: 'BDI', name: { common: 'Burundi' } },
    { cca3: 'KHM', name: { common: 'Cambodia' } },
    { cca3: 'CMR', name: { common: 'Cameroon' } },
    { cca3: 'CAN', name: { common: 'Canada' } },
    { cca3: 'CPV', name: { common: 'Cape Verde' } },
    { cca3: 'CAF', name: { common: 'Central African Republic' } },
    { cca3: 'TCD', name: { common: 'Chad' } },
    { cca3: 'CHL', name: { common: 'Chile' } },
    { cca3: 'CHN', name: { common: 'China' } },
    { cca3: 'COL', name: { common: 'Colombia' } },
    { cca3: 'COM', name: { common: 'Comoros' } },
    { cca3: 'COG', name: { common: 'Congo' } },
    { cca3: 'COD', name: { common: 'Democratic Republic of the Congo' } },
    { cca3: 'CRI', name: { common: 'Costa Rica' } },
    { cca3: 'CIV', name: { common: 'Côte d\'Ivoire' } },
    { cca3: 'HRV', name: { common: 'Croatia' } },
    { cca3: 'CUB', name: { common: 'Cuba' } },
    { cca3: 'CYP', name: { common: 'Cyprus' } },
    { cca3: 'CZE', name: { common: 'Czech Republic' } },
    { cca3: 'DNK', name: { common: 'Denmark' } },
    { cca3: 'DJI', name: { common: 'Djibouti' } },
    { cca3: 'DMA', name: { common: 'Dominica' } },
    { cca3: 'DOM', name: { common: 'Dominican Republic' } },
    { cca3: 'ECU', name: { common: 'Ecuador' } },
    { cca3: 'EGY', name: { common: 'Egypt' } },
    { cca3: 'SLV', name: { common: 'El Salvador' } },
    { cca3: 'GNQ', name: { common: 'Equatorial Guinea' } },
    { cca3: 'ERI', name: { common: 'Eritrea' } },
    { cca3: 'EST', name: { common: 'Estonia' } },
    { cca3: 'ETH', name: { common: 'Ethiopia' } },
    { cca3: 'FJI', name: { common: 'Fiji' } },
    { cca3: 'FIN', name: { common: 'Finland' } },
    { cca3: 'FRA', name: { common: 'France' } },
    { cca3: 'GAB', name: { common: 'Gabon' } },
    { cca3: 'GMB', name: { common: 'Gambia' } },
    { cca3: 'GEO', name: { common: 'Georgia' } },
    { cca3: 'DEU', name: { common: 'Germany' } },
    { cca3: 'GHA', name: { common: 'Ghana' } },
    { cca3: 'GRC', name: { common: 'Greece' } },
    { cca3: 'GRD', name: { common: 'Grenada' } },
    { cca3: 'GTM', name: { common: 'Guatemala' } },
    { cca3: 'GIN', name: { common: 'Guinea' } },
    { cca3: 'GNB', name: { common: 'Guinea-Bissau' } },
    { cca3: 'GUY', name: { common: 'Guyana' } },
    { cca3: 'HTI', name: { common: 'Haiti' } },
    { cca3: 'HND', name: { common: 'Honduras' } },
    { cca3: 'HUN', name: { common: 'Hungary' } },
    { cca3: 'ISL', name: { common: 'Iceland' } },
    { cca3: 'IND', name: { common: 'India' } },
    { cca3: 'IDN', name: { common: 'Indonesia' } },
    { cca3: 'IRN', name: { common: 'Iran' } },
    { cca3: 'IRQ', name: { common: 'Iraq' } },
    { cca3: 'IRL', name: { common: 'Ireland' } },
    { cca3: 'ISR', name: { common: 'Israel' } },
    { cca3: 'ITA', name: { common: 'Italy' } },
    { cca3: 'JAM', name: { common: 'Jamaica' } },
    { cca3: 'JPN', name: { common: 'Japan' } },
    { cca3: 'JOR', name: { common: 'Jordan' } },
    { cca3: 'KAZ', name: { common: 'Kazakhstan' } },
    { cca3: 'KEN', name: { common: 'Kenya' } },
    { cca3: 'KIR', name: { common: 'Kiribati' } },
    { cca3: 'PRK', name: { common: 'North Korea' } },
    { cca3: 'KOR', name: { common: 'South Korea' } },
    { cca3: 'KWT', name: { common: 'Kuwait' } },
    { cca3: 'KGZ', name: { common: 'Kyrgyzstan' } },
    { cca3: 'LAO', name: { common: 'Laos' } },
    { cca3: 'LVA', name: { common: 'Latvia' } },
    { cca3: 'LBN', name: { common: 'Lebanon' } },
    { cca3: 'LSO', name: { common: 'Lesotho' } },
    { cca3: 'LBR', name: { common: 'Liberia' } },
    { cca3: 'LBY', name: { common: 'Libya' } },
    { cca3: 'LIE', name: { common: 'Liechtenstein' } },
    { cca3: 'LTU', name: { common: 'Lithuania' } },
    { cca3: 'LUX', name: { common: 'Luxembourg' } },
    { cca3: 'MKD', name: { common: 'North Macedonia' } },
    { cca3: 'MDG', name: { common: 'Madagascar' } },
    { cca3: 'MWI', name: { common: 'Malawi' } },
    { cca3: 'MYS', name: { common: 'Malaysia' } },
    { cca3: 'MDV', name: { common: 'Maldives' } },
    { cca3: 'MLI', name: { common: 'Mali' } },
    { cca3: 'MLT', name: { common: 'Malta' } },
    { cca3: 'MHL', name: { common: 'Marshall Islands' } },
    { cca3: 'MRT', name: { common: 'Mauritania' } },
    { cca3: 'MUS', name: { common: 'Mauritius' } },
    { cca3: 'MEX', name: { common: 'Mexico' } },
    { cca3: 'FSM', name: { common: 'Micronesia' } },
    { cca3: 'MDA', name: { common: 'Moldova' } },
    { cca3: 'MCO', name: { common: 'Monaco' } },
    { cca3: 'MNG', name: { common: 'Mongolia' } },
    { cca3: 'MNE', name: { common: 'Montenegro' } },
    { cca3: 'MAR', name: { common: 'Morocco' } },
    { cca3: 'MOZ', name: { common: 'Mozambique' } },
    { cca3: 'MMR', name: { common: 'Myanmar' } },
    { cca3: 'NAM', name: { common: 'Namibia' } },
    { cca3: 'NRU', name: { common: 'Nauru' } },
    { cca3: 'NPL', name: { common: 'Nepal' } },
    { cca3: 'NLD', name: { common: 'Netherlands' } },
    { cca3: 'NZL', name: { common: 'New Zealand' } },
    { cca3: 'NIC', name: { common: 'Nicaragua' } },
    { cca3: 'NER', name: { common: 'Niger' } },
    { cca3: 'NGA', name: { common: 'Nigeria' } },
    { cca3: 'NOR', name: { common: 'Norway' } },
    { cca3: 'OMN', name: { common: 'Oman' } },
    { cca3: 'PAK', name: { common: 'Pakistan' } },
    { cca3: 'PLW', name: { common: 'Palau' } },
    { cca3: 'PAN', name: { common: 'Panama' } },
    { cca3: 'PNG', name: { common: 'Papua New Guinea' } },
    { cca3: 'PRY', name: { common: 'Paraguay' } },
    { cca3: 'PER', name: { common: 'Peru' } },
    { cca3: 'PHL', name: { common: 'Philippines' } },
    { cca3: 'POL', name: { common: 'Poland' } },
    { cca3: 'PRT', name: { common: 'Portugal' } },
    { cca3: 'QAT', name: { common: 'Qatar' } },
    { cca3: 'ROU', name: { common: 'Romania' } },
    { cca3: 'RUS', name: { common: 'Russia' } },
    { cca3: 'RWA', name: { common: 'Rwanda' } },
    { cca3: 'KNA', name: { common: 'Saint Kitts and Nevis' } },
    { cca3: 'LCA', name: { common: 'Saint Lucia' } },
    { cca3: 'VCT', name: { common: 'Saint Vincent and the Grenadines' } },
    { cca3: 'WSM', name: { common: 'Samoa' } },
    { cca3: 'SMR', name: { common: 'San Marino' } },
    { cca3: 'STP', name: { common: 'São Tomé and Príncipe' } },
    { cca3: 'SAU', name: { common: 'Saudi Arabia' } },
    { cca3: 'SEN', name: { common: 'Senegal' } },
    { cca3: 'SRB', name: { common: 'Serbia' } },
    { cca3: 'SYC', name: { common: 'Seychelles' } },
    { cca3: 'SLE', name: { common: 'Sierra Leone' } },
    { cca3: 'SGP', name: { common: 'Singapore' } },
    { cca3: 'SVK', name: { common: 'Slovakia' } },
    { cca3: 'SVN', name: { common: 'Slovenia' } },
    { cca3: 'SLB', name: { common: 'Solomon Islands' } },
    { cca3: 'SOM', name: { common: 'Somalia' } },
    { cca3: 'ZAF', name: { common: 'South Africa' } },
    { cca3: 'SSD', name: { common: 'South Sudan' } },
    { cca3: 'ESP', name: { common: 'Spain' } },
    { cca3: 'LKA', name: { common: 'Sri Lanka' } },
    { cca3: 'SDN', name: { common: 'Sudan' } },
    { cca3: 'SUR', name: { common: 'Suriname' } },
    { cca3: 'SWZ', name: { common: 'Eswatini' } },
    { cca3: 'SWE', name: { common: 'Sweden' } },
    { cca3: 'CHE', name: { common: 'Switzerland' } },
    { cca3: 'SYR', name: { common: 'Syria' } },
    { cca3: 'TWN', name: { common: 'Taiwan' } },
    { cca3: 'TJK', name: { common: 'Tajikistan' } },
    { cca3: 'TZA', name: { common: 'Tanzania' } },
    { cca3: 'THA', name: { common: 'Thailand' } },
    { cca3: 'TLS', name: { common: 'Timor-Leste' } },
    { cca3: 'TGO', name: { common: 'Togo' } },
    { cca3: 'TON', name: { common: 'Tonga' } },
    { cca3: 'TTO', name: { common: 'Trinidad and Tobago' } },
    { cca3: 'TUN', name: { common: 'Tunisia' } },
    { cca3: 'TUR', name: { common: 'Turkey' } },
    { cca3: 'TKM', name: { common: 'Turkmenistan' } },
    { cca3: 'TUV', name: { common: 'Tuvalu' } },
    { cca3: 'UGA', name: { common: 'Uganda' } },
    { cca3: 'UKR', name: { common: 'Ukraine' } },
    { cca3: 'ARE', name: { common: 'United Arab Emirates' } },
    { cca3: 'GBR', name: { common: 'United Kingdom' } },
    { cca3: 'USA', name: { common: 'United States' } },
    { cca3: 'URY', name: { common: 'Uruguay' } },
    { cca3: 'UZB', name: { common: 'Uzbekistan' } },
    { cca3: 'VUT', name: { common: 'Vanuatu' } },
    { cca3: 'VAT', name: { common: 'Vatican City' } },
    { cca3: 'VEN', name: { common: 'Venezuela' } },
    { cca3: 'VNM', name: { common: 'Vietnam' } },
    { cca3: 'YEM', name: { common: 'Yemen' } },
    { cca3: 'ZMB', name: { common: 'Zambia' } },
    { cca3: 'ZWE', name: { common: 'Zimbabwe' } }
  ];

  // Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('App is now online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      console.log('App is now offline');
    };
    
    // Check initial online status
    setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load request tracking data and conversation history from localStorage
  useEffect(() => {
    const data = getRequestData();
    setRequestCount(data.count);
    setRemainingRequests(getRemainingRequests());
    
    // Load conversation history from localStorage
    const savedHistory = localStorage.getItem('conversationHistory');
    const savedConversationId = localStorage.getItem('conversationId');
    const savedVisaInfo = localStorage.getItem('latestVisaInfo');
    const savedSuggestions = localStorage.getItem('latestSuggestions');
    
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setConversationHistory(parsedHistory);
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
    }
    
    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
    
    if (savedVisaInfo) {
      setVisaInfo(savedVisaInfo);
    }
    
    if (savedSuggestions) {
      try {
        const parsedSuggestions = JSON.parse(savedSuggestions);
        setSuggestions(parsedSuggestions);
      } catch (error) {
        console.error('Error loading suggestions:', error);
      }
    }
  }, []);

  // Fetch country data for the dropdowns
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountriesLoading(true);
        
        // If offline, use static list immediately
        if (!navigator.onLine) {
          console.log('Offline detected, using static countries list');
          setCountries(staticCountries);
          setCountriesLoading(false);
          return;
        }
        
        // Try alternative API first
        try {
          const response = await axios.get('https://countriesnow.space/api/v0.1/countries', {
            timeout: 5000 // 5 second timeout
          });
          if (response.data && response.data.data) {
            const apiCountries = response.data.data.map((country: any) => ({
              cca3: country.iso3 || country.iso2 || 'UNK',
              name: { common: country.country }
            }));
            setCountries(apiCountries);
            console.log('Loaded countries from API:', apiCountries.length);
            return;
          }
        } catch (apiError) {
          console.log('API failed, using static list');
        }
        
        // Fallback to static list
        setCountries(staticCountries);
        console.log('Loaded countries from static list:', staticCountries.length);
        
      } catch (error) {
        console.error('Error loading countries:', error);
        // Use static list as final fallback
        setCountries(staticCountries);
        console.log('Using static countries as fallback');
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Filter countries based on search term
  const getFilteredCountries = (searchTerm: string) => {
    if (!searchTerm) return countries.slice(0, 10); // Show first 10 if no search
    return countries
      .filter(country => 
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 10); // Limit to 10 results
  };

  // Handle country selection
  const handleCountrySelect = (countryName: string, field: 'passport' | 'travelFrom' | 'travelTo' | 'transit' | 'secondTransit') => {
    switch (field) {
      case 'passport':
        setPassportFrom(countryName);
        setPassportSearch(countryName);
        setShowPassportDropdown(false);
        setPassportSelectedIndex(-1);
        break;
      case 'travelFrom':
        setTravelFrom(countryName);
        setTravelFromSearch(countryName);
        setShowTravelFromDropdown(false);
        setTravelFromSelectedIndex(-1);
        break;
      case 'travelTo':
        setTravelTo(countryName);
        setTravelToSearch(countryName);
        setShowTravelToDropdown(false);
        setTravelToSelectedIndex(-1);
        break;
      case 'transit':
        setTransitCountry(countryName);
        setTransitSearch(countryName);
        setShowTransitDropdown(false);
        setTransitSelectedIndex(-1);
        break;
      case 'secondTransit':
        setSecondTransitCountry(countryName);
        setSecondTransitSearch(countryName);
        setShowSecondTransitDropdown(false);
        setSecondTransitSelectedIndex(-1);
        break;
    }
  };

  // Handle search input changes
  const handleSearchChange = (value: string, field: 'passport' | 'travelFrom' | 'travelTo' | 'transit' | 'secondTransit') => {
    switch (field) {
      case 'passport':
        setPassportSearch(value);
        setShowPassportDropdown(true);
        setPassportSelectedIndex(-1);
        if (!value) setPassportFrom('');
        break;
      case 'travelFrom':
        setTravelFromSearch(value);
        setShowTravelFromDropdown(true);
        setTravelFromSelectedIndex(-1);
        if (!value) setTravelFrom('');
        break;
      case 'travelTo':
        setTravelToSearch(value);
        setShowTravelToDropdown(true);
        setTravelToSelectedIndex(-1);
        if (!value) setTravelTo('');
        break;
      case 'transit':
        setTransitSearch(value);
        setShowTransitDropdown(true);
        setTransitSelectedIndex(-1);
        if (!value) setTransitCountry('');
        break;
      case 'secondTransit':
        setSecondTransitSearch(value);
        setShowSecondTransitDropdown(true);
        setSecondTransitSelectedIndex(-1);
        if (!value) setSecondTransitCountry('');
        break;
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, field: 'passport' | 'travelFrom' | 'travelTo' | 'transit' | 'secondTransit') => {
    const filteredCountries = getFilteredCountries(
      field === 'passport' ? passportSearch :
      field === 'travelFrom' ? travelFromSearch :
      field === 'travelTo' ? travelToSearch : 
      field === 'transit' ? transitSearch : secondTransitSearch
    );

    let currentIndex = -1;
    let setSelectedIndex = (index: number) => {};

    switch (field) {
      case 'passport':
        currentIndex = passportSelectedIndex;
        setSelectedIndex = setPassportSelectedIndex;
        break;
      case 'travelFrom':
        currentIndex = travelFromSelectedIndex;
        setSelectedIndex = setTravelFromSelectedIndex;
        break;
      case 'travelTo':
        currentIndex = travelToSelectedIndex;
        setSelectedIndex = setTravelToSelectedIndex;
        break;
      case 'transit':
        currentIndex = transitSelectedIndex;
        setSelectedIndex = setTransitSelectedIndex;
        break;
      case 'secondTransit':
        currentIndex = secondTransitSelectedIndex;
        setSelectedIndex = setSecondTransitSelectedIndex;
        break;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = currentIndex < filteredCountries.length - 1 ? currentIndex + 1 : 0;
      setSelectedIndex(nextIndex);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredCountries.length - 1;
      setSelectedIndex(prevIndex);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (currentIndex >= 0 && currentIndex < filteredCountries.length) {
        const selectedCountry = filteredCountries[currentIndex];
        handleCountrySelect(selectedCountry.name.common, field);
      }
    } else if (event.key === 'Escape') {
      switch (field) {
        case 'passport':
          setShowPassportDropdown(false);
          break;
        case 'travelFrom':
          setShowTravelFromDropdown(false);
          break;
        case 'travelTo':
          setShowTravelToDropdown(false);
          break;
        case 'transit':
          setShowTransitDropdown(false);
          break;
        case 'secondTransit':
          setShowSecondTransitDropdown(false);
          break;
      }
      setSelectedIndex(-1);
    }
  };

  // Handle form submission with AI agent functionality
  const handleSubmit = async () => {
    // In test mode, short-circuit to speed up and avoid strict validation
    if (process.env.NEXT_PUBLIC_TEST_MODE === '1') {
      const userQuery = `Test mode query for ${passportFrom || 'Unknown passport'} from ${travelFrom || 'Unknown'} to ${travelTo || 'Unknown'} via ${transitCountry || 'Transit'}`;
      const historyWithUserQuery: Array<{role: 'user' | 'assistant', content: string}> = [...conversationHistory, { role: 'user' as const, content: userQuery }];
      setConversationHistory(historyWithUserQuery);
      localStorage.setItem('conversationHistory', JSON.stringify(historyWithUserQuery));

      const stubInfo = 'Test mode: visa info response. No visa required for short transit. Always verify with official sources.';
      setVisaInfo(stubInfo);
      const updatedHistory: Array<{role: 'user' | 'assistant', content: string}> = [...historyWithUserQuery, { role: 'assistant' as const, content: stubInfo }];
      setConversationHistory(updatedHistory);
      localStorage.setItem('conversationHistory', JSON.stringify(updatedHistory));
      localStorage.setItem('conversationId', 'test-conv');
      localStorage.setItem('latestVisaInfo', stubInfo);
      localStorage.setItem('latestSuggestions', JSON.stringify(['What documents are needed?', 'Transit rules?', 'Max stay without visa?']));
      return;
    }

    // Check if offline
    if (!isOnline) {
      setError('📡 No internet connection. Please check your internet connection and try again.');
      return;
    }
    
    // Check rate limit from localStorage
    if (hasReachedLimit()) {
      setError(`You have reached the maximum of ${REQUEST_LIMIT} free requests. Your limit will reset on ${formatResetDate()}.`);
      return;
    }
    
    const isSingleLayover = layoverType === 'single';
    const hasRequiredFields = passportFrom && travelFrom && travelTo && transitCountry && layoverDuration && willLeaveAirport;
    const hasMultipleLayoverFields = isSingleLayover || (secondTransitCountry && secondLayoverDuration && secondWillLeaveAirport);
    
    if (hasRequiredFields && hasMultipleLayoverFields) {
      setIsLoading(true);
      setError(null);
      
      const airportStatus = willLeaveAirport === 'yes' ? 'plan to leave the airport' : 'will stay in the airport transit area';
      const secondAirportStatus = secondWillLeaveAirport === 'yes' ? 'plan to leave the airport' : 'will stay in the airport transit area';
      
      let userQuery;
      if (isSingleLayover) {
        userQuery = `I have a ${passportFrom} passport, traveling from ${travelFrom} to ${travelTo} with a ${layoverDuration}-hour layover in ${transitCountry}. I ${airportStatus}. What are my visa requirements?`;
      } else {
        userQuery = `I have a ${passportFrom} passport, traveling from ${travelFrom} to ${travelTo} with two layovers: a ${layoverDuration}-hour layover in ${transitCountry} (I ${airportStatus}) and a ${secondLayoverDuration}-hour layover in ${secondTransitCountry} (I ${secondAirportStatus}). What are my visa requirements?`;
      }
      
      // Add user query to conversation history
      const historyWithUserQuery: Array<{role: 'user' | 'assistant', content: string}> = [...conversationHistory, { role: 'user' as const, content: userQuery }];
      setConversationHistory(historyWithUserQuery);
      localStorage.setItem('conversationHistory', JSON.stringify(historyWithUserQuery));
      
      try {
        // Prepare request payload - include second layover if multiple
        const requestPayload: any = {
          passportFrom,
          travelFrom,
          travelTo,
          transitCountry,
          layoverDuration,
          willLeaveAirport,
          conversationId,
          conversationHistory: conversationHistory.slice(-5) // Send last 5 messages for context
        };

        // Add second layover details if multiple layovers
        if (layoverType === 'multiple') {
          requestPayload.secondTransitCountry = secondTransitCountry;
          requestPayload.secondLayoverDuration = secondLayoverDuration;
          requestPayload.secondWillLeaveAirport = secondWillLeaveAirport;
        }

        const response = await axios.post<VisaInfoResponse>('/api/visa-info', requestPayload);
        
        setVisaInfo(response.data.visaInfo);
        setConversationId(response.data.conversationId || null);
        setSuggestions(response.data.suggestions || []);
        
        // Add AI response to conversation history (use historyWithUserQuery which already has the user message)
        const updatedHistory: Array<{role: 'user' | 'assistant', content: string}> = [...historyWithUserQuery, { role: 'assistant' as const, content: response.data.visaInfo }];
        setConversationHistory(updatedHistory);
        
        // Save to localStorage
        localStorage.setItem('conversationHistory', JSON.stringify(updatedHistory));
        localStorage.setItem('conversationId', response.data.conversationId || '');
        localStorage.setItem('latestVisaInfo', response.data.visaInfo);
        localStorage.setItem('latestSuggestions', JSON.stringify(response.data.suggestions || []));
        
        // Increment request count in localStorage
        const updatedData = incrementRequestCount();
        setRequestCount(updatedData.count);
        setRemainingRequests(getRemainingRequests());
        
      } catch (error) {
        console.error('Error fetching visa information:', error);
        
        // Check if it's a network error
        if (error instanceof Error && (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK'))) {
          setError('📡 Network error. Please check your internet connection and try again.');
        } else if (error instanceof Error && error.message.includes('timeout')) {
          setError('⏱️ Request timed out. Please check your internet connection and try again.');
        } else {
          setError('Sorry, I encountered an error while processing your request. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      if (layoverType === 'multiple' && (!secondTransitCountry || !secondLayoverDuration || !secondWillLeaveAirport)) {
        setError('Please fill in all fields for both layovers, including the layover durations and whether you will leave the airport.');
      } else {
        setError('Please fill in all fields, including the layover duration and whether you will leave the airport.');
      }
    }
  };

  // Handle follow-up questions
  const handleFollowUp = async (question: string) => {
    // Check if offline
    if (!isOnline) {
      setError('📡 No internet connection. Please check your internet connection and try again.');
      return;
    }
    
    // Check rate limit from localStorage
    if (hasReachedLimit()) {
      setError(`You have reached the maximum of ${REQUEST_LIMIT} free requests. Your limit will reset on ${formatResetDate()}.`);
      return;
    }
    
    console.log('Follow-up question clicked:', question);
    setIsLoading(true);
    setError(null);
    
    // Add user question to conversation history
    const historyWithQuestion: Array<{role: 'user' | 'assistant', content: string}> = [...conversationHistory, { role: 'user' as const, content: question }];
    setConversationHistory(historyWithQuestion);
    localStorage.setItem('conversationHistory', JSON.stringify(historyWithQuestion));
    
    try {
      const response = await axios.post<VisaInfoResponse>('/api/visa-info', {
        followUpQuestion: question,
        conversationId,
        conversationHistory: historyWithQuestion.slice(-5) // Use updated history
      });
      
      setVisaInfo(response.data.visaInfo);
      setConversationId(response.data.conversationId || null);
      setSuggestions(response.data.suggestions || []);
      
      // Add AI response to conversation history (use historyWithQuestion which already has the user question)
      const updatedHistory: Array<{role: 'user' | 'assistant', content: string}> = [...historyWithQuestion, { role: 'assistant' as const, content: response.data.visaInfo }];
      setConversationHistory(updatedHistory);
      
      // Save to localStorage
      localStorage.setItem('conversationHistory', JSON.stringify(updatedHistory));
      localStorage.setItem('conversationId', response.data.conversationId || '');
      localStorage.setItem('latestVisaInfo', response.data.visaInfo);
      localStorage.setItem('latestSuggestions', JSON.stringify(response.data.suggestions || []));
      
      // Increment request count in localStorage
      const updatedData = incrementRequestCount();
      setRequestCount(updatedData.count);
      setRemainingRequests(getRemainingRequests());
      
    } catch (error) {
      console.error('Error processing follow-up question:', error);
      
      // Check if it's a network error
      if (error instanceof Error && (error.message.includes('Network Error') || error.message.includes('ERR_NETWORK'))) {
        setError('📡 Network error. Please check your internet connection and try again.');
      } else if (error instanceof Error && error.message.includes('timeout')) {
        setError('⏱️ Request timed out. Please check your internet connection and try again.');
      } else {
        setError('Sorry, I encountered an error while processing your question. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for loading a conversation from sidebar
  const handleLoadConversation = (messages: Array<{role: 'user' | 'assistant', content: string}>, sessionId: string) => {
    setConversationHistory(messages);
    setConversationId(sessionId);
    
    // Set the latest visa info and suggestions
    const lastAssistantMessage = [...messages].reverse().find(msg => msg.role === 'assistant');
    if (lastAssistantMessage) {
      setVisaInfo(lastAssistantMessage.content);
    }
    
    // Parse the first user message to auto-fill form fields
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      const query = firstUserMessage.content;
      
      // Extract passport country (e.g., "I have a US passport")
      const passportMatch = query.match(/I have (?:a|an) ([A-Za-z\s]+) passport/i);
      if (passportMatch) {
        setPassportFrom(passportMatch[1].trim());
      }
      
      // Extract traveling from (e.g., "traveling from NYC")
      const fromMatch = query.match(/traveling from ([A-Za-z\s]+) to/i);
      if (fromMatch) {
        setTravelFrom(fromMatch[1].trim());
      }
      
      // Extract traveling to (e.g., "to London")
      const toMatch = query.match(/to ([A-Za-z\s]+) with/i);
      if (toMatch) {
        setTravelTo(toMatch[1].trim());
      }
      
      // Check for single or multiple layovers
      if (query.includes('two layovers')) {
        setLayoverType('multiple');
        
        // Extract first layover info
        const firstLayoverMatch = query.match(/(\d+)-hour layover in ([A-Za-z\s]+) \(I (will leave the airport|will not leave the airport)\)/i);
        if (firstLayoverMatch) {
          setLayoverDuration(firstLayoverMatch[1]);
          setTransitCountry(firstLayoverMatch[2].trim());
          setWillLeaveAirport(firstLayoverMatch[3] === 'will leave the airport' ? 'yes' : 'no');
        }
        
        // Extract second layover info
        const secondLayoverMatch = query.match(/and a (\d+)-hour layover in ([A-Za-z\s]+) \(I (will leave the airport|will not leave the airport)\)/i);
        if (secondLayoverMatch) {
          setSecondLayoverDuration(secondLayoverMatch[1]);
          setSecondTransitCountry(secondLayoverMatch[2].trim());
          setSecondWillLeaveAirport(secondLayoverMatch[3] === 'will leave the airport' ? 'yes' : 'no');
        }
      } else {
        setLayoverType('single');
        
        // Extract single layover info
        const layoverMatch = query.match(/(\d+)-hour layover in ([A-Za-z\s]+)\. I (will leave the airport|will not leave the airport)/i);
        if (layoverMatch) {
          setLayoverDuration(layoverMatch[1]);
          setTransitCountry(layoverMatch[2].trim());
          setWillLeaveAirport(layoverMatch[3] === 'will leave the airport' ? 'yes' : 'no');
        }
      }
    }
    
    // Load from localStorage if available
    localStorage.setItem('conversationHistory', JSON.stringify(messages));
    localStorage.setItem('conversationId', sessionId);
    
    // Set flag to show "loaded from history" indicator
    setIsLoadedFromHistory(true);
    
    // Auto-clear the indicator after 3 seconds
    setTimeout(() => {
      setIsLoadedFromHistory(false);
    }, 3000);
  };

  // Handler for starting a new conversation
  const handleNewConversation = () => {
    // Clear conversation data
    setConversationHistory([]);
    setVisaInfo(null);
    setSuggestions([]);
    setConversationId(null);
    
    // Clear form fields
    setPassportFrom('');
    setTravelFrom('');
    setTravelTo('');
    setTransitCountry('');
    setLayoverDuration('');
    setWillLeaveAirport('');
    setLayoverType('single');
    setSecondTransitCountry('');
    setSecondLayoverDuration('');
    setSecondWillLeaveAirport('');
    setError(null);
    setIsLoadedFromHistory(false);
    
    // Clear localStorage
    localStorage.removeItem('conversationHistory');
    localStorage.removeItem('conversationId');
    localStorage.removeItem('latestVisaInfo');
    localStorage.removeItem('latestSuggestions');
    localStorage.removeItem('currentSessionId');
  };

  // Function to display visa information in a structured way
  const formatVisaInfo = (info: string) => {
    const lines = info.split('\n');
    const formattedLines: JSX.Element[] = [];
    let currentSection = '';
    let currentList: string[] = [];
    
    const flushList = () => {
      if (currentList.length > 0) {
        formattedLines.push(
          <ul key={`list-${formattedLines.length}`} className={styles.visaInfoList}>
            {currentList.map((item, idx) => (
              <li key={idx} className={styles.visaInfoListItem}>
                {formatText(item)}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };
    
    const formatText = (text: string) => {
      // Handle bold text **text**
      let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Handle markdown-style links [text](url) - convert to React components
      const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = markdownLinkRegex.exec(text)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
          const beforeText = text.slice(lastIndex, match.index);
          parts.push(
            <span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: beforeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          );
        }
        
        // Add the link
        parts.push(
          <a 
            key={`link-${match.index}`}
            href={match[2]} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.link}
          >
            {match[1]}
          </a>
        );
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text
      if (lastIndex < text.length) {
        const remainingText = text.slice(lastIndex);
        parts.push(
          <span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: remainingText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        );
      }
      
      // If no markdown links found, handle plain URLs
      if (parts.length === 0) {
        const urlMatch = formatted.match(/(https?:\/\/[^\s]+)/g);
      if (urlMatch) {
          const urlParts = formatted.split(urlMatch[0]);
        return (
            <>
              <span dangerouslySetInnerHTML={{ __html: urlParts[0] }} />
            <a href={urlMatch[0]} target="_blank" rel="noopener noreferrer" className={styles.link}>
                🔗 {urlMatch[0]}
              </a>
              <span dangerouslySetInnerHTML={{ __html: urlParts[1] || '' }} />
            </>
          );
        }
        return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
      }
      
      return <>{parts}</>;
    };
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle headers (### or ####)
      if (trimmedLine.startsWith('###')) {
        flushList();
        const headerText = trimmedLine.replace(/^#+\s*/, '');
        formattedLines.push(
          <h3 key={`header-${index}`} className={styles.visaInfoHeader}>
            {formatText(headerText)}
          </h3>
        );
      }
      // Handle bullet points (- or *)
      else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        currentList.push(trimmedLine.substring(2));
      }
      // Handle numbered lists
      else if (/^\d+\.\s/.test(trimmedLine)) {
        flushList();
        const listItem = trimmedLine.replace(/^\d+\.\s/, '');
        formattedLines.push(
          <div key={`numbered-${index}`} className={styles.visaInfoNumberedItem}>
            {formatText(listItem)}
          </div>
        );
      }
      // Handle regular paragraphs
      else if (trimmedLine) {
        flushList();
        formattedLines.push(
          <p key={`para-${index}`} className={styles.visaInfoPoint}>
            {formatText(trimmedLine)}
          </p>
        );
      }
      // Handle empty lines
      else {
        flushList();
        formattedLines.push(<br key={`br-${index}`} />);
      }
    });
    
    flushList();
    return formattedLines;
  };

  return (
    <div>
      <NavbarPages />
      
      {/* Conversation Sidebar */}
      <ConversationSidebar
        currentConversation={conversationHistory}
        onLoadConversation={handleLoadConversation}
        onNewConversation={handleNewConversation}
      />
      

      {/* Main Content Container */}
    <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Visa Information</h1>
            <p className={styles.pageSubtitle}>
              Get visa requirements for your international travel
            </p>
          </div>
          <div className={styles.requestCounter}>
            <span>{remainingRequests} / {REQUEST_LIMIT} requests</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>· Resets {formatResetDate()}</span>
          </div>
        </div>

      {/* Loaded from History Indicator */}
      {isLoadedFromHistory && (
        <div className={styles.historyIndicator}>
          <span className={styles.historyText}>✓ Form restored from history</span>
        </div>
      )}

      {/* Form Section */}
      <div className={styles.formSection}>
        {/* Passport From Country Search */}
        <div className={styles.searchContainer}>
        <label className={styles.label}>
          Country your passport is from:
          </label>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              value={passportSearch}
              onChange={(e) => handleSearchChange(e.target.value, 'passport')}
              onFocus={() => setShowPassportDropdown(true)}
              onKeyDown={(e) => handleKeyDown(e, 'passport')}
              className={`${styles.searchInput} ${passportFrom ? styles.selectedInput : ''}`}
              placeholder={countriesLoading ? "Loading countries..." : "Search for a country..."}
              disabled={isLoading || countriesLoading}
            />
            {passportFrom && (
              <div className={styles.selectedIndicator}>
                ✓ {passportFrom}
              </div>
            )}
            {showPassportDropdown && (
              <div className={styles.searchDropdown}>
                {getFilteredCountries(passportSearch).map((country, index) => (
                  <div
                    key={country.cca3}
                    className={`${styles.searchOption} ${index === passportSelectedIndex ? styles.selectedOption : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCountrySelect(country.name.common, 'passport');
                    }}
                    onMouseEnter={() => setPassportSelectedIndex(index)}
                  >
                {country.name.common}
                  </div>
                ))}
                {getFilteredCountries(passportSearch).length === 0 && (
                  <div className={styles.noResults}>No countries found</div>
                )}
              </div>
            )}
          </div>
      </div>

        {/* Travelling From Country Search */}
        <div className={styles.searchContainer}>
        <label className={styles.label}>
          Travelling from:
          </label>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              value={travelFromSearch}
              onChange={(e) => handleSearchChange(e.target.value, 'travelFrom')}
              onFocus={() => setShowTravelFromDropdown(true)}
              onKeyDown={(e) => handleKeyDown(e, 'travelFrom')}
              className={`${styles.searchInput} ${travelFrom ? styles.selectedInput : ''}`}
              placeholder={countriesLoading ? "Loading countries..." : "Search for a country..."}
              disabled={isLoading || countriesLoading}
            />
            {travelFrom && (
              <div className={styles.selectedIndicator}>
                ✓ {travelFrom}
              </div>
            )}
            {showTravelFromDropdown && (
              <div className={styles.searchDropdown}>
                {getFilteredCountries(travelFromSearch).map((country, index) => (
                  <div
                    key={country.cca3}
                    className={`${styles.searchOption} ${index === travelFromSelectedIndex ? styles.selectedOption : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCountrySelect(country.name.common, 'travelFrom');
                    }}
                    onMouseEnter={() => setTravelFromSelectedIndex(index)}
                  >
                {country.name.common}
                  </div>
                ))}
                {getFilteredCountries(travelFromSearch).length === 0 && (
                  <div className={styles.noResults}>No countries found</div>
                )}
              </div>
            )}
          </div>
      </div>

        {/* Travelling To Country Search */}
        <div className={styles.searchContainer}>
        <label className={styles.label}>
          Travelling to:
          </label>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              value={travelToSearch}
              onChange={(e) => handleSearchChange(e.target.value, 'travelTo')}
              onFocus={() => setShowTravelToDropdown(true)}
              onKeyDown={(e) => handleKeyDown(e, 'travelTo')}
              className={`${styles.searchInput} ${travelTo ? styles.selectedInput : ''}`}
              placeholder={countriesLoading ? "Loading countries..." : "Search for a country..."}
              disabled={isLoading || countriesLoading}
            />
            {travelTo && (
              <div className={styles.selectedIndicator}>
                ✓ {travelTo}
              </div>
            )}
            {showTravelToDropdown && (
              <div className={styles.searchDropdown}>
                {getFilteredCountries(travelToSearch).map((country, index) => (
                  <div
                    key={country.cca3}
                    className={`${styles.searchOption} ${index === travelToSelectedIndex ? styles.selectedOption : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCountrySelect(country.name.common, 'travelTo');
                    }}
                    onMouseEnter={() => setTravelToSelectedIndex(index)}
                  >
                {country.name.common}
                  </div>
                ))}
                {getFilteredCountries(travelToSearch).length === 0 && (
                  <div className={styles.noResults}>No countries found</div>
                )}
              </div>
            )}
          </div>
      </div>

      {/* Layover Count Selection */}
      <div>
        <label className={styles.label}>
          Number of layovers:
        </label>
        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="layoverType"
              value="single"
              checked={layoverType === 'single'}
              onChange={(e) => setLayoverType(e.target.value)}
              disabled={isLoading}
              className={styles.radioInput}
            />
            <span className={styles.radioLabel}>1 layover</span>
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="layoverType"
              value="multiple"
              checked={layoverType === 'multiple'}
              onChange={(e) => setLayoverType(e.target.value)}
              disabled={isLoading}
              className={styles.radioInput}
            />
            <span className={styles.radioLabel}>2 layovers</span>
          </label>
        </div>
      </div>

        {/* Transit Country Search */}
        <div className={`${styles.searchContainer} ${styles.searchContainerWithSpacing}`}>
        <label className={styles.label}>
          Transit country:
          {transitCountry && (
            <span className={styles.layoverCounter}>1</span>
          )}
          </label>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              value={transitSearch}
              onChange={(e) => handleSearchChange(e.target.value, 'transit')}
              onFocus={() => setShowTransitDropdown(true)}
              onKeyDown={(e) => handleKeyDown(e, 'transit')}
              className={`${styles.searchInput} ${transitCountry ? styles.selectedInput : ''}`}
              placeholder={countriesLoading ? "Loading countries..." : "Search for a country..."}
              disabled={isLoading || countriesLoading}
            />
            {transitCountry && (
              <div className={styles.selectedIndicator}>
                ✓ {transitCountry}
              </div>
            )}
            {showTransitDropdown && (
              <div className={styles.searchDropdown}>
                {getFilteredCountries(transitSearch).map((country, index) => (
                  <div
                    key={country.cca3}
                    className={`${styles.searchOption} ${index === transitSelectedIndex ? styles.selectedOption : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCountrySelect(country.name.common, 'transit');
                    }}
                    onMouseEnter={() => setTransitSelectedIndex(index)}
                  >
                {country.name.common}
                  </div>
                ))}
                {getFilteredCountries(transitSearch).length === 0 && (
                  <div className={styles.noResults}>No countries found</div>
                )}
              </div>
            )}
          </div>
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
              disabled={isLoading}
          />
        </label>
      </div>

        {/* Will you leave the airport */}
        <div>
          <label className={styles.label}>
            Will you leave the airport during your layover?
          </label>
          <div className={styles.radioGroup}>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="willLeaveAirport"
                value="yes"
                checked={willLeaveAirport === 'yes'}
                onChange={(e) => setWillLeaveAirport(e.target.value)}
                disabled={isLoading}
                className={styles.radioInput}
              />
              <span className={styles.radioLabel}>Yes, I plan to leave the airport</span>
            </label>
            <label className={styles.radioOption}>
              <input
                type="radio"
                name="willLeaveAirport"
                value="no"
                checked={willLeaveAirport === 'no'}
                onChange={(e) => setWillLeaveAirport(e.target.value)}
                disabled={isLoading}
                className={styles.radioInput}
              />
              <span className={styles.radioLabel}>No, I will stay in the transit area</span>
            </label>
          </div>
      </div>

      {/* Second Layover Fields - Show when 2 layovers is selected */}
      {layoverType === 'multiple' && (
        <>
          {/* Divider between layovers */}
          <div style={{ margin: '40px 0 20px 0', borderTop: '2px solid #334155' }} />
          
          {/* Second Transit Country Search */}
          <div className={styles.searchContainer}>
            <label className={`${styles.label} ${styles.labelWithSpacing}`}>
              Transit country:
              <span className={styles.layoverCounter}>2</span>
            </label>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                value={secondTransitSearch}
                onChange={(e) => handleSearchChange(e.target.value, 'secondTransit')}
                onFocus={() => setShowSecondTransitDropdown(true)}
                onKeyDown={(e) => handleKeyDown(e, 'secondTransit')}
                className={`${styles.searchInput} ${secondTransitCountry ? styles.selectedInput : ''}`}
                placeholder={countriesLoading ? "Loading countries..." : "Search for a country..."}
                disabled={isLoading || countriesLoading}
              />
              {secondTransitCountry && (
                <div className={styles.selectedIndicator}>
                  ✓ {secondTransitCountry}
                </div>
              )}
              {showSecondTransitDropdown && (
                <div className={styles.searchDropdown}>
                  {getFilteredCountries(secondTransitSearch).map((country, index) => (
                    <div
                      key={country.cca3}
                      className={`${styles.searchOption} ${index === secondTransitSelectedIndex ? styles.selectedOption : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCountrySelect(country.name.common, 'secondTransit');
                      }}
                      onMouseEnter={() => setSecondTransitSelectedIndex(index)}
                    >
                      {country.name.common}
                    </div>
                  ))}
                  {getFilteredCountries(secondTransitSearch).length === 0 && (
                    <div className={styles.noResults}>No countries found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Second Layover Duration */}
          <div>
            <label className={styles.label}>
              Duration of the second layover (in hours):
              <input
                type="number"
                value={secondLayoverDuration}
                onChange={(e) => setSecondLayoverDuration(e.target.value)}
                className={styles.input}
                placeholder="Enter second layover duration"
                min="0"
                step="1"
                disabled={isLoading}
              />
            </label>
          </div>

          {/* Second Will you leave the airport */}
          <div>
            <label className={styles.label}>
              Will you leave the airport during your second layover?
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="secondWillLeaveAirport"
                  value="yes"
                  checked={secondWillLeaveAirport === 'yes'}
                  onChange={(e) => setSecondWillLeaveAirport(e.target.value)}
                  disabled={isLoading}
                  className={styles.radioInput}
                />
                <span className={styles.radioLabel}>Yes, I plan to leave the airport</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="secondWillLeaveAirport"
                  value="no"
                  checked={secondWillLeaveAirport === 'no'}
                  onChange={(e) => setSecondWillLeaveAirport(e.target.value)}
                  disabled={isLoading}
                  className={styles.radioInput}
                />
                <span className={styles.radioLabel}>No, I will stay in the transit area</span>
              </label>
            </div>
          </div>
        </>
      )}

      {/* Submit Button */}
        <div>
          {requestCount > 0 && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '12px', 
              color: requestCount >= REQUEST_LIMIT ? '#ef4444' : '#94a3b8',
              fontSize: '0.9rem'
            }}>
              Requests used: {requestCount} / {REQUEST_LIMIT}
            </div>
          )}
          <button 
            onClick={handleSubmit} 
            className={styles.button}
            disabled={isLoading || requestCount >= REQUEST_LIMIT}
          >
            {isLoading ? (
              <>
                <span className={styles.loadingSpinner}></span>
                Processing...
              </>
            ) : requestCount >= REQUEST_LIMIT ? (
              'Request Limit Reached'
            ) : (
              'Get Travel Information'
            )}
      </button>
        </div>

        {/* Offline Status Indicator */}
        {!isOnline && (
          <div className={styles.offlineIndicator}>
            📡 You're currently offline. Some features may not work properly.
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
      </div>

      {/* Visa Information Display */}
      {/* Chat Interface */}
      {conversationHistory.length > 0 && (
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              <h2 className={styles.chatHeaderTitle}>Conversation</h2>
              <div className={styles.chatBadge}>{conversationHistory.length}</div>
            </div>
            <div className={styles.jumpToMenu}>
              <button
                className={styles.jumpToMenuButton}
                onClick={() => {
                  const menu = document.querySelector(`.${styles.jumpToDropdown}`);
                  menu?.classList.toggle(styles.jumpToDropdownOpen);
                }}
              >
                📍 Jump to message
              </button>
              <div className={styles.jumpToDropdown}>
                {conversationHistory.map((message, index) => (
                  <button
                    key={index}
                    className={styles.jumpToMenuItem}
                    onClick={() => {
                      const element = document.getElementById(`message-${index}`);
                      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      // Close dropdown
                      const menu = document.querySelector(`.${styles.jumpToDropdown}`);
                      menu?.classList.remove(styles.jumpToDropdownOpen);
                    }}
                  >
                    <span className={styles.jumpToItemIcon}>
                      {message.role === 'user' ? '👤' : '🤖'}
                    </span>
                    <span className={styles.jumpToItemText}>
                      {message.role === 'user' 
                        ? message.content.substring(0, 60) + (message.content.length > 60 ? '...' : '')
                        : `Response #${Math.floor(index / 2) + 1}`
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className={`${styles.chatMessages} chatMessages`} ref={chatMessagesRef}>
            {conversationHistory.map((message, index) => (
              <div 
                key={index} 
                id={`message-${index}`}
                className={`${styles.chatMessage} chatMessage ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
              >
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <div className={styles.messageRole}>
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    <button
                      className={styles.jumpToButton}
                      onClick={() => {
                        const element = document.getElementById(`message-${index}`);
                        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      title="Jump to this message"
                    >
                      #
                    </button>
                  </div>
                  <div className={`${styles.messageText} messageText`}>
                    {message.role === 'assistant' ? formatVisaInfo(message.content) : message.content}
                  </div>
                         {message.role === 'assistant' && index === conversationHistory.length - 1 && suggestions.length > 0 && (
                          <div className={styles.messageSuggestions}>
                            <div className={styles.suggestionsLabel}>Suggested questions</div>
                      <div className={styles.suggestionsChips}>
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.preventDefault();
                              handleFollowUp(suggestion);
                            }}
                            disabled={isLoading}
                            className={styles.suggestionChip}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Scroll to Top Button */}
          {showScrollToTop && (
            <button
              className={styles.scrollToTopButton}
              onClick={scrollToTop}
              title="Scroll to top"
            >
              ↑
            </button>
          )}
        </div>
      )}

      </div>
      
      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>✈️ Travel Info</h3>
            <p className={styles.footerText}>
              AI-powered travel assistant providing accurate visa and transit information for international travelers.
            </p>
            <p className={styles.footerText}>
              Born from a confused student's layover nightmare, built to help you travel stress-free.
            </p>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>🔗 Quick Links</h3>
            <div className={styles.footerLinks}>
              <Link href="/" className={styles.footerLink}>
                <span>→</span> Home
              </Link>
              <Link href="/TravelInfo" className={styles.footerLink}>
                <span>→</span> Get Information
              </Link>
              <Link href="/About" className={styles.footerLink}>
                <span>→</span> About
              </Link>
            </div>
          </div>
          
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>👨‍💻 Connect</h3>
            <p className={styles.footerText}>
              Built by Yash Bhatia, an international student and developer.
            </p>
            <div className={styles.footerSocial}>
              <a href="https://yashcoded.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="Portfolio">
                🌐
              </a>
              <a href="https://github.com/yashcoded" target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="GitHub">
                💻
              </a>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p className={styles.footerCopyright}>
            © {new Date().getFullYear()} Travel Info. Built with ❤️ by <a href="https://yashcoded.com" target="_blank" rel="noopener noreferrer">Yash Bhatia</a>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TravelInfoDetails;
