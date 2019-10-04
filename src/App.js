import React from 'react';
import ImageCrop from './components/ImageCrop';
import './App.scss';

const imgURL =
  'https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg?cache=sih0jwle4e&ops=1910_1000';

const App = () => {
  const handleOnCrop = dataURL => {
    console.log('handleOnCrop', dataURL);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h2>React Image Cropper</h2>
      </header>

      <ImageCrop
        image={imgURL}
        toWidth={144}
        toHeight={144}
        onCrop={handleOnCrop}
      />
      
      <footer className="footer">
        <p>
          Made by <a href="https://about.phamvanlam.com/">Lam Pham</a>. Powered
          by{' '}
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
