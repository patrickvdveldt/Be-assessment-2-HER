var input = document.querySelector('input[type = "submit"]');
var chatgesprek = document.querySelector('.chatgesprek');
var text = document.querySelector('.chatten');


console.log(input);

input.addEventListener('click', onclick);
function onclick() {
  var chat = document.createElement('div');
  chat.classList.add('container');
  chat.textContent = text.value;
  var chatText = document.createElement('p');
  chatText.classList.add('chat-text');
  chatText.textContent = text.value;
  var time = document.createElement('span');
  time.classList.add('time-right');
  var date = new Date();
  var minutes = date.getMinutes();
  var hours = date.getHours();
  time.textContent = hours + ':' + minutes;
  chat.appendChild(time);
  chatgesprek.appendChild(chat);
  text.value = '';
}
