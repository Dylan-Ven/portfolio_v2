import githubIcon from '../assets/icons/github.svg';
import linkedinIcon from '../assets/icons/linkedin.svg';
import instagramIcon from '../assets/icons/instagram.svg';
import '../styles/components/Home.css';
import '../styles/components/Section.css';
import ShinyText from '../components/Shinytext/ShinyText.tsx';

export default function Home() {


  return (
    <section className="home-section section-root" tabIndex={-1}>
      <div className="home-container section-container">
        <h1>My name is Dylan van der Ven</h1>
        <span data-focus-target className="invisible">Home</span>

        <ShinyText
          text="Student Web- & Software Development Y4 (MBO)"
          disabled={false}
          speed={4}
          className="shiny-text"
        />

        <div className="social-icons">
          <a href="https://github.com/Dylan-Ven" target="_blank" rel="noreferrer">
            <img src={githubIcon} alt="Github" />
          </a>
          <a href="https://www.linkedin.com/in/dylan-van-der-ven-766a94240/" target="_blank" rel="noreferrer">
            <img src={linkedinIcon} alt="LinkedIn" />
          </a>
          <a href="https://www.instagram.com/ven.dylan/" target="_blank" rel="noreferrer">
            <img src={instagramIcon} alt="Instagram" />
          </a>
        </div>
      </div>
    </section>
  );
}
