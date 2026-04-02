// src/pages/AboutUs.jsx
// About Us page — replace placeholder content with real developer info

import {useEffect, useRef} from 'react';
import '../styles/about.css';

const developers = [
    {
        id: 1,
        name: 'Redwan Ahmed Utsab',
        photo: "https://scontent.fdac110-1.fna.fbcdn.net/v/t39.30808-6/468282334_2403063893384071_4167278019168442776_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeFEWAuryVVFu8bOfrHEZXMuomNmIIZ5bpCiY2YghnlukNWU4t70WOVloDq-gr80ne7SvJTAvUWUDgVl3Y5CL7-g&_nc_ohc=rnfre8qDDDQQ7kNvwGN6UAL&_nc_oc=AdqiDJwoNnf9X_iLVguclEmMvC-ESjVvxH6WDOPKIvZZgqlfLhxOTtmOIX86P318LnU&_nc_zt=23&_nc_ht=scontent.fdac110-1.fna&_nc_gid=jRSOyS4AtBlildFBsX0uxQ&_nc_ss=7a3a8&oh=00_Af3KSSnnF3DKKMAyF6FpHz4t7aWWyJlvcnpGt_lBa7QOxg&oe=69D41B52",                                    // ← Replace with photo URL or import
        initials: 'rau',
        designation: 'Full Stack Developer',
        role: 'Backend & Architecture',
        bio: 'A passionate developer with expertise in building scalable backend systems and RESTful APIs. Specializes in Django, PostgreSQL, and cloud deployment. Loves turning complex problems into clean, maintainable solutions.', // ← Replace
        skills: ['Django REST', 'PostgreSQL', 'JWT Auth', 'SSLCommerz', 'Python', 'Docker'],
        github: 'https://github.com/redwanahmedutsab',
        linkedin: 'https://linkedin.com/in/redwanahmedutsab',
        email: 'redwanutsab@gmail.com',
        accent: '#1a56db',
    },
    {
        id: 2,
        name: 'Bushra Jannat',
        photo: "https://scontent.fdac110-1.fna.fbcdn.net/v/t39.30808-6/658774587_1349167750575841_1809372538772107113_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeHormGZVYf719yq8d2k_dX20Wni8N5ne_DRaeLw3md78CsO5JjtuCx5tlBSINoTT2tG-2smyTI5fSKn3jBqYo4c&_nc_ohc=W2xLWBmVSSwQ7kNvwGbVl9q&_nc_oc=AdqsVzmVNhTEe4p_f3BEkDiePXsy9kUwnr0RIISRNwVDmq6BmRbekvys076QeXJrXCI&_nc_zt=23&_nc_ht=scontent.fdac110-1.fna&_nc_gid=oyYtFjmDjq0m-76CXIBmUw&_nc_ss=7a3a8&oh=00_Af1peSaD3cD7cMq93YFNloeFS54x2DcNDVyghMfcT_BoWA&oe=69D40B4F",                                    // ← Replace with photo URL or import
        initials: 'bj',
        designation: 'Frontend Developer',
        role: 'UI/UX & React',
        bio: 'A creative frontend developer who crafts beautiful, responsive user interfaces. Specializes in React, modern CSS, and building intuitive user experiences. Passionate about design systems and pixel-perfect implementation.', // ← Replace
        skills: ['React', 'JavaScript', 'CSS3', 'Axios', 'React Router', 'Figma'],
        github: 'https://github.com/jannatjenniebushra',
        linkedin: 'https://linkedin.com/in/jannatjenniebushra',
        email: 'jannatjenniebushra@gmail.com',
        accent: '#057a55',
    },
];

const stats = [
    {value: '5', label: 'Development Phases'},
    {value: '63', label: 'Files Written'},
    {value: '30+', label: 'API Endpoints'},
    {value: '100%', label: 'Made in Bangladesh'},
];

