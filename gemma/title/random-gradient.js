function randomColor() {
    return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
}

function setRandomGradient() {
    const title = document.querySelector('.title-3d');
    if (title) {
        const color1 = randomColor();
        const color2 = randomColor();
        const color3 = randomColor();
        // const gradient = `linear-gradient(from var(--angle), ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
        // const gradient = `linear-gradient(90deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
        // title.style.background = gradient;
        title.style.webkitBackgroundClip = 'text';
        title.style.webkitTextFillColor = 'transparent';
        title.style.backgroundClip = 'text';
        title.style.color = 'transparent';
        title.style.textShadow = `-10px -10px 0px ${color3},`;
    }

    const subtitle = document.querySelector('.subtitle-3d');
    if (subtitle) {
        const colorA = randomColor();
        const colorB = randomColor();
        const colorC = randomColor();
        // const gradientSub = `linear-gradient(90deg, ${colorA} 0%, ${colorB} 50%, ${colorC} 100%)`;
        // subtitle.style.background = gradientSub;
        subtitle.style.webkitBackgroundClip = 'text';
        subtitle.style.webkitTextFillColor = 'transparent';
        subtitle.style.backgroundClip = 'text';
        subtitle.style.color = 'transparent';
        subtitle.style.textShadow = `
            -2px -2px 0px ${colorB},
            -5px -5px 0px ${colorC},
            -8px -8px 0px rgba(0, 0, 0, 1)
        `;
    }
}

// Run on load
window.addEventListener('DOMContentLoaded', setRandomGradient);
