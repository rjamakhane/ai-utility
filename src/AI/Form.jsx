import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const App = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [loading, setLoading] = useState(false);

  const API_KEY = 'AIzaSyCA1tfT_sDj6FTWzTwfW1zRSzcjv7aGdfA'; // Replace with your actual API key
  const MODEL_NAME = 'gemini-1.5-pro'; // Or 'gemini-1.5-pro' or other valid model

  const generateContent = async () => {
    setLoading(true);
    setOutputText('');

    if (!API_KEY) {
      setOutputText("Please provide your Gemini API key.");
      setLoading(false);
      return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME }); // Use the defined model name

    const prompt = `Act as a content expert. Please improve the following paragraph for grammar, spelling, clarity, and overall quality. Return the 2 to 3 improved text version and one version in kannada. Do not add any extra text or explanation.

    ${inputText}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setOutputText(text);
    } catch (error) {
      console.error("Error generating content:", error);
      setOutputText("An error occurred while processing your request. Error details:"+ error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>Content Improver with Gemini AI</h1>
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter your paragraph here..."
        style={{ width: '100%', height: '200px', marginBottom: '10px', padding: '10px' }}
      />
      <button onClick={generateContent} disabled={loading}>
        {loading ? 'Processing...' : 'Improve Content'}
      </button>
      {outputText && (
        <div style={{ marginTop: '20px' }}>
          <h2>Improved Content:</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{outputText}</p>
        </div>
      )}
    </div>
  );
};

export default App;