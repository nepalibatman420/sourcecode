const coolButtons = document.querySelectorAll('.cool-button');

coolButtons.forEach(button => {
    button.addEventListener('click', function() {
        coolButtons.forEach(button => button.classList.remove("clicked"));
        this.classList.add("clicked");
    });
});
