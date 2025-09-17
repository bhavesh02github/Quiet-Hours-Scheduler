// pages/index.js
import Link from 'next/link';
import Head from 'next/head';

export default function LandingPage() {
    return (
        <div className="main-container">
            <Head>
                <title>Quiet Hours Scheduler</title>
                <meta name="description" content="Your personal tool for focused, uninterrupted time." />
            </Head>

            <header className="landing-hero">
                <h1 className="landing-title">
                    <span className="text-gradient">Quiet Hours</span> Scheduler
                </h1>
                <p className="landing-subtitle">
                    Your personal tool for creating focused, uninterrupted time blocks. Automate reminders and stay on track with your goals.
                </p>
                <div className="landing-button-group">
                    <Link href="/login" className="btn-primary">
                        Get Started
                    </Link>
                    <Link href="#info" className="btn-secondary">
                        Learn More
                    </Link>
                </div>
            </header>

            <section id="info" className="glass-card info-card">
                <h3 className="text-center" style={{ fontSize: '1.5rem', color: 'var(--text-light)' }}>What is this project?</h3>
                <p className="text-center" style={{ color: 'var(--text-secondary)' }}>
                    Quiet Hours Scheduler is a simple web application that helps you stay focused. Authenticated users can create scheduled time blocks for silent study or work. A background function runs automatically to send you an email reminder 10 minutes before each of your sessions begins, so you are always prepared to focus.
                </p>
            </section>

            <section className="glass-card tech-stack">
                <h3 className="text-center" style={{ fontSize: '1.5rem', color: 'var(--text-light)' }}>Built with a powerful stack</h3>
                <ul style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem', listStyle: 'none', padding: '0', margin: '0' }}>
                    <li className="text-center">
                        <span style={{ fontSize: '2.5rem' }}>⚛️</span>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>React</p>
                    </li>
                    <li className="text-center">
                        <span style={{ fontSize: '2.5rem' }}>⚡️</span>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Next.js</p>
                    </li>
                    <li className="text-center">
                        <span style={{ fontSize: '2.5rem' }}>🚀</span>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Supabase</p>
                    </li>
                    <li className="text-center">
                        <span style={{ fontSize: '2.5rem' }}>🍃</span>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>MongoDB</p>
                    </li>
                    <li className="text-center">
                        <span style={{ fontSize: '2.5rem' }}>📧</span>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Resend</p>
                    </li>
                </ul>
            </section>
            
            <footer className="footer">
                <p style={{ margin: 0 }}>© {new Date().getFullYear()} Bhavesh. All Rights Reserved.</p>
            </footer>
        </div>
    );
}