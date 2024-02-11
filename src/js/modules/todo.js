import Sortable from 'sortablejs/modular/sortable.core.esm.js'

import generateUniqueId from './generate-unique-id'
import makeLinksClickable from './make-links-clickable'
import setInputAutoHeight from './set-input-auto-height'
import updateFavicon from './favicon'
import testData from './test-data'

export default class Todo
{
  constructor()
  {
    const todo = this

    todo.data = JSON.parse(localStorage.getItem('todo')) || []

    todo.todoEl = document.querySelector('.todo')
    todo.todoList = document.querySelector('.todo__list')

    todo.actionsPanel = document.querySelector('.todo__actions')
    todo.toggleAll = document.querySelector('.todo__toggle-all .checkbox__input')
    todo.deleteDone = document.querySelector('.todo__delete-done')

    todo.addForm = document.querySelector('.todo__form')
    todo.input = todo.addForm.elements['text']
    todo.submit = todo.addForm.elements['submit']

    todo.todoEdit = document.querySelector('.todo-edit')
    todo.todoEditForm = document.querySelector('.todo-edit__form')
    todo.todoEditInput = document.querySelector('.todo-edit__input')

    todo.testData = document.querySelector('.test-data')
    todo.testDataBtn = document.querySelector('.test-data__btn')

    todo.toggleTestDataBtn()
    todo.render()

    Sortable.create(todo.todoList, {
      handle: '.todo__move',
      animation: 250,
      ghostClass: 'todo__move--ghost',
      onEnd: event => {
        const data = todo.data
        const oldItem = data[event.oldIndex]
        const newItem = data[event.newIndex]

        todo.data[event.newIndex] = oldItem
        todo.data[event.oldIndex] = newItem
        todo.sortByCheckedUnchecked()
        todo.saveDataToStorage()
        todo.render()
      }
    })

    // Event Handlers
    document.addEventListener('click', async (event) => {
      const element = event.target

      if (element === todo.testDataBtn) {
        const isTestData = true
        await todo.addTodoItem(isTestData)
      }
      if (element.matches('.todo__delete-done')) {
        const checkedItems = document.querySelectorAll('.todo__item--done')

        for (const item of checkedItems) {
          const id = item.dataset.id
          todo.removeTodoItem(id)
        }

        todo.toggleCheckboxAll()
        todo.toggleDeleteDone()
      }
      if (element.matches('.todo__expand')) {
        todo.toggleExpandTodoItem(element)
      }
      if (element.matches('.todo__menu-toggle')) {
        todo.toggleTodoItemMenu(element)
      }
      if (element.matches('.todo__edit')) {
        todo.openTodoItemEditModal(element)
        document.querySelector('.menu-active').classList.remove('menu-active')
      }
      if (element.matches('.todo__delete')) {
        const id = element.dataset.id
        todo.removeTodoItem(id)
      }

      todo.closeTodoItemMenu(element)

      if (element.closest('.todo-edit__close') || element.matches('.todo-edit__save')) {
        todo.closeTodoItemEditModal()
      }
    })

    document.addEventListener('mousedown', event => {
      if (event.target.matches('.todo-edit')) {
        todo.closeTodoItemEditModal()
      }
    })

    document.addEventListener('change', event => {
      const element = event.target

      if (element.matches('.checkbox__input')) {
        if (element.closest('.todo__toggle-all')) {
          todo.onChangeCheckboxAll(element)
          updateFavicon()
        } else {
          todo.onChangeCheckbox(element)
        }
      }
    })

    document.addEventListener('keydown', async (event) => {
      const element = event.target

      if (todo.todoEdit.matches('.active') && event.code === 'Escape') {
        todo.closeTodoItemEditModal()
      }
      if (event.target === todo.input) {
        if (event.code === 'Enter' && !event.ctrlKey) {
          await todo.onSubmitNewTodo(event)
        } else if (event.code === 'Enter' && event.ctrlKey) {
          todo.input.value += '\n'
          setInputAutoHeight(element)
        }
      }
      if (event.target === todo.todoEditInput) {
        if (event.ctrlKey && event.code === 'Enter') {
          todo.onSaveTodoItem(event);
        }
        if (event.ctrlKey && event.code === 'KeyB') {
          event.preventDefault()

          const selectedText = window.getSelection().toString()
          const boldSelectedText = `<b>${selectedText}</b>`

          todo.todoEditInput.value = todo.todoEditInput.value.replace(selectedText, boldSelectedText)
        }
      }
    })

    document.addEventListener('input', event => {
      const element = event.target

      if (element === todo.input) {
        setInputAutoHeight(element)
      }
    })

    document.addEventListener('focusin', event => {
      const element = event.target

      if (element === todo.input) {
        todo.todoEl.classList.add('todo--focus-within')
      }
    })

    document.addEventListener('focusout', event => {
      const element = event.target

      if (element === todo.input) {
        todo.todoEl.classList.remove('todo--focus-within')
      }
    })

    document.addEventListener('submit', async (event) => {
      const element = event.target

      if (element === todo.addForm) {
        await todo.onSubmitNewTodo(event)
      }
      if (element === todo.todoEditForm) {
        todo.onSaveTodoItem(event)
      }
    })
  }

