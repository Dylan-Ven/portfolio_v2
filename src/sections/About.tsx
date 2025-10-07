
import '../styles/components/About.css'; // Optional

export default function About() {

  
  return (
    <section className="about-section" tabIndex={-1}>
      <div className="about-container">
        <h1><span data-focus-target>About</span> Me</h1>
        <h2>Fullstack Developer & Designer</h2>

        <div className="social-icons">
          <a href="https://github.com/Dylan-Ven" target="_blank" rel="noreferrer">
            <img src="/icons/github-142-svgrepo-com.svg" alt="Github" />
          </a>
          <a href="https://www.linkedin.com/in/dylan-van-der-ven-766a94240/" target="_blank" rel="noreferrer">
            <img src="/icons/linkedin-svgrepo-com.svg" alt="LinkedIn" />
          </a>
          <a href="https://www.instagram.com/ven.dylan/" target="_blank" rel="noreferrer">
            <img src="/icons/instagram-svgrepo-com.svg" alt="Instagram" />
          </a>
        </div>
      </div>
    </section>
  );
}
