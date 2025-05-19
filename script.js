document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('#main-nav');
    const menuNavItems = document.querySelectorAll('.menu-nav-item');
    const allAnchorLinks = document.querySelectorAll('a[href^="#"]');
    const menuSections = document.querySelectorAll('.menu-section');
    const backToTopButton = document.querySelector('.back-to-top');
    const headerElement = document.querySelector('header');
    const menuNavElement = document.querySelector('.menu-nav');
    const languageSelector = document.querySelector('.language-selector select');

    let isProgrammaticScroll = false; // Flag to indicate a scroll initiated by code
    let programmaticScrollTimeout;    // Timeout for resetting the flag
    let scrollRAF;                    // requestAnimationFrame ID for scroll handling

    // Toggle Mobile Navigation
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            const isActive = mainNav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive.toString());
        });
    }

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
            const offsetPosition = elementPosition - totalOffset; 

            // Clear any existing programmatic scroll timeout
            if (programmaticScrollTimeout) {
                clearTimeout(programmaticScrollTimeout);
            }

            // If the clicked link is a menu navigation item, set it active immediately
            if (this.classList.contains('menu-nav-item')) {
                menuNavItems.forEach(navItem => navItem.classList.remove('active'));
                this.classList.add('active');
            }

            isProgrammaticScroll = true; // Set the flag

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Reset the flag after a delay and trigger a scroll check
            // The duration (e.g., 600ms) should be slightly longer than typical smooth scroll.
            programmaticScrollTimeout = setTimeout(() => {
                isProgrammaticScroll = false;
                // After the timeout, call checkScroll to ensure the correct item is highlighted
                // based on the final scroll position or any manual scrolling that occurred.
                if (scrollRAF) window.cancelAnimationFrame(scrollRAF); // Cancel any pending rAF
                scrollRAF = window.requestAnimationFrame(checkScroll); // Schedule an immediate check
            }, 600); // Adjust this value (500-700ms) if needed.
        });
    });

    // Back to Top Button Click
    if (backToTopButton) {
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();

            // Clear any existing programmatic scroll timeout
            if (programmaticScrollTimeout) {
                clearTimeout(programmaticScrollTimeout);
            }
            isProgrammaticScroll = true; 

            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Optionally close mobile nav if open and it was a click on back-to-top
            if (mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                if(navToggle) navToggle.setAttribute('aria-expanded', 'false');
            }

            programmaticScrollTimeout = setTimeout(() => {
                isProgrammaticScroll = false;
                if (scrollRAF) window.cancelAnimationFrame(scrollRAF);
                scrollRAF = window.requestAnimationFrame(checkScroll); // Re-check active state
            }, 600); 
        });
    }

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
        // Always update active menu item, regardless of programmatic scroll state
        const activationPoint = headerHeight + menuNavHeight + 50; // 50px buffer below sticky elements
        let currentActiveSectionId = null;

        // First pass: find the currently active section
        menuSections.forEach(section => {
            const sectionRect = section.getBoundingClientRect();
            // A section is "active" if the activationPoint is within its visible bounds.
            if (sectionRect.top <= activationPoint && sectionRect.bottom > activationPoint) {
                currentActiveSectionId = section.getAttribute('id');
            }
        });
        
        // Update the menu items regardless of previous state
        menuNavItems.forEach(item => item.classList.remove('active')); // Remove active class from all items
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
        // Only update during non-programmatic scrolls
        if (!isProgrammaticScroll) {
            if (scrollRAF) {
                window.cancelAnimationFrame(scrollRAF);
            }
            scrollRAF = window.requestAnimationFrame(checkScroll);
        }
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