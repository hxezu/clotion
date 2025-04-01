document.addEventListener('DOMContentLoaded', () => {
  //docs
  const addPageBtn = document.getElementById('addPageBtn')
  const pageList = document.querySelector('.pageList')
  const pageContentElement = document.querySelector('#editor')
  const pageTitleElement = document.querySelector('.pageTitle')

  //todo
  const todoCreateBtn = document.getElementById('todoCreateButton')
  const todoList = document.querySelector('.todo-list')

  //Todo 생성 버튼 클릭 이벤트 (POST)
  todoCreateBtn.addEventListener('click', (e) => {
    fetch('http://localhost:3000/todos', {
      method: 'POST',
      body: JSON.stringify({ todo: '', completed: false }),
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    })
      .then((res) => res.json())
      .then((json) => {
        makeTodoList(json)
      })
  })

  //todo list 가져오기
  const getTodoList = () => {
    fetch('http://localhost:3000/todos')
      .then((response) => response.json())
      .then((json) => {
        json.forEach(makeTodoList)
      })
  }
  getTodoList()

  //사이드바에 투두 리스트 추가
  const makeTodoList = (data) => {
    const li = document.createElement('li')
    const i = document.createElement('i')
    const span = document.createElement('span')
    const deleteBtn = document.createElement('i')

    li.className = 'todoList-item'
    i.className = data.completed
      ? 'fa-regular fa-square-check'
      : 'fa-regular fa-square'
    li.id = data.id
    span.className = 'todo-text'
    span.textContent = data.todo || 'New Todo'
    span.contentEditable = 'true'

    deleteBtn.className = 'fa-regular fa-trash-can deleteTodoBtn'
    deleteBtn.style.display = 'none'

    if (data.completed) {
      span.style.textDecoration = 'line-through'
      span.style.color = '#aaa'
    }

    i.addEventListener('click', () => {
      toggleTodo(data.id, !data.completed, i, span)
    })

    span.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        span.blur()
      }
    })

    span.addEventListener('blur', () => {
      updateTodoText(data.id, span.textContent)
    })

    deleteBtn.addEventListener('click', () => {
      deleteTodo(data.id, li)
    })

    li.appendChild(i)
    li.appendChild(span)
    li.appendChild(deleteBtn)
    todoList.appendChild(li)
  }

  //Todo 아이템 클릭 시 완료 여부
  const toggleTodo = (id, newCompleted, i, span) => {
    fetch(`http://localhost:3000/todos/${id}`)
      .then((res) => res.json())
      .then((todo) => {
        fetch(`http://localhost:3000/todos/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            todo: todo.todo,
            completed: newCompleted,
          }),
          headers: { 'Content-type': 'application/json; charset=UTF-8' },
        })
          .then((res) => res.json())
          .then(() => {
            i.className = newCompleted
              ? 'fa-regular fa-square-check'
              : 'fa-regular fa-square'
          })
      })
  }

  const updateTodoText = (id, newText) => {
    fetch(`http://localhost:3000/todos/${id}`)
      .then((res) => res.json())
      .then((todo) => {
        fetch(`http://localhost:3000/todos/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            todo: newText,
            completed: todo.completed,
          }),
          headers: { 'Content-type': 'application/json; charset=UTF-8' },
        })
      })
  }

  //Todo 삭제 (Delete)
  const deleteTodo = (id, li) => {
    fetch(`http://localhost:3000/todos/${id}`, {
      method: 'DELETE',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    })
      .then(() => {
        li.remove()
      })
      .catch((err) => console.error('Error Occurs'))
  }

  //DOCS ----------------------------------------------------------------------------

  addPageBtn.addEventListener('click', () => {
    const newPage = document.createElement('li')
    newPage.classList.add('pageItem')

    const docIcon = document.createElement('img')
    docIcon.src = 'assets/docIcon.svg'
    docIcon.alt = 'doc-Icon'
    docIcon.classList.add('docIcon')

    const pageTitle = document.createElement('span')
    pageTitle.textContent = 'New page'

    newPage.appendChild(docIcon)
    newPage.appendChild(pageTitle)
    pageList.appendChild(newPage)

    //페이지 아이디 생성
    const pageId = Date.now()
    newPage.dataset.pageId = pageId
    pageTitleElement.dataset.pageId = pageId

    newPage.addEventListener('click', () => {
      openPage(pageTitle.textContent, pageId, newPage)
    })
  })

  //페이지 제목 바꾸면 사이드 바에도 같이 변경
  pageTitleElement.addEventListener('input', () => {
    const currentPageId = pageTitleElement.dataset.pageId
    const sidebarPage = document.querySelector(
      `.pageItem[data-page-id="${currentPageId}"] span`
    )

    if (sidebarPage) {
      sidebarPage.textContent = pageTitleElement.textContent
    }
  })

  //redo, undo 이벤트 감지
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
      openPage(event.state.page)
    }
  })

  //제목, 내용에 placeholder 효과
  pageContentElement.addEventListener('focus', () => {
    if (pageContentElement.textContent === '내용을 입력하세요...') {
      pageContentElement.textContent = ''
    }
  })

  pageTitleElement.addEventListener('focus', () => {
    if (pageTitleElement.textContent === 'New page') {
      pageTitleElement.textContent = ''
    }
  })

  //입력 안한 채로 비우면 다시 채우기
  pageContentElement.addEventListener('blur', () => {
    if (pageContentElement.textContent.trim() === '') {
      pageContentElement.textContent = '내용을 입력하세요...'
    }
  })

  pageTitleElement.addEventListener('blur', () => {
    if (pageTitleElement.textContent.trim() === '') {
      pageTitleElement.textContent = 'New Page'
    }
  })

  //제목에 엔터키 입력 방지
  pageTitleElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      pageTitleElement.blur() //입력 종료
    }
  })
})

//페이지 열기
function openPage(pageTitle, pageId) {
  const pageTitleElement = document.querySelector('.pageTitle')
  const pageContentElement = document.querySelector('#editor')

  if (!pageTitleElement || !pageContentElement) {
    console.error('Error: Not find : .editor or .pageTitle')
    return
  }

  pageTitleElement.textContent = pageTitle
  pageTitleElement.dataset.pageId = pageId
  pageContentElement.textContent = `내용을 입력하세요...`
  history.pushState({ page: pageTitle }, '', `#${pageTitle}`)
}
