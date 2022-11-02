var accordion = document.getElementsByClassName("accordion");
for (var i = 0; i < accordion.length; i++) {
    accordion[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        let maxHeight = panel.scrollHeight;
        panel.querySelectorAll('.panel').forEach(elem => maxHeight += elem.scrollHeight);
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = maxHeight + "px";
        } 
    });
}
