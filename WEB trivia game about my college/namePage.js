function welcomeUser() {
    var name = document.getElementById('name').value;
    if (name) {
        sessionStorage.setItem('userName', name); // Save the name in sessionStorage
        alert("Hello " + name + "! Welcome to the game. Let's go!");
        location.href = 'index.html'; // Redirect to the starting page of the quiz
    } else {
        alert("Please enter your name.");
    }
}
