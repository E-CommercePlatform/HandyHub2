let sideMenubar = document.querySelector(".hamburger-menu");
let arrow = document.querySelector(".arrow");
let categorySidebar = document.querySelector(".category-sidebar");

sideMenubar.addEventListener("click", () => {
    categorySidebar.classList.toggle("showSidebar");
});

arrow.addEventListener("click", () => {
    categorySidebar.classList.toggle("showSidebar");
});

// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')
        }, false)
      })
  })()

 

  const hearts = document.querySelectorAll(".fa-heart");

// Loop over each heart because querySelectorAll returns a NodeList
hearts.forEach(heart => {
  heart.addEventListener("click", () => { 
    heart.classList.toggle("fa-regular");
    heart.classList.toggle("fa-solid");
  });
});


