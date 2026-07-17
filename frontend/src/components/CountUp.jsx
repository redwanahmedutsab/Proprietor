import { useEffect, useRef, useState } from 'react';
import useInView from '../hooks/useInView';

// Animates from 0 to the numeric part of `value` once in view.
// Accepts strings like "2,400+", "98%", "64" and preserves prefix/suffix.
const CountUp = ({ value, duration = 1400 }) => {
    const [ref, isVisible] = useInView({ threshold: 0.4 });
    const [display, setDisplay] = useState('0');
    const started = useRef(false);

    useEffect(() => {
        if (!isVisible || started.current) return;
        started.current = true;

        const match = String(value).match(/^([^\d]*)([\d,]+)(.*)$/);
        if (!match) {
            setDisplay(value);
            return;
        }
        const [, prefix, numStr, suffix] = match;
        const target = parseInt(numStr.replace(/,/g, ''), 10);
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            setDisplay(`${prefix}${current.toLocaleString('en-US')}${suffix}`);
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [isVisible, value, duration]);

    return <span ref={ref}>{display}</span>;
};

export default CountUp;
