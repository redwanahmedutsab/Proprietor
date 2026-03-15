import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function About() {
  return (
    <>
      <Navbar />

      <section className="about-page">

        <div className="about-header">
          <h1>Meet the Developers</h1>
          <p>The people behind this platform</p>
        </div>

        <div className="dev-container">

          {/* Developer 1 */}
          <div className="dev-card">
            <img src="/images/developers/redwan.jpeg" alt="Redwan" />

            <h2>Redwan Ahmed Utsab</h2>
            <p className="role">Software Engineer</p>

            <p className="dev-desc">
              Full-stack developer focused on building scalable applications
              using React, Django, and modern web technologies.
            </p>

            <div className="dev-links">
              <a href="#">Github</a>
              <a href="#">LinkedIn</a>
            </div>
          </div>

          {/* Developer 2 */}
          <div className="dev-card">
            <img src="/images/developers/bushra.jpg" alt="Bushra" />

            <h2>Bushra Jannat</h2>
            <p className="role">Software Engineer</p>

            <p className="dev-desc">
              Frontend developer passionate about beautiful UI, responsive
              design, and creating seamless user experiences.
            </p>

            <div className="dev-links">
              <a href="#">Github</a>
              <a href="#">LinkedIn</a>
            </div>
          </div>

        </div>

      </section>

      <Footer />
    </>
  );
}