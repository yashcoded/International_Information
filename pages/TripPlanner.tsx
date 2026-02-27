'use client';

import ReactMarkdown from 'react-markdown';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import NavbarPages from './_NavbarPages';
import styles from './TripPlanner.module.css';
import { COUNTRIES, type Country } from '../lib/countries';

interface AgentPlanStep {
  id: number;
  action: string;
  input: Record<string, unknown>;
}

interface AgentPlan {
  goal: string;
  steps: AgentPlanStep[];
}

interface AgentStepResult {
  id: number;
  action: string;
  input: Record<string, unknown>;
  summary: string;
}

interface PlanTripResponse {
  finalText: string;
  plan: AgentPlan;
  steps: AgentStepResult[];
}

const STORAGE_KEY_PLAN = 'tripPlanner:lastPlan';
const STORAGE_KEY_RESULT = 'tripPlanner:lastResult';

export default function TripPlanner() {
  const [goalText, setGoalText] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [days, setDays] = useState('7');
  const [minBudget, setMinBudget] = useState(500);
  const [maxBudget, setMaxBudget] = useState(3000);
  const [interests, setInterests] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [agentPlan, setAgentPlan] = useState<AgentPlan | null>(null);
  const [agentStepResults, setAgentStepResults] = useState<AgentStepResult[]>([]);
  const [finalSummary, setFinalSummary] = useState<string | null>(null);

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Use a data attribute or class name logic if styles object is not fully accessible in this context 
      // but here styles is imported. However, class names are hashed.
      // We'll rely on a common class name we add manually or check parent structure.
      // For safety, we'll check if the click is NOT inside a search wrapper.
      const target = event.target as HTMLElement;
      if (!target.closest('[data-search-wrapper]')) {
        setShowFromDropdown(false);
        setShowToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilteredCountries = (query: string) => {
    if (!query) return COUNTRIES;
    return COUNTRIES.filter((c) =>
      c.name.common.toLowerCase().includes(query.toLowerCase()),
    );
  };

  useEffect(() => {
    try {
      const storedPlan = localStorage.getItem(STORAGE_KEY_PLAN);
      const storedResult = localStorage.getItem(STORAGE_KEY_RESULT);
      if (storedPlan) {
        setAgentPlan(JSON.parse(storedPlan));
      }
      if (storedResult) {
        const parsed = JSON.parse(storedResult) as {
          steps: AgentStepResult[];
          finalText: string;
        };
        setAgentStepResults(parsed.steps || []);
        setFinalSummary(parsed.finalText || null);
      }
    } catch {
      // ignore
    }
  }, []);

  const handlePlanTrip = async () => {
    if (!goalText.trim()) {
      setError('Please describe what you want to plan.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const travelContext: Record<string, unknown> = {};
      if (from) travelContext.travelFrom = from;
      if (to) travelContext.travelTo = to;
      if (days) travelContext.days = Number(days) || 7;
      
      // Budget range
      const budgetString = `Budget range: $${minBudget} - $${maxBudget}+`;
      (travelContext as any).travelStyle = budgetString;
      
      if (interests) (travelContext as any).interests = interests;

      const response = await axios.post<PlanTripResponse>('/api/plan-trip', {
        goalText,
        travelContext,
      });

      setAgentPlan(response.data.plan);
      setAgentStepResults(response.data.steps);
      setFinalSummary(response.data.finalText);

      try {
        localStorage.setItem(STORAGE_KEY_PLAN, JSON.stringify(response.data.plan));
        localStorage.setItem(
          STORAGE_KEY_RESULT,
          JSON.stringify({
            steps: response.data.steps,
            finalText: response.data.finalText,
          }),
        );
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Error planning trip:', err);
      setError('Sorry, there was a problem planning your trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <NavbarPages />
      <main className={styles.pageContainer}>
        <header className={styles.pageHeader}>
          <div className={styles.titleBlock}>
            <h1 className={styles.pageTitle}>Trip Planner</h1>
            <p className={styles.pageSubtitle}>
              Describe your trip and let the AI plan your route, itinerary, budget, and tips.
            </p>
          </div>
        </header>

        <section className={styles.layout}>
          <div className={styles.leftColumn}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Tell me about your trip</h2>
                <span className={styles.badge}>AI planning</span>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="trip-goal">
                  What would you like to plan?
                </label>
                <textarea
                  id="trip-goal"
                  className={styles.textarea}
                  rows={6}
                  placeholder="Example: Plan a 10-day spring trip from New York to Italy focused on food, history, and a mid-range budget."
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Optional details</label>
                
                <div className={styles.inputRow}>
                  {/* From */}
                  <div className={styles.searchWrapper} data-search-wrapper>
                    <input
                      className={styles.input}
                      placeholder="From (city/country)"
                      value={from}
                      onChange={(e) => {
                        setFrom(e.target.value);
                        setShowFromDropdown(true);
                      }}
                      onFocus={() => setShowFromDropdown(true)}
                      disabled={isLoading}
                    />
                    {showFromDropdown && from.length > 0 && (
                      <ul className={styles.dropdown}>
                        {getFilteredCountries(from).slice(0, 5).map((c) => (
                          <li
                            key={c.cca3}
                            className={styles.dropdownItem}
                            onClick={() => {
                              setFrom(c.name.common);
                              setShowFromDropdown(false);
                            }}
                          >
                            {c.name.common}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* To */}
                  <div className={styles.searchWrapper} data-search-wrapper>
                    <input
                      className={styles.input}
                      placeholder="To (destination)"
                      value={to}
                      onChange={(e) => {
                        setTo(e.target.value);
                        setShowToDropdown(true);
                      }}
                      onFocus={() => setShowToDropdown(true)}
                      disabled={isLoading}
                    />
                    {showToDropdown && to.length > 0 && (
                      <ul className={styles.dropdown}>
                        {getFilteredCountries(to).slice(0, 5).map((c) => (
                          <li
                            key={c.cca3}
                            className={styles.dropdownItem}
                            onClick={() => {
                              setTo(c.name.common);
                              setShowToDropdown(false);
                            }}
                          >
                            {c.name.common}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Days */}
                  <input
                    className={styles.input}
                    placeholder="Days"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    disabled={isLoading}
                    style={{ maxWidth: '80px', textAlign: 'center' }}
                  />
                </div>

                <div className={styles.inputRow} style={{ marginTop: 12 }}>
                  {/* Interests */}
                  <input
                    className={styles.input}
                    placeholder="Interests (food, museums, hiking...)"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    disabled={isLoading}
                    style={{ gridColumn: 'span 3' }}
                  />
                </div>

                {/* Budget Slider */}
                <div style={{ marginTop: 18 }}>
                  <label className={styles.label}>Budget range</label>
                  <div className={styles.sliderWrapper}>
                    <div className={styles.sliderTrack} />
                    <div
                      className={styles.sliderRange}
                      style={{
                        left: `${(minBudget / 10000) * 100}%`,
                        right: `${100 - (maxBudget / 10000) * 100}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={10000}
                      step={100}
                      value={minBudget}
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value), maxBudget - 500);
                        setMinBudget(val);
                      }}
                      className={styles.rangeInput}
                      disabled={isLoading}
                    />
                    <input
                      type="range"
                      min={0}
                      max={10000}
                      step={100}
                      value={maxBudget}
                      onChange={(e) => {
                        const val = Math.max(Number(e.target.value), minBudget + 500);
                        setMaxBudget(val);
                      }}
                      className={styles.rangeInput}
                      disabled={isLoading}
                    />
                  </div>
                  <div className={styles.budgetInputs}>
                    <div className={styles.budgetField}>
                      <span className={styles.budgetLabel}>Min Price</span>
                      <div className={styles.budgetValueDisplay}>${minBudget}</div>
                    </div>
                    <div className={styles.budgetField}>
                      <span className={styles.budgetLabel}>Max Price</span>
                      <div className={styles.budgetValueDisplay}>${maxBudget >= 10000 ? '10000+' : maxBudget}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.primaryButton}
                  onClick={handlePlanTrip}
                  disabled={isLoading}
                >
                  {isLoading ? 'Planning your trip…' : 'Plan my trip'}
                </button>
                <div className={styles.helperText}>
                  The agent will check visas, build an itinerary, estimate budget, and share tips.
                </div>
              </div>

              {error && (
                <div className={styles.helperText} style={{ color: '#fca5a5', marginTop: 8 }}>
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className={styles.rightColumn}>
            {agentPlan ? (
              <div className={styles.card}>
                <div className={styles.stepsHeader}>
                  <div>
                    <div className={styles.stepsTitle}>Plan steps</div>
                    <div className={styles.stepsMeta}>
                      {agentPlan.steps.length} step
                      {agentPlan.steps.length === 1 ? '' : 's'} ·{' '}
                      <span className={styles.statusPill}>Completed</span>
                    </div>
                  </div>
                </div>
                <ul className={styles.stepsList}>
                  {agentPlan.steps.map((step) => {
                    const result = agentStepResults.find((r) => r.id === step.id);
                    const completed = !!result;
                    return (
                      <li
                        key={step.id}
                        className={`${styles.stepItem} ${
                          completed ? styles.stepItemCompleted : ''
                        }`}
                      >
                        <span className={styles.stepBullet}>{completed ? '✓' : step.id}</span>
                        <span>
                          <span className={styles.stepAction}>{step.action}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {finalSummary && (
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryTitle}>Trip overview</div>
                    <div className={styles.summaryText}>
                      <ReactMarkdown>{finalSummary}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.placeholder}>
                <div className={styles.placeholderTitle}>Your AI trip plan will appear here</div>
                <p className={styles.placeholderSubtitle}>
                  Describe your trip on the left and I&apos;ll break it into steps like visa
                  checks, itinerary, budget, and travel tips.
                </p>
                <ul className={styles.placeholderList}>
                  <li>Understand visa or transit requirements for your route.</li>
                  <li>Build a day-by-day itinerary that matches your interests.</li>
                  <li>Estimate a rough budget with key cost categories.</li>
                  <li>Share practical tips for airports, packing, and safety.</li>
                </ul>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

