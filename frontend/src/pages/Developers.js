import {useEffect, useRef} from 'react';
import '../styles/about.css';

const developers = [
    {
        id: 1,
        name: 'Redwan Ahmed Utsab',
        photo: "/image/redwan_linkedin_photo.PNG",
        initials: 'rau',
        designation: 'Junior AI Engineer',
        role: 'Backend & AI/ML Engineering',
        bio: 'A backend engineer and AI/ML practitioner specializing in production-grade LLM agentic systems and scalable REST APIs. Builds agentic RAG pipelines with LangGraph orchestration, fine-tuned NLP models, and Groq-served LLaMA inference, and ships full-stack platforms on microservices architecture with Docker and CI/CD.',
        skills: ['Django REST Framework', 'FastAPI', 'LangChain & LangGraph', 'NLP/LLM', 'PostgreSQL', 'Docker & AWS EC2', 'JWT & OAuth2'],
        github: 'https://github.com/redwanahmedutsab',
        linkedin: 'https://linkedin.com/in/redwanahmedutsab',
        email: 'redwanutsab@gmail.com',
        accent: '#263566',
    },
    {
        id: 2,
        name: 'Bushra Jannat',
        photo: "/image/bushra_linkedin_photo.PNG",
        initials: 'bj',
        designation: 'Full-Stack Software Engineer',
        role: 'Frontend Engineering & ML Research',
        bio: 'A full-stack software engineer and published ML researcher skilled in React, Django REST Framework, and PostgreSQL. Builds production REST APIs and ML-integrated platforms, and serves as IEEE WIE Chairperson, leading technical workshops and outreach promoting women in STEM.',
        skills: ['React.js', 'Django REST Framework', 'PostgreSQL', 'Docker', 'Scikit-Learn', 'LangChain & RAG'],
        github: 'https://github.com/jannatjenniebushra',
        linkedin: 'https://linkedin.com/in/jannatjenniebushra',
        email: 'jannatjenniebushra@gmail.com',
        accent: '#12896F',
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

                                <div
                                    className="dev-card-bar"
                                    style={{background: dev.accent}}
                                />

                                <div className="dev-card-inner">

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