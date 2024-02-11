const setInputAutoHeight = element => {
  const style = window.getComputedStyle(element)

  element.style.height = 'auto'
  element.style.height =
    element.scrollHeight + parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth) + 'px'
}

export default setInputAutoHeight
