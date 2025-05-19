document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('#main-nav'); // Corrected: relies on id="main-nav" in HTML
    const menuNavItems = document.querySelectorAll('.menu-nav-item');
    const allAnchorLinks = document.querySelectorAll('a[href^="#"]');
    const menuSections = document.querySelectorAll('.menu-section');
    const backToTopButton = document.querySelector('.back-to-top');
    const headerElement = document.querySelector('header');
    const menuNavElement = document.querySelector('.menu-nav');
    const languageSelector = document.querySelector('.language-selector select');

    // Toggle Mobile Navigation
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            const isActive = mainNav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive.toString());
        });
    }

    // Menu Navigation Item Click (for initial active state or manual click)
    menuNavItems.forEach(item => {
        item.addEventListener('click', function() {
            menuNavItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            // Smooth scroll will be handled by the generic anchor link handler
        });
    });

    // Smooth Scroll for all anchor links
    allAnchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const targetId = href;

            if (!targetId || targetId.charAt(0) !== '#') return; // Ensure it's a valid local anchor

            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            e.preventDefault();
            
            // Close mobile menu if open
            if (mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                if(navToggle) navToggle.setAttribute('aria-expanded', 'false');
            }
            
            const headerHeight = headerElement ? headerElement.offsetHeight : 0;
            let menuNavHeight = 0;
            if (menuNavElement) {
                const menuNavRect = menuNavElement.getBoundingClientRect();
                const headerRect = headerElement ? headerElement.getBoundingClientRect() : { bottom: 0 };
                // Consider menuNav sticky if its top is close to header bottom OR if window has scrolled past header top
                if (menuNavElement.style.position === 'sticky' && (Math.abs(menuNavRect.top - headerRect.bottom) < 5 || window.scrollY > headerRect.top)) { 
                    menuNavHeight = menuNavElement.offsetHeight;
                }
            }
            
            const totalOffset = headerHeight + menuNavHeight;
            const elementPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
            // Scroll to align the top of the section with the bottom of sticky elements.
            // A small negative value (e.g., -10) can be added if a little space above the section is desired.
            const offsetPosition = elementPosition - totalOffset; 

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });

    // Back to Top Button Click
    if (backToTopButton) {
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Optionally close mobile nav if open
            if (mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                if(navToggle) navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    let scrollRAF;
    // Scroll Event Handling
    function checkScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const headerHeight = headerElement ? headerElement.offsetHeight : 0;
        let menuNavHeight = 0;
        
        if (menuNavElement) {
            const menuNavRect = menuNavElement.getBoundingClientRect();
            const headerRect = headerElement ? headerElement.getBoundingClientRect() : { bottom: 0 };
             // Consider menuNav sticky if its top is close to header bottom OR if window has scrolled past header top
            if (menuNavElement.style.position === 'sticky' && (Math.abs(menuNavRect.top - headerRect.bottom) < 5 || window.scrollY > headerRect.top)) {
                menuNavHeight = menuNavElement.offsetHeight;
            }
        }
        
        // Show/hide back to top button
        if (backToTopButton) {
            if (scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }

        // Animate menu sections when they come into view
        menuSections.forEach(section => {
            const sectionRect = section.getBoundingClientRect();
            if (sectionRect.top < windowHeight * 0.85) { 
                section.classList.add('visible');
            }
        });

        // Highlight active menu nav item based on scroll position
        // activationPoint is where the top of the section should be for it to be considered active
        const activationPoint = headerHeight + menuNavHeight + 50; // 50px buffer below sticky elements
        let currentActiveSectionId = null;

        menuSections.forEach(section => {
            const sectionRect = section.getBoundingClientRect();
            // A section is "active" if the activationPoint is within its visible bounds.
            // (i.e., section top is above or at activationPoint, and section bottom is below activationPoint)
            if (sectionRect.top <= activationPoint && sectionRect.bottom > activationPoint) {
                currentActiveSectionId = section.getAttribute('id');
            }
        });
        
        menuNavItems.forEach(item => item.classList.remove('active'));
        if (currentActiveSectionId) {
            const activeNavItem = document.querySelector(`.menu-nav-item[href="#${currentActiveSectionId}"]`);
            if (activeNavItem) {
                activeNavItem.classList.add('active');
            }
        }
    }
    
    // Initial check on page load
    checkScroll();

    // Optimized scroll listener
    window.addEventListener('scroll', () => {
        if (scrollRAF) {
            window.cancelAnimationFrame(scrollRAF);
        }
        scrollRAF = window.requestAnimationFrame(checkScroll);
    });

    // Language selector functionality (placeholder)
    if (languageSelector) {
        languageSelector.addEventListener('change', function() {
            const selectedLanguage = this.value;
            console.log(`Language changed to: ${selectedLanguage}`);
            // Implement actual language change logic here
        });
    }
});