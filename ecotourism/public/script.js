const bars = document.querySelector(".bar"),
close = document.querySelector(".close"),
menu = document.querySelector(".menu");

bars.addEventListener("click", () => {
    menu.classList.add("active");
    gsap.from(".menu", {
        opacity: 0,
        duration: .3
    })

    gsap.from(".menu ul", {
        opacity: 0,
        x: -300
    })
});

close.addEventListener("click", () => {
    menu.classList.remove("active")
});

function animateContent(selector) {
    selector.forEach((selector) => {
        gsap.to(selector, {
            y: 30,
            duration: 0.1,
            opacity: 1,
            delay: 0.2,
            stagger: 0.2,
            ease: "power2.out",
        });
    });
}

function scrollTirggerAnimation(triggerSelector, boxSelectors) {
    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: triggerSelector,
            start: "top 50%",
            end: "top 80%",
            scrub: 1,
        },
    });

    boxSelectors.forEach((boxSelector) => {
        timeline.to(boxSelector, {
            y: 0,
            duration: 1,
            opacity: 1,
        });
    })
}

function swipeAnimation(triggerSelector, boxSelectors) {
    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: triggerSelector,
            start: "top 50%",
            end: "top 100%",
            scrub: 3,
        },
    });

    boxSelectors.forEach((boxSelector) => {
        timeline.to(boxSelector, {
            x: 0,
            duration: 1,
            opacity:1,
        });
    });
}

function galleryAnimation(triggerSelector, boxSelectors) {
    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: triggerSelector,
            start: "top 100%",
            end: "bottom 100%",
            scrub: 1,
        },
    });

    boxSelectors.forEach((boxSelector) => {
        timeline.to(boxSelector, {
            y: 0,
            opacity: 1,
            duration: 1,
        });
    });
}

const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
const voices = document.querySelector('.voices');
const dotsContainer = document.querySelector('.dots-container');
let currentIndex = 0;
const totalVoices = document.querySelectorAll('.voice').length;

// Додаємо точки навігації
function createDots() {
    for (let i = 0; i < totalVoices; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => {
            currentIndex = i;
            updateSlider();
        });
        dotsContainer.appendChild(dot);
    }
}

// Оновлюємо слайдер
function updateSlider() {
    voices.style.transform = `translateX(-${currentIndex * 350}px)`;  // Зсув на ширину одного відгука

    // Оновлюємо активну точку
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === currentIndex) {
            dot.classList.add('active');
        }
    });
}

// Кнопка "Попередній"
prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = totalVoices - 1;  // Перехід до останнього відгука
    }
    updateSlider();
});

// Кнопка "Наступний"
nextButton.addEventListener('click', () => {
    if (currentIndex < totalVoices - 1) {
        currentIndex++;
    } else {
        currentIndex = 0;  // Перехід до першого відгука
    }
    updateSlider();
});

// Ініціалізація слайдера
createDots();
updateSlider();

animateContent([".home .content h5, .home .content h1, .home .content p, .home .content .learn-more-btn"]);

scrollTirggerAnimation(".travel", [".travel .box1", ".travel .box2", ".travel .box3"]);

scrollTirggerAnimation(".feedback .container", [".feedback .label", ".feedback .heading", ".feedback .paragraph"]);

scrollTirggerAnimation(".article", [".article .label", ".article .heading"]);

swipeAnimation(".destinations", [".destinations .heading", ".destinations .content"])

swipeAnimation(".article", [".article .latest-article", ".article .box1", ".article .box2", ".article .box3", ".article .box4"])

swipeAnimation(".waterfalls", [".waterfalls .heading", ".waterfalls .content"])

galleryAnimation(".destinations .gallery", [".destinations .gallery .box1",".destinations .gallery .box2",".destinations .gallery .box3",".destinations .gallery .box4",".destinations .gallery .box5"])

galleryAnimation(".featured .gallery", [".featured .gallery .box1",".featured .gallery .box2",".featured .gallery .box3",".featured .gallery .box4"])

galleryAnimation(".feedback .voices", [".feedback .voices .box1",".feedback .voices .box2",".feedback .voices .box3",".feedback .voices .box4",".feedback .voices .box5",".feedback .voices .box6"])

