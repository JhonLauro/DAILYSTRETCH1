// ============ MODAL OPEN/CLOSE ============
function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

window.onclick = function (event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
};

// ============ CSRF HANDLER ============
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// ============ AJAX FORM SUBMISSION ============
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal form').forEach(form => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(form);
      const action = form.getAttribute('action');
      const messageBox = form.querySelector('.message');

      try {
        const response = await fetch(action, {
          method: 'POST',
          headers: { 'X-CSRFToken': csrftoken },
          body: formData
        });

        if (response.redirected) {
          // Django redirected → success
          window.location.href = response.url;
        } else {
          const html = await response.text();
          console.log("Server response:", html);
          if (messageBox) {
            messageBox.textContent = "Error: Check your input or try again.";
            messageBox.style.color = "red";
          } else {
            alert("Something went wrong — check your input.");
          }
        }
      } catch (error) {
        console.error("Error:", error);
        if (messageBox) {
          messageBox.textContent = "Server or network error.";
          messageBox.style.color = "red";
        } else {
          alert("Network or server error.");
        }
      }
    });
  });
});
