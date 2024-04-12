export const isDev = process.env.NODE_ENV === 'development';

export const isMac = process.platform === 'darwin';

export const getIconPath = () => {
  if (isDev) {
    return isMac ? '../public/Template.png' : '../public/icon@2.png';
  } else {
    return isMac ? './Template.png' : './icon@2.png';
  }
};
