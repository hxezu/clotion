import { makeFile,fetchUserData, updateDocument, fetchUserContent } from "./fetch.js"

document.addEventListener('DOMContentLoaded', async() => {
  const addPageBtn = document.getElementById('addPageBtn')
  const pageList = document.querySelector('.pageList')
  const pageContentElement = document.querySelector('#editor')
  const pageTitleElement = document.querySelector('.pageTitle')


  let currentDocumentId = null;
  await renderDocumentList()
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

    makeFile().then((newId) => {
      if(newId){
        currentDocumentId = newId
        const pageId = newId
        newPage.id = pageId
        pageTitleElement.id = pageId

        newPage.addEventListener('click', () => {
          openPage(pageTitle.textContent, pageId, newPage)
        })
      }
    })

  })

  //페이지 제목 바꾸면 사이드 바에도 같이 변경
  pageTitleElement.addEventListener('input', () => {
    const currentPageId = pageTitleElement.dataset.pageId
    const sidebarPage = document.querySelector(
      `.pageItem[id="${currentPageId}"] span`
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

  pageContentElement.addEventListener('focusout', () => {
    saveDocument()
  })

  pageTitleElement.addEventListener('focusout', () => {
    saveDocument()
  })

  //제목에 엔터키 입력 방지
  pageTitleElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      pageTitleElement.blur() //입력 종료
    }
  })


  //사이드바 랜더링
async function renderDocumentList() {
  const documents = await getAllIdsAndTitles();
  const existingLi = pageList.querySelectorAll('li');
  pageList.innerHTML = '';
  existingLi.forEach((li) => pageList.appendChild(li));
  documents.forEach((doc) => {
    addDocumentToLeftPanel(doc.id, doc.title);
  });
 // console.log(documents);
}

// title, id 불러오기
async function getAllIdsAndTitles() {
  const response = await fetchUserData();
  return response.map((doc) => ({
    id: doc.id,
    title: doc.title || '(제목 없음)',
  }));
}

//사이드바 추가
 function addDocumentToLeftPanel(id, title) {
  const newPage = document.createElement('li')
  newPage.classList.add('pageItem')
  newPage.id = id;
  currentDocumentId = id

  const docIcon = document.createElement('img')
  docIcon.src = 'assets/docIcon.svg'
  docIcon.alt = 'doc-Icon'
  docIcon.classList.add('docIcon')

  const pageTitle = document.createElement('span')
  pageTitle.textContent = title

  newPage.appendChild(docIcon)
  newPage.appendChild(pageTitle)
  pageList.appendChild(newPage)

  newPage.addEventListener('click', async () => {
    const pageContent = await fetchUserContent(id)
    console.log(pageContent)
    openPage(pageTitle.textContent, id, pageContent)
    currentDocumentId = id
    saveDocument()
  })
}

//저장 함수
async function saveDocument() {
  const selectedId = document.getElementById(currentDocumentId)
  const selectedTitle = selectedId.querySelector('span').textContent.trim()
  const selectedContent = document.getElementById("editor").textContent
  const updatedData = { title: selectedTitle, content: selectedContent }

   const success = await updateDocument(selectedId.id, updatedData);
   if (success) {
     //console.log("성공")
   }
}
})

//페이지 열기
function openPage(pageTitle, pageId,pageContent) {
  const pageTitleElement = document.querySelector('.pageTitle')
  const pageContentElement = document.querySelector('#editor')

  if (!pageTitleElement || !pageContentElement) {
    console.error('Error: Not find : .editor or .pageTitle')
    return
  }

  pageTitleElement.textContent = pageTitle
  pageTitleElement.dataset.pageId = pageId
  if(pageContent === null){
     pageContentElement.textContent = `내용을 입력하세요...`
  }else{
    pageContentElement.textContent = pageContent
  }
  history.pushState({ page: pageTitle }, '', `#${pageTitle}`)
}

