async function loadModel() {
    const model = await tf.loadLayersModel('./MODEL/model.json');
    return model;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("Popup is working");
    setInterval(predict,1000);
});

loadModel();

async function predict() {
    // Load the model
    const model = await loadModel();
    // Tokenize and pad the input text

    let textInput = "only 550 left!!";
    const sequence = tokenizer.texts_to_sequences([textInput]);
    const paddedSequence = pad_sequences(sequence, maxlen=max_sequence_length, padding='post', truncating='post');

    // Convert to tensor
    const inputTensor = tf.tensor(paddedSequence);

    // Make a prediction
    const predictions = model.predict(inputTensor);

    // Convert predictions to array
    const predictionsArray = predictions.arraySync()[0];

    // Log predictions to the console
    console.log('Predictions:', predictionsArray);

    // Get the predicted class
    const predictedClass = predictionsArray.indexOf(Math.max(...predictionsArray));
    console.log('Predicted Class:', predictedClass);

    // Clean up (optional)
    tf.dispose([inputTensor, predictions]);

    return predictedClass;
}

