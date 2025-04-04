import { makeFile, fetchUserData, updateDocument, fetchUserContent, deleteDocument, makeSubdocument, fetchUserIdData } from "./fetch.js";

document.addEventListener('DOMContentLoaded', async () => {
  const addPageBtn = document.getElementById('addPageBtn');
  const pageList = document.querySelector('.pageList');
 // const pageContentElement = document.querySelector('#editor');
  const pageTitleElement = document.querySelector('.pageTitle');
  const contentContainer = document.getElementById('contentContainer');
  const blockList = document.querySelector('#contentContainer');

  let currentDocumentId = null;
  let currentBlockIdx = null;
  let currentBlock = null;
  await renderDocumentList();

  //새 페이지 추가
  addPageBtn.addEventListener('click', async () => {
    const newPage = createPageElement("New page");
    pageList.appendChild(newPage);

    const newId = await makeFile();
    if (newId) {
      currentDocumentId = newId;
      newPage.id = newId;
      pageTitleElement.id = newId;

      newPage.addEventListener('click', async () => {
        const content = await fetchUserContent(newId);
        const currentTitle = await fetchUserIdData(newId)
        const title = (currentTitle && currentTitle.title) ? currentTitle.title.trim() : "New Page";
        openPage(title , newId, content);
      });
    }
  });

  contentContainer.addEventListener('focusout', () => {
    saveDocument();
  });

  pageTitleElement.addEventListener('focusout', () => {
    saveDocument();
  });

  //제목 입력하면 사이드바 동기화
  pageTitleElement.addEventListener('input', () => {
    const sidebarPage = document.querySelector(`.pageItem[id="${pageTitleElement.dataset.pageId}"] span`);
    if (sidebarPage) {
      sidebarPage.innerText = pageTitleElement.innerText;
    }
  });

  //Redo, Undo 기능
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
      openPage(event.state.page);
    }
  });

  //Placeholder 처리
  //addPlaceholderEffect(pageContentElement, "내용을 입력하세요...");
  addPlaceholderEffect(pageTitleElement, "New page");

  //저장 기능
  //pageContentElement.addEventListener('focusout', saveDocument);
  pageTitleElement.addEventListener('focusout', saveDocument);

  //제목 입력 시 Enter 방지
  pageTitleElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      pageTitleElement.blur();
    }
  });

  contentContainer.addEventListener('keydown', function (event) {
    let currentBlock = document.activeElement;

    if (!currentBlock.classList.contains('contentBlock')) {
      currentBlock = currentBlock.closest('.contentBlock');
      if (!currentBlock) return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const newBlock = createBlock('');
      currentBlock.after(newBlock);
      newBlock.focus();
    } else if (event.key === 'Backspace' && event.target.textContent === '') {
      event.preventDefault();
      removeBlock(event.target);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const previousBlock = currentBlock.previousElementSibling;
      if (previousBlock && previousBlock.classList.contains('contentBlock')) {
        previousBlock.focus();
        setCursorToEnd(previousBlock);
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextBlock = currentBlock.nextElementSibling;
      if (nextBlock && nextBlock.classList.contains('contentBlock')) {
        nextBlock.focus();
        setCursorToStart(nextBlock);
      }
    }
  });

  blockList.addEventListener('dragstart', (e) => {
    currentBlock = e.target;
    const blockArr = [...currentBlock.parentElement.children];
    currentBlockIdx = blockArr.indexOf(currentBlock);
  });

  blockList.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  blockList.addEventListener('drop', (e) => {
    e.preventDefault();

    const currentDropBlock = e.target;
    const blockArr = [...currentBlock.parentElement.children];
    const dropBlockIdx = blockArr.indexOf(currentDropBlock);

    if (currentBlockIdx < dropBlockIdx) {
      currentDropBlock.after(currentBlock);
    } else {
      currentDropBlock.before(currentBlock);
    }
  });

  //문서 리스트 렌더링
  async function renderDocumentList() {
    const documents = await getAllIdsAndTitles();
    pageList.innerHTML = ""; // 기존 리스트 초기화

    documents.forEach((doc) => {
      const parentPage = addDocumentToLeftPanel(doc.id, doc.title);
      if (doc.documents.length > 0) {
        doc.documents.forEach((subDoc) => {
          addDocumentToLeftPanel(subDoc.id, subDoc.title, parentPage);
        });
      }
    });
  }

  //문서 목록 불러오기
  async function getAllIdsAndTitles() {
    const response = await fetchUserData();
    return response.map((doc) => ({
      id: doc.id,
      title: doc.title || "(제목 없음)",
      documents: doc.documents
    }));
  }

  //사이드바 문서 추가
  function addDocumentToLeftPanel(id, title, parentElement = pageList) {
    const newPage = createPageElement(title, id);
    parentElement.appendChild(newPage);

    newPage.addEventListener('click', async (e) => {
      e.stopPropagation();
      currentDocumentId = id;
      const content = await fetchUserContent(id);
      openPage(title, id, content);
    });

    return newPage;
  }

  //페이지 요소 생성
  function createPageElement(title, id = null) {
    const newPage = document.createElement('li');
    newPage.classList.add('pageItem');
    if (id) newPage.id = id;

    const docIcon = document.createElement('img');
    docIcon.src = 'assets/docIcon.svg';
    docIcon.alt = 'doc-Icon';
    docIcon.classList.add('docIcon');

    const pageInfo = document.createElement('div');
    pageInfo.classList.add('pageInfo');
    const docIcon2 = document.createElement('i');
    docIcon2.classList.add('docIcon', 'fa-regular', 'fa-file-lines');

    const pageTitle = document.createElement('span');
    pageTitle.innerText = title;


    const menuButton = document.createElement('img');
    menuButton.src = 'assets/menuDots.svg';
    menuButton.alt = 'menu';
    menuButton.classList.add('menuButton');

    const dropdownMenu = document.createElement('div');
    dropdownMenu.classList.add('contextMenu', 'hidden');
    dropdownMenu.innerHTML = `
        <ul>
          <li class="rename">이름 변경</li>
          <li class="delete">삭제</li>
        </ul>
      `;

      menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log(dropdownMenu)
        document.querySelectorAll('.contextMenu').forEach((menu) => {
          menu.classList.add('hidden');
        });
        dropdownMenu.classList.toggle('hidden');
      });

          //메뉴 바깥 클릭 시 메뉴 닫기
    document.addEventListener('click', () => {
      dropdownMenu.classList.add('hidden');
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = "remove";
    removeBtn.innerText = "remove";

    const createBtn = document.createElement('i');
    createBtn.className = "create fa-solid fa-plus";

    //이름 변경 버튼 이벤트
    dropdownMenu.querySelector('.rename').addEventListener('click', (e) => {
      currentDocumentId = e.currentTarget.parentElement.parentElement.parentElement.id;
      console.log(currentDocumentId)
          inlineEdit(pageTitle);
          dropdownMenu.classList.add('hidden');
        });

          //인라인 편집
  function inlineEdit(titleElement) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = titleElement.textContent;
    input.classList.add('inlineInput');

    
    titleElement.replaceWith(input);
    input.focus();
    input.select();

    let isSaved = false;

    function save() {
      if (isSaved) return;
      isSaved = true;

      const newTitle = input.value.trim() || 'New page';
      pageTitleElement.textContent = newTitle

      saveDocument()
      titleElement.textContent = newTitle;
      input.replaceWith(titleElement);
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        save();
      } else if (e.key === 'Escape') {
        input.replaceWith(titleElement);
        isSaved = true;
      }
    });

    input.addEventListener('blur', save);
  }

  dropdownMenu.querySelector('.delete').addEventListener("click", async (e) => {
      e.stopPropagation();
      const deleteId = e.currentTarget.parentElement.parentElement.parentElement.id;
      const parentElement = document.getElementById(deleteId);
      
      if (!parentElement) return;
    // 자식 문서가 있는지 확인 (바로 아래 자식만 선택)
    const childDocuments = [...parentElement.children].filter(
      (el) => el.classList.contains('pageItem')
    );

    // 부모 삭제 전에 자식 문서를 최상위로 이동
    childDocuments.forEach((child) => {
      pageList.appendChild(child);
    });

      //부모 문서 삭제
      await deleteDocument(deleteId);
      parentElement.remove();
    });

    

    //하위 문서 생성
    createBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const parentId = e.currentTarget.parentElement.id;
      const parentDocument = document.getElementById(parentId);

      const newSubPage = createPageElement("New page");
      parentDocument.appendChild(newSubPage);

      const newId = await makeSubdocument(parentId);
      if (newId) {
        newSubPage.id = newId;
        newSubPage.addEventListener('click', async (e) => {
          e.stopPropagation();
          currentDocumentId = newId;
          const currentTitle = await fetchUserIdData(newId)
          const title = (currentTitle && currentTitle.title) ? currentTitle.title.trim() : "New Page";
          console.log(currentTitle.title)
          const content = await fetchUserContent(newId);
          openPage(title , newId, content);
        });
      }
    });

    pageInfo.appendChild(pageTitle);
    newPage.append(docIcon, pageInfo, menuButton, dropdownMenu,createBtn,);
    return newPage;
  }

  //문서 저장
  async function saveDocument() {
    if (!currentDocumentId) return;
    const selectedPage = document.getElementById(currentDocumentId);
    if (!selectedPage) return;

    const selectedContent = [...document.querySelectorAll('#contentContainer .contentBlock')]      
    .flatMap((block) => block.innerText.split('\n').map((text) => text.trim()))
    .filter((text) => text.length > 0);

    const updatedData = {
      title: pageTitleElement.innerText.trim(), 
      content: JSON.stringify(selectedContent)
    };

    await updateDocument(selectedPage.id, updatedData);
  }

  //페이지 열기
  function openPage(pageTitle, pageId, pageContent) {
    if (!pageTitleElement) {
      console.error('Error: .editor or .pageTitle not found');
      return;
    }

    pageTitleElement.innerText = pageTitle;
    pageTitleElement.dataset.pageId = pageId;
    contentContainer.innerHTML = '';
   // pageContentElement.innerText = pageContent || "내용을 입력하세요...";
    //pageTitleElement.focus()

    try {
      let parsedContent = JSON.parse(pageContent);
  
      if (!Array.isArray(parsedContent) || parsedContent.length === 0) {
        parsedContent = [''];
      }
  
      parsedContent.forEach((text) => {
        const block = createBlock(text.trim());
        contentContainer.appendChild(block);
      });
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      contentContainer.appendChild(createBlock(''));
    }

    history.pushState({ page: pageTitle }, '', `#${pageTitle}`);
  }

  
  //Placeholder 효과 추가
  function addPlaceholderEffect(element, placeholder) {
    element.addEventListener('focus', () => {
      if (element.innerText === placeholder) {
        element.innerText = '';
      }
    });

    element.addEventListener('blur', () => {
      if (element.innerText.trim() === '') {
        element.innerText = placeholder;
      }
    });
  }
});


function createBlock(text = '') {
  const block = document.createElement('div');
  block.classList.add('contentBlock');
  block.setAttribute('contenteditable', 'true');
  block.textContent = text || '';
  block.placeholder = '내용을 입력하세요...';
  block.draggable = true;

  return block;
}

const removeBlock = (block) => {
  if (contentContainer.children.length > 1) {
    const previousBlock = block.previousElementSibling;
    contentContainer.removeChild(block);
    if (previousBlock) setCursorToEnd(previousBlock);
  }
};

const setCursorToEnd = (element) => {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
};