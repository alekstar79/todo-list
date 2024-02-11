import generateUniqueId from './generate-unique-id'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const testData = async () => {
  document.body.classList.add('loading')

  const todos = []

  try {

    await delay(1000)
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/')
    let data = await response.json()

    if (data) {
      data = data.slice(40, 47)

      data.forEach(item => {
        todos.push({
          id: generateUniqueId(),
          text: item.title,
          date: new Date(),
          checked: false
        })
      })
    }

  } catch (error) {
    alert('К сожалению, произошла ошибка:\n\n' + error)
  }

  document.body.classList.remove('loading')

  return todos
}

export default testData
