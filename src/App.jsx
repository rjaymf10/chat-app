/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** Import necessary modules. */
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { flushSync } from 'react-dom';
import './App.css';

/** Import necessary components. */
import ConversationDisplayArea from './components/ConversationDisplayArea.jsx';
import Header from './components/Header.jsx';
import MessageInput from './components/MessageInput.jsx';
import FileUploader from './components/FileUploader.jsx';

function App() {
  const inputRefRAG = useRef();
  const inputRefFineTuned = useRef();
  const host = "http://localhost:3000/api";
  const ragUrl = host + "/generate/";
  const fineTunedUrl = host + "/fine-tuned/";
  const [dataRAG, setDataRAG] = useState([]);
  const [dataFineTuned, setDataFineTuned] = useState([]);
  const [waitingRAG, setWaitingRAG] = useState(false);
  const [waitingFineTuned, setWaitingFineTuned] = useState(false);

  /** Function to scroll smoothly to the top of the mentioned checkpoint. */
  function executeScroll() {
    const element = document.getElementById('checkpoint');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /** Function to validate user input. */
  function validationCheck(str) {
    return str === null || str.match(/^s*$/) !== null;
  }

  /** Handle RAG chat submission. */
  const handleClick = () => {
    if (validationCheck(inputRefRAG.current.value)) {
      console.log("Empty or invalid entry");
    } else {
      handleChat();
    }
  };

  /** Handle RAG chat. */
  const handleChat = async () => {
    /** Prepare POST request data. */
    const chatData = {
      query: inputRefRAG.current.value,
      history: dataRAG
    };

    /** Add current user message to history. */
    const ndata = [...dataRAG,
    { "role": "user", "parts": [{ "text": inputRefRAG.current.value }] }];

    /**
     * Re-render DOM with updated history.
     * Clear the input box and temporarily disable input.
     */
    flushSync(() => {
      setDataRAG(ndata);
      inputRefRAG.current.value = "";
      inputRefRAG.current.placeholder = "Waiting for model's response";
      setWaitingRAG(true);
    });

    /** Scroll to the new user message. */
    executeScroll();

    /** Headers for the POST request. */
    let headerConfig = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
      }
    };

    /** Function to perform POST request. */
    const fetchData = async () => {
      var modelResponse = "";
      try {
        const response = await axios.post(ragUrl, chatData, headerConfig);
        modelResponse = response.data.response;
      } catch (error) {
        modelResponse = "Error occurred";
      } finally {
        /** Add model response to the history. */
        const updatedData = [...ndata,
        { "role": "model", "parts": [{ "text": modelResponse }] }];

        /**
         * Re-render DOM with updated history.
         * Enable input.
         */
        flushSync(() => {
          setDataRAG(updatedData);
          inputRefRAG.current.placeholder = "Enter a message.";
          setWaitingRAG(false);
        });
        /** Scroll to the new model response. */
        executeScroll();
      }
    };

    fetchData();
  };

  /** Handle fine-tuned chat submission. */
  const handleClickFineTuned = () => {
    if (validationCheck(inputRefFineTuned.current.value)) {
      console.log("Empty or invalid entry");
    } else {
      handleChatFineTuned();
    }
  };

  /** Handle fine-tuned chat. */
  const handleChatFineTuned = async () => {
    const chatData = {
      query: inputRefFineTuned.current.value,
      history: dataFineTuned
    };

    const ndata = [...dataFineTuned,
    { "role": "user", "parts": [{ "text": inputRefFineTuned.current.value }] }];

    flushSync(() => {
      setDataFineTuned(ndata);
      inputRefFineTuned.current.value = "";
      inputRefFineTuned.current.placeholder = "Waiting for model's response";
      setWaitingFineTuned(true);
    });

    executeScroll();

    let headerConfig = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        "Access-Control-Allow-Origin": "*",
      }
    };

    const fetchData = async () => {
      var modelResponse = "";
      try {
        const response = await axios.post(fineTunedUrl, chatData, headerConfig);
        modelResponse = response.data.response;
      } catch (error) {
        modelResponse = "Error occurred";
      } finally {
        const updatedData = [...ndata,
        { "role": "model", "parts": [{ "text": modelResponse }] }];

        flushSync(() => {
          setDataFineTuned(updatedData);
          inputRefFineTuned.current.placeholder = "Enter a message.";
          setWaitingFineTuned(false);
        });
        executeScroll();
      }
    };

    fetchData();
  };

  return (
    <center>
      <div className="chat-container">
        <div className="chat-column">
          <h2>RAG Chatbot</h2>
          <Header />
          <FileUploader />
          <ConversationDisplayArea data={dataRAG} />
          <div className="input-area">
            <MessageInput inputRef={inputRefRAG} waiting={waitingRAG} handleClick={handleClick} />
          </div>
        </div>
        <div className="chat-column">
          <h2>Fine-tuned Chatbot</h2>
          <Header />
          <ConversationDisplayArea data={dataFineTuned} />
          <div className="input-area">
            <MessageInput inputRef={inputRefFineTuned} waiting={waitingFineTuned} handleClick={handleClickFineTuned} />
          </div>
        </div>
      </div>
    </center>
  );
}

export default App;