  onRendered()
  {
    const todo = this

    todo.toggleActionsPanel()
    todo.toggleCheckboxAll()
    todo.toggleDeleteDone()
  }

  toggleActionsPanel()
  {
    const todo = this

    if (todo.data.length > 0) {
      todo.actionsPanel.classList.add('todo__actions--visible')
    } else {
      todo.actionsPanel.classList.remove('todo__actions--visible')
    }
  }

  toggleExpandTodoItem(element)
  {
    const todoItems = document.querySelectorAll('.todo__item')

    element.classList.toggle('todo__expand--active')

    for (const todoItem of todoItems) {
      todoItem.classList.toggle('todo__item--expanded')
    }
  }

  toggleTodoItemMenu(element)
  {
    element.closest('.todo__item').classList.toggle('menu-active')
  }

  closeTodoItemMenu(element)
  {
    const activeMenu = document.querySelectorAll('.menu-active')

    for (const menu of activeMenu) {
      if (!element.closest('.todo__menu-toggle') && !element.closest('.menu')) {
        menu.classList.remove('menu-active')
      }
      if (menu.dataset.id !== element.dataset.id && !element.closest('.menu')) {
        menu.classList.remove('menu-active')
      }
    }
  }

  openTodoItemEditModal(element)
  {
    const todo = this
    const id = element.dataset.id
    const todoItem = todo.data.find(item => item.id === id)

    todo.todoEdit.classList.add('active')
    todo.todoEdit.dataset.id = id
    todo.todoEditInput.value = todoItem.text

    setTimeout(() => {
      todo.todoEditInput.focus()
    }, 100)
  }

  closeTodoItemEditModal()
  {
    const todo = this
    todo.todoEdit.classList.remove('active')
  }

  async onSubmitNewTodo(e)
  {
    const todo = this

    e.preventDefault()

    if (todo.input.value !== '') {
      await todo.addTodoItem()
      todo.input.style.height = 'auto'
    }
  }

  saveDataToStorage()
  {
    const todo = this
    localStorage.setItem('todo', JSON.stringify(todo.data))
  }

  async addTodoItem(isTestData = false)
  {
    const todo = this

    if (isTestData) {
      todo.data = await testData()
    } else {
      todo.data.push({
        id: generateUniqueId(),
        text: todo.input.value,
        date: new Date(),
        checked: false
      })
    }

    todo.sortByCheckedUnchecked()
    todo.saveDataToStorage()
    todo.render()
    todo.addForm.reset()
    todo.toggleTestDataBtn()

    updateFavicon()
  }

  removeTodoItem(id)
  {
    const todo = this
    const item = document.querySelector(`.todo__item[data-id="${id}"]`)

    item.parentNode.removeChild(item)
    todo.data = todo.data.filter(item => item.id !== id)

    todo.saveDataToStorage()
    todo.toggleTestDataBtn()
    todo.toggleActionsPanel()

    updateFavicon()
  }

  toggleTestDataBtn()
  {
    const todo = this

    todo.testData.classList[todo.data.length < 1 ? 'add': 'remove']('show')
  }

  toggleCheckboxAll()
  {
    const todo = this
    const checkedItems = document.querySelectorAll('.checkbox:not(.todo__toggle-all) .checkbox__input:checked')

    if (todo.data.length > 0 && checkedItems.length === todo.data.length) {
      todo.toggleAll.checked = !todo.toggleAll.checked
    }
    if (todo.data.length === 0) {
      todo.toggleAll.checked = false
    }
  }

