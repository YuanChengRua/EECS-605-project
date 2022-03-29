import './App.css';
import React from 'react';

// atob is deprecated but this function converts base64string to text string
const decodeFileBase64 = (base64String) => {
  // From Bytestream to Percent-encoding to Original string
  return decodeURIComponent(
    atob(base64String).split("").map(function (c) {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join("")
  );
};



function App() {
  const [inputFileData, setInputFileData] = React.useState(''); // represented as bytes data (string)
  const [outputFileData, setOutputFileData] = React.useState(''); // represented as readable data (text string)
  const [outputFileDatarmse, setOutputFileDatarmse] = React.useState('');
  const [buttonDisable, setButtonDisable] = React.useState(true);
  const [buttonText, setButtonText] = React.useState('Submit');

  // convert file to bytes data
  const convertFileToBytes = (inputFile) => {
    console.log('converting file to bytes...');
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(inputFile); // reads file as bytes data

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  }

  // handle file input
  const handleChange = async (event) => {
    // Clear output text.
    setOutputFileData("");

    console.log('newly uploaded file');
    const inputFile = event.target.value;
    console.log(inputFile);

    // convert file to bytes data
//     const base64Data = await convertFileToBytes(inputFile);
//     const base64DataArray = base64Data.split('base64,'); // need to get rid of 'data:image/png;base64,' at the beginning of encoded string
//     const encodedString = base64DataArray[1];
    setInputFileData(inputFile);
    console.log('file converted successfully');

    // enable submit button
    setButtonDisable(false);
  }

  // handle file submission
  const handleSubmit = (event) => {
    event.preventDefault();

    // temporarily disable submit button
    setButtonDisable(true);
    setButtonText('Loading Result');

    console.log('making POST request...');
    fetch('https://s0ixq8xo4d.execute-api.us-east-1.amazonaws.com/prod/', {
      method: 'POST',
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ "csv": inputFileData })
    }).then(response => response.json())
    .then(data => {
      console.log('getting response...')
      console.log(data);

      // POST request error
      if (data.statusCode === 400) {
        const outputErrorMessage = JSON.parse(data.errorMessage)['outputResultsData'];
        setOutputFileData(outputErrorMessage);
      }

      // POST request success
      else {
        const outputBytesData = JSON.parse(data.body)['outputResultsData'];
        console.log('making POST request...');
        fetch('https://tw964j9gb8.execute-api.us-east-1.amazonaws.com/prod/', {
          method: 'POST',
          headers: { "Content-Type": "application/json"},
          body: JSON.stringify({"txt": outputBytesData})
        }).then(response => response.json())
        .then(data => {
          console.log('getting response...')
          console.log(data);
          if (data.statusCode==400){
            const outputErrorMessage = JSON.parse(data.errorMessage)['outputResultsData'];
            setOutputFileData(outputErrorMessage);
          }
          else {
            const outputBytesData = JSON.parse(data.body)['outputResultsData'];
            setOutputFileData(outputBytesData);
            const outputBytesDatarmse = JSON.parse(data.body)['outputResultsDatarmse'];
            setOutputFileDatarmse(decodeFileBase64(outputBytesDatarmse))
          }
        })
      }
      // re-enable submit button
      setButtonDisable(false);
      setButtonText('Submit');
    })
    .then(() => {
      console.log('POST request success');
    })
  }

  return (
    <div className="App">
      <div className="Input">
        <h1>Input</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" onChange={handleChange} />
          <button type="submit" disabled={buttonDisable}>{buttonText}</button>
        </form>
        <img src={`data:;base64,${outputFileData}`} alt="12323" />
       </div>
       <div className="Output">
        <h1>Results</h1>
        <p>{outputFileDatarmse}</p>
      </div>
    </div>
  );
}

export default App;
