import { useEffect, useRef } from 'react';
import { animate, createTimeline, createMotionPath, createDrawable, utils } from 'animejs';
import styles from './TripRouteAnimation.module.css';

interface TripRouteAnimationProps {
  from?: string;
  to?: string;
  hasTransit?: boolean;
}

export function TripRouteAnimation({ from, to, hasTransit }: TripRouteAnimationProps) {
  const pathId = 'trip-route-path';
  const planeId = 'trip-route-plane';
  const pathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    if (!from || !to || !pathRef.current) return;

    const pathLength = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = `${pathLength}`;
    pathRef.current.style.strokeDashoffset = `${pathLength}`;

    const motionPath = createMotionPath(`#${pathId}`);
    const timeline = createTimeline({ defaults: { ease: 'inOutSine' } });

    // Draw the path (v4: createDrawable + draw '0 1')
    const drawable = createDrawable(`#${pathId}`);
    timeline.add(drawable, { draw: '0 1', duration: 1600 }, 0);

    // Move the plane dot along the path
    timeline.add(`#${planeId}`, {
      translateX: motionPath.translateX,
      translateY: motionPath.translateY,
      duration: 2800,
    }, 0);

    timeline.play();

    return () => {
      utils.remove(`#${pathId}`);
      utils.remove(`#${planeId}`);
    };
  }, [from, to, hasTransit, pathId, planeId]);

  if (!from || !to) {
    return null;
  }

  const fromLabel = from.length > 20 ? `${from.slice(0, 18)}…` : from;
  const toLabel = to.length > 20 ? `${to.slice(0, 18)}…` : to;

  return (
    <div className={styles.routeCard} aria-hidden="true">
      <div className={styles.routeHeader}>
        <div className={styles.routeTitle}>Route simulation</div>
        <div className={styles.routeMeta}>
          {hasTransit ? 'Origin → Transit → Destination' : 'Origin → Destination'}
        </div>
      </div>

      <div className={styles.mapWrapper}>
        <svg className={styles.mapSvg} viewBox="0 0 400 150" role="presentation">
          {/* subtle background grid */}
          <defs>
            <linearGradient id="route-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(56,189,248,0.15)" />
              <stop offset="100%" stopColor="rgba(15,23,42,0.4)" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="400" height="150" fill="url(#route-bg)" rx="16" />

          {/* origin, optional transit, destination */}
          <circle cx="60" cy="95" r="6" fill="#22c55e" />
          {hasTransit && <circle cx="200" cy="55" r="6" fill="#eab308" />}
          <circle cx="340" cy="35" r="7" fill="#38bdf8" />

          {/* animated path */}
          <path
            id={pathId}
            ref={pathRef}
            d={hasTransit ? 'M60 95 Q200 130 200 55 T340 35' : 'M60 95 Q200 10 340 35'}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />

          {/* moving plane dot */}
          <g id={planeId} transform="translate(60,95)">
            <circle r="5" fill="#f97316" />
          </g>

          {/* labels */}
          <text x="60" y="115" className={styles.cityLabel} textAnchor="middle">
            {fromLabel}
          </text>
          <text x="60" y="128" className={styles.cityLabelSecondary} textAnchor="middle">
            Origin
          </text>

          <text x="340" y="55" className={styles.cityLabel} textAnchor="middle">
            {toLabel}
          </text>
          <text x="340" y="68" className={styles.cityLabelSecondary} textAnchor="middle">
            Destination
          </text>

          {hasTransit && (
            <>
              <text x="200" y="35" className={styles.cityLabelSecondary} textAnchor="middle">
                Transit
              </text>
            </>
          )}
        </svg>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDotOrigin} />
          <span>Origin</span>
        </div>
        {hasTransit && (
          <div className={styles.legendItem}>
            <span className={styles.legendDotTransit} />
            <span>Transit</span>
          </div>
        )}
        <div className={styles.legendItem}>
          <span className={styles.legendDotDestination} />
          <span>Destination</span>
        </div>
      </div>
    </div>
  );
}

