const makeLinksClickable = (text, className) => {
  const exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi
  return text.replace(exp, `<a class="${className}" href="$1">$1</a>`)
}

export default makeLinksClickable
