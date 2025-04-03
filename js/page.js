document.addEventListener('DOMContentLoaded', () => {
  const addPageBtn = document.getElementById('addPageBtn')
  const pageList = document.querySelector('.pageList')
  const pageContentElement = document.querySelector('#editor')
  const pageTitleElement = document.querySelector('.pageTitle')

  //새 페이지 버튼 이벤트
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
