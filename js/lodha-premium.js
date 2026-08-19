// Lodha Premium Interactivity
document.addEventListener('DOMContentLoaded', () => {
    
  // Scroll Reveal Animation
  const revealElements = document.querySelectorAll('.reveal');

  const reveal = () => {
      const windowHeight = window.innerHeight;
      const elementVisible = 150;

      revealElements.forEach(el => {
          const elementTop = el.getBoundingClientRect().top;
          if (elementTop < windowHeight - elementVisible) {
              el.classList.add('active');
          }
      });
  };

  window.addEventListener('scroll', reveal);
  reveal(); // Trigger on load

  // Navigation Background on Scroll
  const nav = document.querySelector('.premium-nav');
  window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
          nav.classList.add('scrolled');
      } else {
          nav.classList.remove('scrolled');
      }
  });

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      question.addEventListener('click', () => {
          // Close others
          faqItems.forEach(otherItem => {
              if (otherItem !== item && otherItem.classList.contains('active')) {
                  otherItem.classList.remove('active');
              }
          });
          // Toggle current
          item.classList.toggle('active');
      });
  });

  // Smooth Scrolling for Anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          document.querySelector(this.getAttribute('href')).scrollIntoView({
              behavior: 'smooth'
          });
      });
  });
});
