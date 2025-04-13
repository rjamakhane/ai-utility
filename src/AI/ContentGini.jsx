import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { styled } from '@mui/material/styles';
import { TextField, Button, IconButton, Paper } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// Styled Components for layout and basic styling
const InputRow = styled(Paper)`
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
`;

const StyledTextArea = styled(TextField)`
  flex-grow: 1;
  margin-right: 16px;
`;

const ResultsContainer = styled(Paper)`
  margin-top: 20px;
  padding: 16px;
`;

const LanguageGroup = styled('div')`
  margin-bottom: 20px;
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const LanguageTitle = styled('h3')`
  margin-top: 0;
  margin-bottom: 10px;
`;

const SampleRow = styled('div')`
  display: grid;
  grid-template-columns: 1fr 5fr 1fr; /* Adjust column widths as needed */
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const SampleNumber = styled('span')`
  font-weight: bold;
  padding-right: 16px;
`;

const SampleText = styled('p')`
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
`;

const StyledIconButton = styled(IconButton)`
  padding: 8px;
`;

const App = () => {
  const [inputText, setInputText] = useState('');
  const [generatedData, setGeneratedData] = useState(null); // Store the parsed JSON response
  const [loading, setLoading] = useState(false);
  const [copiedStates, setCopiedStates] = useState({}); // Track the copy state for each text

  const MODEL_NAME = 'gemini-1.5-pro';
  const API_KEY = process.env.GEMINI_API_KEY;

  const generateContent = async () => {
    setLoading(true);
    setGeneratedData(null);

    if (!API_KEY) {
      alert("Please provide your Gemini API key.");
      setLoading(false);
      return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `Act as a content expert. 
      Please improve the following paragraph for grammar, spelling, clarity, and overall quality. 
      Return the improved text versions within a JSON object where keys represent the language.
      Each language key should have an array of improved text samples (even if it's just one). 
      The JSON object should have the following structure:
      {
        "languages": ["en", "kn"],
        "samples": {
          "en": [
            "Improved English version 1",
            "Improved English version 2"
          ],
          "kn": [
            "Kannada version"
          ]
        }
      }

      Do not include any extra text or explanation outside of this JSON structure.

      ---
      ${inputText}
  `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;

      if (response && response.candidates && response.candidates.length > 0) {
        const firstCandidate = response.candidates[0];
        if (firstCandidate.content && firstCandidate.content.parts && firstCandidate.content.parts.length > 0) {
          const text = firstCandidate.content.parts[0].text;
          if (text) {
            // The JSON response is often wrapped in markdown code blocks (```json ... ```)
            // We need to extract the actual JSON string.
            const jsonMatch = text.match(/```json\n([\s\S]*)\n```/);
            let jsonString = text;
            if (jsonMatch && jsonMatch[1]) {
              jsonString = jsonMatch[1].trim();
            }

            try {
              const parsedResponse = JSON.parse(jsonString);
              setGeneratedData(parsedResponse);
              // Initialize copied states for new data
              const initialCopiedStates = {};
              for (const lang in parsedResponse.samples) {
                parsedResponse.samples[lang].forEach(content => {
                  initialCopiedStates[content?.trim()] = false;
                });
              }
              setCopiedStates(initialCopiedStates);
            } catch (e) {
              console.error("Error parsing JSON response:", e);
              console.error("Raw response text:", text); // Log the raw text for debugging
              setGeneratedData({ error: "Failed to parse the API response." });
            }
          } else {
            setGeneratedData({ error: "No text content found in the API response." });
          }
        } else {
          setGeneratedData({ error: "Unexpected structure in the API response (missing content parts)." });
        }
      } else {
        setGeneratedData({ error: "No candidates found in the API response." });
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setGeneratedData({ error: `An error occurred: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard:', text);
      // Update the copied state for this text
      setCopiedStates(prevState => ({
        ...prevState,
        [text]: true,
      }));
      // Reset the state after a short delay (e.g., 1.5 seconds)
      setTimeout(() => {
        setCopiedStates(prevState => ({
          ...prevState,
          [text]: false,
        }));
      }, 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Optionally show an error message
    }
  };

  return (
    <div style={{ padding: '20px', margin: 'auto' }}>
      <h1>Content Improver with Gemini AI</h1>

      <InputRow>
        <StyledTextArea
          label="Enter your paragraph here..."
          variant="outlined"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          multiline
          rows={4}
          fullWidth
          style={{ marginRight: '16px' }}
        />
        <Button variant="contained" color="primary" onClick={generateContent} disabled={loading} style={{ flexShrink: 0 }}>
          {loading ? 'Processing...' : 'Improve Content'}
        </Button>
      </InputRow>

      {generatedData && generatedData.error && (
        <ResultsContainer>
          <h2>Error:</h2>
          <p>{generatedData.error}</p>
        </ResultsContainer>
      )}

      {generatedData && generatedData.samples && (
        <TableContainer component={Paper}>
          {generatedData.languages.map((language) => (
            <Table key={language} sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell colSpan={3}>{language} Content</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {generatedData.samples[language].map((content, index) => {
                  const trimmedContent = content?.trim();
                  return (
                    <TableRow
                      key={trimmedContent}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {index + 1}
                      </TableCell>
                      <TableCell align='left'>
                        <SampleText>{trimmedContent}</SampleText>
                      </TableCell>
                      <TableCell align="right">
                        <StyledIconButton
                          onClick={() => handleCopyToClipboard(trimmedContent)}
                          aria-label="copy"
                        >
                          {copiedStates[trimmedContent] ? <CheckCircleOutlineIcon color="success" /> : <ContentCopyIcon />}
                        </StyledIconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ))}
        </TableContainer>
      )}

    </div>
  );
};

export default App;