const AboutUs = () => {
    const heroRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        // Intersection observer for scroll animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            {threshold: 0.1}
        );

        cardsRef.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="about-page">

            {/* ── Hero ──────────────────────────────────────── */}
            <section className="about-hero" ref={heroRef}>
                <div className="about-hero-bg">
                    <div className="hero-grid-pattern"/>
                </div>
                <div className="container">
                    <div className="about-hero-content">
                        <div className="about-eyebrow">Meet the Team</div>
                        <h1 className="about-hero-title">
                            Built with passion<br/>
                            <span className="about-hero-accent">for Bangladesh</span>
                        </h1>
                        <p className="about-hero-sub">
                            Proprietor was designed and developed by developers who wanted
                            to build something real — a platform that solves a genuine problem
                            for the Bangladeshi real estate market.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Stats ─────────────────────────────────────── */}
            <section className="about-stats">
                <div className="container">
                    <div className="about-stats-grid">
                        {stats.map((s, i) => (
                            <div
                                key={s.label}
                                className="about-stat-card fade-up"
                                ref={(el) => (cardsRef.current[i] = el)}
                                style={{animationDelay: `${i * 0.1}s`}}
                            >
                                <div className="about-stat-val">{s.value}</div>
                                <div className="about-stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Developer Cards ───────────────────────────── */}
            <section className="about-team">
                <div className="container">
                    <div className="about-section-header">
                        <h2 className="about-section-title">The Developers</h2>
                        <p className="about-section-sub">
                            Two developers. One platform. Built from scratch.
                        </p>
                    </div>

                    <div className="dev-cards">
                        {developers.map((dev, i) => (
                            <div
                                key={dev.id}
                                className="dev-card fade-up"
                                ref={(el) => (cardsRef.current[4 + i] = el)}
                                style={{animationDelay: `${i * 0.15}s`}}
                            >
                                {/* Accent top bar */}
                                <div
                                    className="dev-card-bar"
                                    style={{background: dev.accent}}
                                />

                                <div className="dev-card-inner">

                                    {/* Left: Photo + name */}
                                    <div className="dev-card-left">
                                        <div
                                            className="dev-photo-wrap"
                                            style={{borderColor: dev.accent}}
                                        >
                                            {dev.photo ? (
                                                <img
                                                    src={dev.photo}
                                                    alt={dev.name}
                                                    className="dev-photo"
                                                />
                                            ) : (
                                                <div
                                                    className="dev-initials"
                                                    style={{background: dev.accent}}
                                                >
                                                    {dev.initials}
                                                </div>
                                            )}
                                        </div>

                                        <div className="dev-identity">
                                            <h3 className="dev-name">{dev.name}</h3>
                                            <div
                                                className="dev-designation"
                                                style={{color: dev.accent}}
                                            >
                                                {dev.designation}
                                            </div>
                                            <div className="dev-role">{dev.role}</div>
                                        </div>

                                        {/* Social links */}
                                        <div className="dev-socials">
                                            <a
                                                href={dev.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="dev-social-btn"
                                                style={{'--hover': dev.accent}}
                                            >
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                                    <path
                                                        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                                                </svg>
                                                GitHub
                                            </a>
                                            <a
                                                href={dev.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="dev-social-btn"
                                                style={{'--hover': dev.accent}}
                                            >
                                                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                                    <path
                                                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                                </svg>
                                                LinkedIn
                                            </a>
                                            <a
                                                href={`mailto:${dev.email}`}
                                                className="dev-social-btn"
                                                style={{'--hover': dev.accent}}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                     strokeWidth="2" width="18" height="18">
                                                    <path
                                                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                                    <polyline points="22,6 12,13 2,6"/>
                                                </svg>
                                                Email
                                            </a>
                                        </div>
                                    </div>

                                    {/* Right: Bio + skills */}
                                    <div className="dev-card-right">
                                        <div className="dev-bio-label">About</div>
                                        <p className="dev-bio">{dev.bio}</p>

                                        <div className="dev-skills-label">Tech Stack</div>
                                        <div className="dev-skills">
                                            {dev.skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="dev-skill-chip"
                                                    style={{
                                                        background: `${dev.accent}15`,
                                                        borderColor: `${dev.accent}40`,
                                                        color: dev.accent,
                                                    }}
                                                >
                          {skill}
                        </span>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Project story ─────────────────────────────── */}
            <section className="about-story">
                <div className="container">
                    <div
                        className="story-card fade-up"
                        ref={(el) => (cardsRef.current[6] = el)}
                    >
                        <div className="story-icon">🏘️</div>
                        <h2 className="story-title">Why We Built Proprietor</h2>
                        <p className="story-body">
                            Bangladesh's real estate market lacked a modern, trustworthy digital platform
                            where buyers, renters, and sellers could connect seamlessly. We built Proprietor
                            to change that — combining a powerful Django backend with a clean React frontend,
                            local payment integration via SSLCommerz, and features designed specifically for
                            the Bangladeshi market.
                        </p>
                        <p className="story-body">
                            From JWT authentication and property approval workflows to 3D virtual tours and
                            bKash payments — every feature was built with real users in mind.
                        </p>
                        <div className="story-tags">
                            <span className="story-tag">🇧🇩 Made in Bangladesh</span>
                            <span className="story-tag">⚡ Full Stack</span>
                            <span className="story-tag">🔒 Secure by Design</span>
                            <span className="story-tag">📱 Mobile First</span>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AboutUs;
