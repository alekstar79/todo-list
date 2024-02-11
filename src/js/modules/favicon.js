const favicon = () => {
  const todo = JSON.parse(localStorage.getItem('todo')) || []
  const count = todo.filter(item => item.checked !== true).length
  const canvas = document.createElement('canvas')

  canvas.height = 64
  canvas.width = 64

  const ctx = canvas.getContext('2d')
  const img = new Image()

  img.onload = () => {
    ctx.drawImage(img, 0, 0);

    if (count > 0) {
      const circle = new Path2D()
      let circleRadius = 22
      let fontX = 1

      if (count < 10) {
        circleRadius = 18
        fontX = 10
      }

      circle.arc(20, 45, circleRadius, 0, 2 * Math.PI)
      ctx.fillStyle = '#2b81fa'
      ctx.fill(circle)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 34px sans-serif'
      ctx.fillText(`${count}`, fontX, 57)
    }

    const oldLink = document.querySelector('link[rel="icon"]')
    const newLink = document.createElement('link')

    newLink.href = canvas.toDataURL()
    newLink.rel = 'icon'

    document.querySelector('head')
      .replaceChild(
        newLink,
        oldLink
      )
  }

  img.src = '/favicon.png'
}

export default favicon
