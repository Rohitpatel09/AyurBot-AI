const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");

// Function to escape HTML tags
const escapeHTML = (str) => {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
};

// Create message element with dynamic classes and return it
const createMessageElement = (content, classes) => {
    const div = document.createElement("div");
    div.classList.add("message", classes);

    // Create a message-text div and set its content
    const messageText = document.createElement("div");
    messageText.classList.add("message-text");
    messageText.innerHTML = content; // Use innerHTML for thinking indicator
    div.appendChild(messageText);

    return div;
};

// Display thinking indicator (bot avatar + three dots animation)
const showThinkingIndicator = () => {
    const thinkingContent = `
        <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
            <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
        </svg>
        <div class="thinking-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;
    const thinkingDiv = createMessageElement(thinkingContent, "bot-message");
    chatBody.appendChild(thinkingDiv);

    // Auto-scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;
};

// Function to generate bot response using Google AI API
const generateBotResponse = async (userMessage) => {
  
    const apiKey = "AIzaSyC4Be8kZwgOeZ3hq2T4goezpXeGM2swlfw"; // Replace with your API key
    // const apiUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent"; // Example endpoint
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"; // Example endpoint

    try {
        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: userMessage,
                            },
                        ],
                    },
                ],
            }),
        });

        // Log the full response for debugging
        console.log("API Response:", response);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("API Data:", data); // Log the API data for debugging

        // Extract the generated text from the API response
        const botResponse = data.candidates[0].content.parts[0].text;
        return botResponse;
    } catch (error) {
        console.error("Error generating bot response:", error);
        return "Sorry, I couldn't generate a response. Please try again.";
    }
};

// Handle outgoing user messages
const handleOutgoingMessage = async (userMessage) => {
    // Escape HTML tags in the user's message
    const escapedMessage = escapeHTML(userMessage);

    // Create and display user message
    const outgoingMessageDiv = createMessageElement(escapedMessage, "user-message");
    chatBody.appendChild(outgoingMessageDiv);

    // Clear the input field
    messageInput.value = "";

    // Auto-scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    // Show thinking indicator (bot avatar + three dots) after every user message
    showThinkingIndicator();

    // Generate bot response
    try {
        const botResponse = await generateBotResponse(userMessage);

        // Remove the thinking indicator
        chatBody.removeChild(chatBody.lastChild);

        // Display the bot's response
        const botMessageDiv = createMessageElement(botResponse, "bot-message");
        chatBody.appendChild(botMessageDiv);
    } catch (error) {
        // Remove the thinking indicator
        chatBody.removeChild(chatBody.lastChild);

        // Display an error message
        const errorMessageDiv = createMessageElement("Sorry, something went wrong. Please try again.", "bot-message");
        chatBody.appendChild(errorMessageDiv);
    }

    // Auto-scroll to the bottom
    chatBody.scrollTop = chatBody.scrollHeight;
};

// Handle enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === "Enter" && userMessage) {
        e.preventDefault(); // Prevent default behavior (e.g., new line in textarea)
        handleOutgoingMessage(userMessage); // Pass the user message
    }
});

// Handle send button click
sendMessageButton.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent form submission
    const userMessage = messageInput.value.trim();
    if (userMessage) {
        handleOutgoingMessage(userMessage); // Pass the user message
    }
});