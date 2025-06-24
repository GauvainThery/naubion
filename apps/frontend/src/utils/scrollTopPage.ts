export const scrollTopPage = (element: HTMLElement | Window = window): void => {
  if (element instanceof HTMLElement) {
    element.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (element instanceof Window) {
    element.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    throw new Error('Invalid element type. Expected HTMLElement or Window.');
  }
};
