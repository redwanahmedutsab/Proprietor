import { useEffect, useState } from 'react';

// Thin gradient bar fixed to the very top of the viewport that fills
// as the user scrolls down the page — a small but effective signal
// of "polish" used across most modern marketing sites.
const ScrollProgress = () => {
    const [pct, setPct] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setPct(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return <div className="scroll-progress" style={{ width: `${pct}%` }} />;
};

export default ScrollProgress;
