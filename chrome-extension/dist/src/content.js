console.log("Content js online!");
sendToService({ content: "yo i am working!" });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message in content js ");
  console.log(message);
  if (message.type == "PREDICTION") {
    let { type, prediction, reviewId } = message;
    console.log(type, prediction, reviewId);
    let element = document.querySelector(`#customer_review-${reviewId}`);
    element.innerHTML += `<div style="width: 200px; height: 100px; background-color: #f0f0f0; border: 2px solid #333; padding: 20px; text-align: center; font-weight: bold;">
    ${prediction}</div>`;
  }
});

function sendToService(message) {
  chrome.runtime.sendMessage(message);
}

let seen = new Set();
setInterval(() => {
  const reviews = document.querySelectorAll("[id^=customer_review-]");
  for (let review of reviews) {
    let reviewId = review.id.split("-")[1];
    if (seen.has(reviewId)) continue;
    seen.add(reviewId);
    let reviewText = review.children[4].textContent.trim();
    sendToService({ type: "PREDICT", reviewText, reviewId });
  }
}, 1000);
