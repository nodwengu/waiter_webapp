document.addEventListener('DOMContentLoaded', function(){
  let messageElem = document.querySelector('.message');
  if (messageElem.innerHTML !== ''){
      setTimeout(function(){
          messageElem.innerHTML = '';
          messageElem.style.display = "none"
      }, 3000);
  }

});