  onChangeCheckboxAll(element)
  {
    const todo = this
    const checkboxes = document.querySelectorAll('.checkbox:not(.todo__toggle-all) .checkbox__input')

    if (element.matches(':checked')) {
      checkboxes.forEach(checkbox => {
        const id = checkbox.dataset.id

        if (!checkbox.matches(':checked')) {
          checkbox.checked = !checkbox.checked

          todo.data.map(item => {
            if (item.id === id) {
              item.checked = true
            }
          })

          document.querySelector(`.todo__item[data-id="${id}"]`)
            .classList.add('todo__item--done')
        }
      })
    } else {
      checkboxes.forEach(checkbox => {
        const id = checkbox.dataset.id

        checkbox.checked = !checkbox.checked

        todo.data.map(item => {
          if (item.id === id) {
            item.checked = false
          }
        })

        document.querySelector(`.todo__item[data-id="${id}"]`)
          .classList.remove('todo__item--done')
      })
    }

    todo.saveDataToStorage()
    todo.toggleDeleteDone()
  }

  onChangeCheckbox(element)
  {
    const todo = this
    const id = element.dataset.id
    const checked = !todo.data.find(item => item.id === id).checked

    todo.data.map(item => {
      if (item.id === id) {
        item.checked = checked
      }
    })

    todo.sortByCheckedUnchecked()

    if (checked === false) {
      todo.toggleAll.checked = false
    }

    setTimeout(() => {
      todo.render()
    }, 350)

    todo.saveDataToStorage()
    document.querySelector(`.todo__item[data-id="${id}"]`)
      .classList.toggle('todo__item--done')

    todo.toggleDeleteDone()
    updateFavicon()
  }

  toggleDeleteDone()
  {
    const todo = this
    const checkedItems = document.querySelectorAll('.todo__item--done')

    if (checkedItems.length > 0) {
      todo.deleteDone.style.display = 'block'
    } else {
      todo.deleteDone.style.display = 'none'
    }

    todo.toggleActionsPanel()
  }

  sortByCheckedUnchecked()
  {
    const todo = this
    const data = todo.data
    const checkedItems = data.filter(item => item.checked === true)
    const uncheckedItems = data.filter(item => item.checked !== true)

    todo.data = [...uncheckedItems, ...checkedItems]
  }

  onSaveTodoItem(event)
  {
    event.preventDefault()

    const todo = this
    const id = todo.todoEdit.dataset.id

    todo.data.map(item => {
      if (item.id === id) {
        item.text = todo.todoEditInput.value
      }
    })

    todo.saveDataToStorage()
    todo.closeTodoItemEditModal(event)
    todo.render()
  }

  render()
  {
    const todo = this
    let html = ''

    for (const item of todo.data) {
      const id = item.id
      let text = item.text

      const date = new Date(item.date).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      const time = new Date(item.date).toLocaleString('ru-RU', {
        hour: 'numeric',
        minute: 'numeric',
      })

      text = text.replace(/\n/g, '<br>')
      text = makeLinksClickable(text, 'todo__link')

      html += /* html */ `
        <li class="todo__item${item.checked ? ' todo__item--done' : ''}" data-id="${id}">
          <div class="todo__move">
            <svg width="26" height="26">
              <use xlink:href="./sprite.svg#icon-move" />
            </svg>
          </div>

          <label class="checkbox todo__check">
            <input
              class="checkbox__input visually-hidden"
              type="checkbox"
              data-id="${id}"
              ${item.checked ? 'checked' : ''}
            >
            <svg class="checkbox__svg" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 18 18" fill="none">
              <path class="checkbox__path" d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>
              <polyline class="checkbox__polyline" points="1 9 7 14 15 4"></polyline>
            </svg>
          </label>

          <div class="todo__content">
            <div class="todo__text">
              <p class="todo__text-inner">${text}</p>
            </div>
            <p class="todo__date">Добавлено: ${date} в ${time}</p>
          </div>

          <button class="todo__menu-toggle" type="button" data-id="${id}">
            <svg class="todo__menu-toggle-icon" width="24" height="24">
              <use xlink:href="./sprite.svg#icon-dots" />
            </svg>
          </button>

          <ul class="menu">
            <li class="menu__item">
              <button class="menu__btn todo__edit" type="button" data-id="${id}">
                <svg class="menu__btn-icon" width="20" height="20">
                  <use xlink:href="./sprite.svg#icon-edit" />
                </svg>
                Редактировать
              </button>
            </li>
            <li class="menu__item">
              <button class="menu__btn todo__delete" type="button" data-id="${id}">
                <svg class="menu__btn-icon" width="20" height="20">
                  <use xlink:href="./sprite.svg#icon-delete" />
                </svg>
                Удалить
              </button>
            </li>
          </ul>
        </li>
      `
    }

    todo.todoList.replaceChildren()
    todo.todoList.insertAdjacentHTML('beforeend', html)
    todo.onRendered()
  }
}
