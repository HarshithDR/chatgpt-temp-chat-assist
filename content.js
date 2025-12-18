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
  if (document.getElementById("cgpt-helper-popup")) return;

  const popup = document.createElement("div");
  popup.id = "cgpt-helper-popup";
  popup.style.cssText = `
    position: fixed; right: 20px; bottom: 20px;
    width: 420px; height: 600px; background: #1e1e1e;
    z-index: 99999; border-radius: 10px; overflow: hidden;
    box-shadow: 0 0 20px rgba(0,0,0,0.4);
    display: flex; flex-direction: column;
    resize: both;
  `;

  const header = document.createElement("div");
  header.style.cssText = `
    background: #333; color: white; padding: 8px;
    display: flex; justify-content: space-between;
    align-items: center; cursor: move;
  `;
  header.textContent = "Temporary Chat";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✖";
  closeBtn.style.cssText = `
    background: none; border: none; color: white;
    cursor: pointer; font-size: 16px;
  `;
  closeBtn.onclick = () => popup.remove();
  header.appendChild(closeBtn);

  // Get last chat context
  const chatContext = getChatContext();
  const promptText = `(Temporary Chat) Use the following context:\n${chatContext}\n\nSelected Text:\n"${selectedText}"`;

  const iframe = document.createElement("iframe");
  iframe.src = `https://chat.openai.com/?temporary-chat=true&prompt=${encodeURIComponent(promptText)}`;
  iframe.style.cssText = `
    width: 100%; height: calc(100% - 40px); border: none; flex-grow: 1;
  `;

  popup.appendChild(header);
  popup.appendChild(iframe);
  document.body.appendChild(popup);

  makeDraggable(popup, header);
}

// Make draggable (keep your existing function)
function makeDraggable(element, handle) {
  let offsetX = 0, offsetY = 0, isDown = false;
  handle.addEventListener("mousedown", e => {
    isDown = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    element.style.cursor = "grabbing";
  });
  document.addEventListener("mousemove", e => {
    if (!isDown) return;
    element.style.left = e.clientX - offsetX + "px";
    element.style.top = e.clientY - offsetY + "px";
  });
  document.addEventListener("mouseup", () => {
    isDown = false;
    element.style.cursor = "move";
  });
}

// Trigger on Alt + Select
document.addEventListener("mouseup", e => {
  if (!e.altKey) return;
  const selectedText = window.getSelection().toString().trim();
  if (!selectedText) return;
  showPopup(selectedText);
});
