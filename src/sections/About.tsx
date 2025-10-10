
import '../styles/components/About.css'; // Optional
import '../styles/components/Section.css';
import ProfileCard from '../components/ProfileCard/ProfileCard';

export default function About() {


  return (
    <section className="about-section section-root" tabIndex={-1}>
      <div className="about-container section-container">
        <div className='Textarea'>
          <h1><span data-focus-target>About</span> Me</h1>          
          <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Hic quibusdam ratione quae explicabo ut rerum ipsa consequatur? Rerum tempora provident expedita fugit cumque deleniti quas minus, facere suscipit quae aspernatur?</p>
        </div>
        <div className="ProfileCardWrapper">
          <ProfileCard 
            name="Dylan v.d. Ven"
            title="Student Web- & Software Development Y4 (MBO)"
            handle="ven.dylan  @DylanNST"
            status='Online'
            contactText='Contact Me!'
            showUserInfo={true}
            enableTilt={true}
            enableMobileTilt={true}
            avatarUrl="/images/Dylan-2023.png"
          />
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
      </div>
    </section>
  );
}
