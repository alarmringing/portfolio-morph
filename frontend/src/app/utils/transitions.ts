export const TRANSITION_DURATION_S = 0.4;

export const fadeTransitionStyle = (isEntering: boolean) => ({
  opacity: isEntering ? 1 : 0,
  transition: `opacity ${TRANSITION_DURATION_S}s ${isEntering ? 'ease-in' : 'ease-out'}`
});

export const handlePageExitTransition = (
  setIsEntering: (value: boolean) => void,
  callback: () => void,
) => {

  // Handle navigation transition (fade out then callback)
  setIsEntering(false);
  setTimeout(callback, TRANSITION_DURATION_S * 1000);
}; 

export const  handlePageEnterTransition = (
    setIsEntering: (value: boolean) => void,
  ) => {
  
    // Handle navigation transition (fade out then callback)
    setIsEntering(true);
  }; 