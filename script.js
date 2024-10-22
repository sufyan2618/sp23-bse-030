document.addEventListener('DOMContentLoaded', function() {
    const profilePic = document.getElementById('profile-pic');
    const nameDisplay = document.getElementById('name-display');
    const name = "Sufyan Liaquat"; // The name to display

    profilePic.addEventListener('mouseover', function() {
        nameDisplay.textContent = name;
        nameDisplay.style.display = 'block';
    });

    profilePic.addEventListener('mouseout', function() {
        nameDisplay.style.display = 'none';
    });
});