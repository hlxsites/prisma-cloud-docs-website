export const crossFade = (element, targetElement) => {
  element.style.opacity = 0;

  const transitionOut = () => {
    element.classList.remove('is-active');

    targetElement.classList.add('is-active');

    setTimeout(() => {
      targetElement.style.opacity = 1;
    }, 100);

    // Remove this event listener so it only gets triggered once
    element.removeEventListener('transitionend', transitionOut);
  };

  element.addEventListener('transitionend', transitionOut);
};

export const fadeOut = (element, callback) => {
  element.style.opacity = 0;

  const transitionOut = () => {
    element.classList.remove('is-current-route');
    element.classList.remove('stagger-transitions');

    // Remove this event listener so it only gets triggered once
    element.removeEventListener('transitionend', transitionOut);

    callback();
  };

  element.addEventListener('transitionend', transitionOut);
};

export const fadeIn = (element) => {
  if (!element) {
    return;
  }
  element.classList.add('is-current-route');

  setTimeout(() => {
    element.style.opacity = 1;
    element.classList.add('stagger-transitions');
  }, 100);
};

export const showRoute = (hash) => {
  let targetCategory = null;
  if (!hash) {
    targetCategory = document.querySelector('.intro-container');
  } else {
    targetCategory = document.querySelector(`[data-route="${hash}"]`);
    console.log('targetCategory: ', targetCategory);
  }
  window.scrollTo({ top: 0 });
  fadeIn(targetCategory);
};
