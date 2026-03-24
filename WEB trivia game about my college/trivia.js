var points = parseInt(sessionStorage.getItem('points')) || 0; // Initialize score from session or start at 0

function checkAnswer(button, correct, nextPage) {
    if (correct) {
        points += 5; // Award 5 points for a correct answer
        alert("Correct! You earned 5 points.");
        sessionStorage.setItem("points", points); // Update session score
        location.href = nextPage; // Move to the next question
    } else {
points - 5;
        alert("Sorry Wrong Answer");
        sessionStorage.setItem("points", points); // Update session score
        location.href = nextPage; // Move to the next question
    }
}

function updateScore() {
    var score = sessionStorage.getItem("points") || 0;
    document.getElementById("score").innerText = "Score: " + score;
}

function saveName() {
    var name = document.getElementById("userName").value;
    sessionStorage.setItem("userName", name);
}

function displayFinalScore() {
    var name = sessionStorage.getItem("userName") || "Player";
    var finalScore = sessionStorage.getItem("points") || 0;
    document.getElementById("userNameDisplay").innerText = name;
    document.getElementById("finalScore").innerText = finalScore;
}
