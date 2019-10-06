import React from 'react';
import ImageCrop from './components/ImageCrop/ImageCrop';
import { downloadBase64Image } from './utils/ImageHandler';
import './App.scss';

const imgURL = 'images/dog_1910x1000_test.jpeg';
// const imgURL = 'images/dog_1000x1910_test.jpeg';
// const imgURL = 'images/wall_paper_400x400.jpg';
// const imgURL = 'images/apple-icon-144x144.png';
// const imgURL = 'https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg?cache=sih0jwle4e&ops=1910_1000';

const App = () => {
  const handleOnCrop = dataURL => {
    downloadBase64Image(dataURL, 'output');
  };

  return (
    <div className="app-container">
      <header className="header">
        <h2>React Image Cropper</h2>
      </header>

      <ImageCrop
        image={imgURL}
        toWidth={300}
        toHeight={400}
        onCrop={handleOnCrop}
      />

      <footer className="footer">
        <p>
          Powered by{' '}
          <a href="https://github.com/ricardo-ch/react-easy-crop">
            react-easy-crop
          </a>
          .
        </p>
      </footer>
    </div>
  );
};

export default App;
