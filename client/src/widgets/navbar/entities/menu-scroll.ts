export const lockScroll = () => {
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.overflow = "hidden";
};

export const unlockScroll = () => {
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
    document.documentElement.style.overflow = "";
};