import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Cropper from 'react-easy-crop';
import { Button } from '@material-ui/core';
import { createImage, getCroppedImg } from '../../utils/ImageHandler';
import './ImageCrop.scss';

const LOADED_IMAGE_CONTAINER_SIZE = 480;
const PREVIEW_CONTAINER_SIZE = 288;

const Title = ({ text, width, height }) => (
  <div className="title-wrapper">
    <span className="title">
      {text}
      {`: `}
    </span>
    <span className="size">{`${width} x ${height}`}</span>
  </div>
);

const PreviewImage = ({
  largerPreviewSize,
  croppedAreaPixels,
  toWidth,
  toHeight,
  image
}) => {
  return (
    <div
      className="preview-background"
      style={{
        width: largerPreviewSize ? PREVIEW_CONTAINER_SIZE : toWidth,
        height: largerPreviewSize ? PREVIEW_CONTAINER_SIZE : toHeight,
        backgroundImage: `url('images/fake-transparent.png')`,
        backgroundRepeat: 'repeat'
      }}
    >
      {croppedAreaPixels && (
        <div
          className="image-preview"
          style={{
            backgroundImage: `url(${image})`,
            width: croppedAreaPixels.width,
            height: croppedAreaPixels.height,
            backgroundPosition: `${-croppedAreaPixels.x}px ${-croppedAreaPixels.y}px`,
            backgroundRepeat: 'no-repeat',
            zoom: largerPreviewSize
              ? PREVIEW_CONTAINER_SIZE /
                Math.max(croppedAreaPixels.width, croppedAreaPixels.height)
              : Math.min(
                  toWidth / croppedAreaPixels.width,
                  toHeight / croppedAreaPixels.height
                )
          }}
        />
      )}
    </div>
  );
};

const ImageCrop = props => {
  const { toWidth, toHeight, image, onCrop, minZoom, maxZoom } = props;
  const cropSize = {
    width: toWidth,
    height: toHeight
  };
  const largerPreviewSize =
    toWidth > PREVIEW_CONTAINER_SIZE || toHeight > PREVIEW_CONTAINER_SIZE;
  let adaptZoomBase = 1;

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation] = useState(0);
  const [aspect] = useState(toWidth / toHeight);
  const [loadedSize, setLoadedSize] = useState({ width: 0, height: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onImageLoaded = imageSize => {
    console.log('onImageLoaded', imageSize);
    const { naturalWidth, naturalHeight } = imageSize;

    if (naturalWidth < toWidth || naturalHeight < toHeight) {
      throw Error(
        `Image with size (${naturalWidth}x${naturalHeight}) is smaller than the required size (${toWidth}x${toHeight})`
      );
    }

    adaptZoomBase = Math.max(
      imageSize.naturalWidth / LOADED_IMAGE_CONTAINER_SIZE,
      imageSize.naturalHeight / LOADED_IMAGE_CONTAINER_SIZE
    );

    if (adaptZoomBase > 1) {
      setZoom(adaptZoomBase);
    } else {
      adaptZoomBase = 1;
    }
  };

  const onCropComplete = (newCroppedArea, newCroppedAreaPixels) => {
    console.log('onCropComplete', newCroppedArea, newCroppedAreaPixels, zoom);
    setCroppedAreaPixels(newCroppedAreaPixels);
  };

  const getCroppedImageToPreview = async () => {
    if (image) {
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      );
      return croppedImage;
    }

    return null;
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

  const handleSave = async () => {
    if (onCrop) {
      const croppedImage = await getCroppedImageToPreview();
      onCrop(croppedImage);
    }
  };

  useEffect(() => {
    getImageSize(image);
  }, [image]);

  return (
    <div className="image-crop-wrapper">
      <div className="origin">
        <Title
          text="Loaded Image"
          width={loadedSize.width}
          height={loadedSize.height}
        />
        <div className="crop-container">
          <Cropper
            minZoom={minZoom}
            maxZoom={maxZoom}
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropSize={cropSize}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onImageLoaded={onImageLoaded}
            restrictPosition={false}
            classes={{
              containerClassName: 'cropper-container',
              imageClassName: 'image',
              cropAreaClassName: 'crop-area'
            }}
          />
        </div>
      </div>

      <div className="preview">
        {croppedAreaPixels && (
          <Title
            text="Preview"
            width={croppedAreaPixels.width}
            height={croppedAreaPixels.height}
          />
        )}
        <div className="preview-container">
          <PreviewImage
            largerPreviewSize={largerPreviewSize}
            croppedAreaPixels={croppedAreaPixels}
            toWidth={toWidth}
            toHeight={toHeight}
            image={image}
          />
          <div className="controls">
            <div className="btn-save-wrapper">
              <Button
                className="btn-save"
                onClick={handleSave}
                variant="contained"
                color="primary"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ImageCrop.propTypes = {
  toWidth: PropTypes.number.isRequired,
  toHeight: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  onCrop: PropTypes.func.isRequired,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number
};

ImageCrop.defaultProps = {
  minZoom: 0.1,
  maxZoom: 25
};

export default ImageCrop;
