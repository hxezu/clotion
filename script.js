document.addEventListener("DOMContentLoaded", () => {

  const todoCreateBtn = document.getElementById("todoCreateButton");
  const todoList = document.querySelector(".todo-list");

  //Todo 생성 버튼 클릭 이벤트 (POST)
  todoCreateBtn.addEventListener("click", (e) => {
      fetch("http://localhost:3000/todos", {
        method: "POST",
        body: JSON.stringify({ todo: "", completed: false }),
        headers: { "Content-type": "application/json; charset=UTF-8" },
      })
        .then((res) => res.json())
        .then((json) => {
          makeTodoList(json);
        });
    });

    //todo list 가져오기
    const getTodoList = () => {
      fetch("http://localhost:3000/todos")
        .then((response) => response.json())
        .then((json) => {
          json.forEach(makeTodoList);
        });
    };
    getTodoList();

    //사이드바에 투두 리스트 추가
    const makeTodoList = (data) => {
      const li = document.createElement("li");
      const i = document.createElement("i");
      const span = document.createElement("span");
  
      li.className = "todoList-item";
      i.className = data.completed
        ? "fa-regular fa-square-check"
        : "fa-regular fa-square";
      li.id = data.id;
      span.className = "todo-text";
      span.textContent = data.todo || "New Todo";
      span.contentEditable = "true";
  
      i.addEventListener("click", () => {
        toggleTodo(data.id, !data.completed, i, span);
      });
  
      span.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          span.blur();
        }
      });
  
      span.addEventListener("blur", () => {
        updateTodoText(data.id, span.textContent);
      });
  
      li.appendChild(i);
      li.appendChild(span);
      todoList.appendChild(li);
    };

    //Todo 아이템 클릭 시 완료 여부 
    const toggleTodo = (id, newCompleted, i, span) => {
      fetch(`http://localhost:3000/todos/${id}`)
        .then((res) => res.json())
        .then((todo) => {
          fetch(`http://localhost:3000/todos/${id}`, {
            method: "PUT",
            body: JSON.stringify({
              todo: todo.todo,
              completed: newCompleted,
            }),
            headers: { "Content-type": "application/json; charset=UTF-8" },
          })
            .then((res) => res.json())
            .then(() => {
              i.className = newCompleted
                ? "fa-regular fa-square-check"
                : "fa-regular fa-square";
            });
        });
    };

    const updateTodoText = (id, newText) => {
      fetch(`http://localhost:3000/todos/${id}`)
        .then((res) => res.json())
        .then((todo) => {
          fetch(`http://localhost:3000/todos/${id}`, {
            method: "PUT",
            body: JSON.stringify({
              todo: newText,
              completed: todo.completed,
            }),
            headers: { "Content-type": "application/json; charset=UTF-8" },
          });
        });
    };

})