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
  const { toWidth, toHeight, image } = props;

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(toWidth / toHeight);
  const [loadedSize, setLoadedSize] = useState({ width: 0, height: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    console.log('onCropComplete', croppedArea, croppedAreaPixels);
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const asyncGetCroppedImageToPreview = async (
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

  const asyncGetImageSize = async image => {
    try {
      if (image) {
        const { width, height } = await createImage(image);
        setLoadedSize({ width, height });
      }
    } catch (error) {
      console.error('Error to image size: ', image, error);
    }
  };

  useEffect(() => {
    asyncGetCroppedImageToPreview(image, croppedAreaPixels, rotation);
  }, [image, croppedAreaPixels, rotation]);

  useEffect(() => {
    asyncGetImageSize(image);
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
            className="image-preview"
            style={{
              backgroundImage: `url(${croppedImage})`,
              backggroundSize: `100% 100%`,
              width: toWidth,
              height: toHeight
            }}
          />
          <button className="btn-save">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ImageCrop;
