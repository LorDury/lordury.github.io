document.addEventListener('DOMContentLoaded', () => {
    const banner = document.querySelector('.site-banner');

    if (!banner) {
        return;
    }

    const fadeDistance = 220;

    const updateBanner = () => {
        const shouldHide = window.scrollY > fadeDistance;
        banner.classList.toggle('is-hidden', shouldHide);
        banner.closest('.site-header')?.classList.toggle('is-banner-hidden', shouldHide);
    };

    const runUpdate = () => requestAnimationFrame(updateBanner);

    runUpdate();
    window.addEventListener('scroll', runUpdate, { passive: true });
    window.addEventListener('resize', runUpdate);
    window.addEventListener('load', runUpdate);
});
