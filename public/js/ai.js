// Function to close modal
function closeModal() {
  document.getElementById("welcomeModal").style.display = "none";
}

// Function to create a video embed
function createVideoEmbed(src) {
  const embedDiv = document.createElement("div");
  embedDiv.className = "embed-responsive embed-responsive-16by9 mt-3";
  embedDiv.style.maxWidth = "560px";

  const video = document.createElement("iframe");
  video.src = src;
  video.className = "embed-responsive-item";

  embedDiv.appendChild(video);

  return embedDiv;
}

// Define a map of commands and their corresponding actions
const commands = {
  "give me some motivation": () => {
    const embed = createVideoEmbed("https://www.youtube.com/embed/ZXsQAXx_ao0");
    chat.appendChild(embed);
  },
  "i am eating a cookie": () => {
    const embed = createVideoEmbed(
      "https://www.youtube.com/embed/7HrnWC8zBcE?si=d5c624JBGk_H3cBz"
    );
    chat.appendChild(embed);
  },
};

function send(id) {
  const userInput = document
    .getElementById("userInput" + id)
    .value.toLowerCase();

  // Check if the user's input is a known command
  if (commands.hasOwnProperty(userInput)) {
    commands[userInput]();
  } else {
    fetch("/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ line: userInput }),
    })
      .then((response) => response.text())
      .then((data) => {
        const chat = document.getElementById("chat");

        const responseDiv = document.createElement("div");
        responseDiv.textContent = "AI: " + data;
        responseDiv.className = "alert alert-secondary mt-3";

        chat.appendChild(responseDiv);

        document.getElementById("userInput" + id).value = "";

        closeModal();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}
