import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { createImage, getCroppedImg } from '../utils/ImageHandler';
import './ImageCrop.scss';

const Title = ({ text, width, height }) => (
  <div className="title-wrapper">
    {text}
    {`: `}
    <span className="size">{`${width} x ${height}`}</span>
  </div>
);

const ImageCrop = props => {
  const { toWidth, toHeight, image, onCrop } = props;

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation] = useState(0);
  const [aspect] = useState(toWidth / toHeight);
  const [loadedSize, setLoadedSize] = useState({ width: 0, height: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    console.log('onCropComplete', croppedArea, croppedAreaPixels);
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImageToPreview = async (
    image,
    croppedAreaPixels,
    rotation
  ) => {
    try {
      if (image && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(
          image,
          croppedAreaPixels,
          rotation
        );
        setCroppedImage(croppedImage);
      }
    } catch (e) {
      console.error('Error to get cropped image', e);
    }
  };

  const getImageSize = async image => {
    try {
      if (image) {
        const { width, height } = await createImage(image);
        setLoadedSize({ width, height });
      }
    } catch (error) {
      console.error('Error to image size: ', image, error);
    }
  };

  const handleSave = () => {
    if (onCrop) {
      onCrop(croppedImage);
    }
  };

  useEffect(() => {
    getCroppedImageToPreview(image, croppedAreaPixels, rotation);
  }, [image, croppedAreaPixels, rotation]);

  useEffect(() => {
    getImageSize(image);
  }, [image]);

  return (
    <div className="image-crop-wrapper">
      <div className="origin">
        <Title
          text="Loaded Size"
          width={loadedSize.width}
          height={loadedSize.height}
        />
        <div className="crop-container">
          <Cropper
            minZoom={0.1}
            maxZoom={3}
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
      </div>

      <div className="preview">
        <Title text="Preview Size" width={toWidth} height={toHeight} />
        <div className="preview-container">
          <div
            className="preview-background"
            style={{
              width: toWidth > 288 || toHeight > 288 ? 288 : toWidth,
              height: toWidth > 288 || toHeight > 288 ? 288 : toHeight
            }}
          >
            <img
              src={croppedImage}
              alt="preview"
              className="image-preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'scale-down'
              }}
            />
          </div>
          <button className="btn-save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCrop;
