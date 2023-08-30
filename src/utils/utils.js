export const px2rem = (px) => {
  const ratio = 375 / 10
  return px / ratio
}

export const realPx = (px) => {
  const maxWidth = window.innerWidth > 500 ? 500 : window.innerWidth
  return px * (maxWidth / 375)
}
