import * as tf from "@tensorflow/tfjs";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "contextMenu0",
    title: "Classify image with TensorFlow.js ",
    contexts: ["image"],
  });
});

function sendMessageToContent(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type == "PREDICT") {
    let { type, reviewText, reviewId } = message;
    console.log(reviewText, reviewId, "service-worker");
    let prediction = await imageClassifier.useModel(reviewText);
    sendMessageToContent({ type: "PREDICTION", prediction, reviewId });
  }
});

class ImageClassifier {
  constructor() {
    this.loadModel();
  }

  async loadModel() {
    console.log("Loading model...");
    const startTime = performance.now();
    try {
      this.model = await tf.loadLayersModel("/MODEL/model.json");
      this.model.summary();

      const totalTime = Math.floor(performance.now() - startTime);
      console.log(`Model loaded and initialized in ${totalTime} ms...`);
    } catch (e) {
      console.error("Unable to load model", e);
    }
  }
  async predict(reviewText) {
    const PATTERNS = [
      "Forced Action",
      "Misdirection",
      "Not Dark Pattern",
      "Obstruction",
      "Scarcity",
      "Sneaking",
      "Social Proof",
      "Urgency",
    ];

    const wordIndex = await fetch("/MODEL/word_index.json").then((res) =>
      res.json()
    );
    const inputWords = reviewText
      .toLowerCase()
      .replace('!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~\t\n', "")
      .split(/\s+/);
    const inputSequence = inputWords.map((word) => wordIndex[word] || 0);
    const maxSequenceLength = 300;
    const paddedSequence = padSequence(inputSequence, maxSequenceLength);

    function padSequence(sequence, length) {
      if (sequence.length >= length) {
        return sequence.slice(0, length);
      } else {
        const padding = new Array(length - sequence.length).fill(0);
        return sequence.concat(padding);
      }
    }

    const resultArray = [...paddedSequence];
    let INPUT = tf.tensor([resultArray]);
    const prediction = this.model.predict(INPUT);
    let result = prediction.argMax(1).dataSync()[0];
    return PATTERNS[result];
  }

  async useModel(reviewText) {
    if (!this.model) {
      console.log("Waiting for model to load...");
      setTimeout(() => {
        this.useModel(reviewText);
      }, FIVE_SECONDS_IN_MS);
      return;
    }
    console.log("Predicting...");
    const startTime = performance.now();

    let prediction = await this.predict(reviewText);
    const totalTime = performance.now() - startTime;
    console.log(`Done in ${totalTime.toFixed(1)} ms `);

    return prediction;
    // const message = { content: "yoooo" };
    // chrome.tabs.sendMessage(tabId, message);
  }
}

const imageClassifier = new ImageClassifier();
