const arrowDownBtn = document.querySelector(".sidebarHeaderLeft button")
const setUserNamePopup =document.querySelector(".setUserNamePopup")
const userNameInput = document.querySelector(".userNameInput")
const userNameBox = document.querySelector(".sidebarHeaderLeft h2")

console.log(userNameBox.innerHTML)
//이름바꾸기 팝업 창 띄우기
let isActive = false
arrowDownBtn.addEventListener("click",(e)=>{
  e.preventDefault()
  
  if(!isActive){
    setUserNamePopup.style.display = "flex"
    isActive = true
  }else{
    setUserNamePopup.style.display = "none"
    isActive = false
  }
})


setUserNamePopup.addEventListener("click",(e)=>{
  setUserNamePopup.style.display = "none"
  isActive = false
  userNameInput.style.display = "block"
  userNameInput.focus()
})

userNameInput.addEventListener("keydown",(e)=>{
  e.preventDefault()
  if(e.keyCode == 13){
    userNameBox.innerHTML = userNameInput.value;
    userNameInput.style.display = "none"
    userNameInput.value = ""
  }
})