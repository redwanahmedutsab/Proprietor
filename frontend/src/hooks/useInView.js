import { useEffect, useRef, useState } from 'react';

// Returns [ref, isVisible] — attach ref to any element, isVisible flips to
// true once the element scrolls into the viewport (then stays true).
const useInView = (options = { threshold: 0.15 }) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (typeof IntersectionObserver === 'undefined') {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, options);

        observer.observe(el);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [ref, isVisible];
};

export default useInView;
