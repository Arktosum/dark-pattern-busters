

setInterval(() => {
  chrome.runtime.sendMessage(
    { method: "getDataFromContent" },
    function (response) {
      // Handle the received data from content.js
      console.log("Data received in popup:", response);
      let displayList = document.getElementById("found-deceptions");
      displayList.innerHTML = ``;
      for (let key in response) {
        displayList.innerHTML += `
        <li>
            <span>${key}</span>
            <span class="count">${response[key]}</span>
        </li>`;
      }
    }
  );
}, 1000);
