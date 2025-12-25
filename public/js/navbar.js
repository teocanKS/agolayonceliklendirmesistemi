document.addEventListener("DOMContentLoaded", function () {
    fetch('/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;

            
            const path = window.location.pathname;
            if (path === '/' || path === '/index.html') {
                document.getElementById('nav-home')?.classList.add('active');
            } else if (path.includes('ddos')) {
                document.getElementById('nav-ddos')?.classList.add('active');
            } else if (path.includes('risks')) {
                document.getElementById('nav-risks')?.classList.add('active');
            } else if (path.includes('decision')) {
                document.getElementById('nav-decision')?.classList.add('active');
            }
        });
});
