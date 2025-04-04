document.addEventListener("DOMContentLoaded", () => {
  const asideMenu = document.querySelector('.sidebar')
  const hideAsideBtn = document.getElementById('asideToggleBtn')
  const showAsideBtn = document.getElementById('showSidebarBtn')

  hideAsideBtn.addEventListener('click',(e)=>{
    asideMenu.classList.add('hidden')
  })

  showAsideBtn.addEventListener('click', ()=>{
    asideMenu.classList.remove('hidden')
  })
})