// Grab last N messages from ChatGPT UI
function getChatContext() {
  const messages = [];
  const messageNodes = document.querySelectorAll(
    "div[class*='group'] div[class*='markdown']"
  );
  messageNodes.forEach(node => {
    const text = node.innerText.trim();
    if (text) messages.push(text);
  });
  return messages.slice(-5).join("\n\n"); // Last 5 messages
}

// Function to show popup with context + selection
function showPopup(selectedText) {
  // 🔥 Force cleanup of old popup (prevents white screen)
  const oldPopup = document.getElementById("cgpt-helper-popup");
  if (oldPopup) {
    const oldIframe = oldPopup.querySelector("iframe");
    if (oldIframe) oldIframe.src = "about:blank";
    oldPopup.remove();
  }

  const popup = document.createElement("div");
  popup.id = "cgpt-helper-popup";
  popup.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 420px;
    height: 600px;
    background: #1e1e1e;
    z-index: 99999;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0,0,0,0.4);
    resize: both;
    display: flex;
    flex-direction: column;
  `;

  // Header
  const header = document.createElement("div");
  header.style.cssText = `
    background: #333;
    color: white;
    padding: 8px;
    display: flex;
    justify-content: space-between;
    cursor: move;
  `;
  header.textContent = "Temporary Chat";

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✖";
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 16px;
  `;
  closeBtn.onclick = () => {
    const iframe = popup.querySelector("iframe");
    if (iframe) iframe.src = "about:blank";
    popup.remove();
  };
  header.appendChild(closeBtn);

  popup.appendChild(header);
  document.body.appendChild(popup);

  // ---- CONTEXT + PROMPT ----
  const chatContext = getChatContext();
  const promptText = `
You are a helpful AI tutor.
Use the following conversation context:

${chatContext}

Now explain this selected text in simple terms:
"${selectedText}"
`;

  // ---- SAFE IFRAME LOAD ----
  const iframe = document.createElement("iframe");
  const cacheBuster = Date.now();
  iframe.src = `https://chat.openai.com/?temporary-chat=true&prompt=${encodeURIComponent(promptText)}&_=${cacheBuster}`;
  iframe.style.cssText = `
    width: 100%;
    height: calc(100% - 40px);
    border: none;
    background: white;
  `;

  // ⏱ Delay prevents Chrome iframe race bug
  setTimeout(() => {
    popup.appendChild(iframe);
  }, 50);

  makeDraggable(popup, header);
}



function makeDraggable(element, handle) {
  let isDown = false, offsetX = 0, offsetY = 0;

  handle.addEventListener("mousedown", e => {
    isDown = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
  });

  document.addEventListener("mousemove", e => {
    if (!isDown) return;
    element.style.left = e.clientX - offsetX + "px";
    element.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    isDown = false;
  });
}



// Trigger on Alt + Select
document.addEventListener("mouseup", e => {
  if (!e.altKey) return;
  const selectedText = window.getSelection().toString().trim();
  if (!selectedText) return;
  showPopup(selectedText);
});
