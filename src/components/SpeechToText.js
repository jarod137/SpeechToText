import React, { useState, useEffect, useRef } from "react";
import './SpeechToText.css';

const SpeechToText = () => {
  const [transcript, setTranscript] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("es"); // Default to Spanish
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.interimResults = false; // Only send complete messages
      recognition.lang = "en-US";

      recognition.onresult = async (event) => {
        if (event.results[0].isFinal) {
          const message = event.results[0][0].transcript.trim();
          setTranscript(message);
          translateText(message);
        }
      };

      recognition.onend = () => {
        if (isListening) recognition.start();
      };

      recognitionRef.current = recognition;
    } else {
      console.error("Speech recognition not supported in this browser.");
    }
  }, [isListening]);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const translateText = async (text) => {
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      setTranslatedText(data[0][0][0]);
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  const handleLanguageChange = (event) => {
    setTargetLanguage(event.target.value);
  };

  return (
    <div className="container">
      <h1>Speech to Text & Translation</h1>
      <button onClick={startListening} disabled={isListening}>
        Start Listening
      </button>
      <button onClick={stopListening} disabled={!isListening}>
        Stop Listening
      </button>
      <div>
        <label htmlFor="language">Select Language: </label>
        <select id="language" value={targetLanguage} onChange={handleLanguageChange}>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="zh">Chinese</option>
          {/* Add more languages as needed */}
        </select>
      </div>
      <p><strong>Transcript:</strong> {transcript}</p>
      <p><strong>Translated Text:</strong> {translatedText}</p>
    </div>
  );
};

export default SpeechToText;