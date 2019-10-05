import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Cropper from 'react-easy-crop';
import { Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import { createImage, getCroppedImg } from '../../utils/ImageHandler';
import './ImageCrop.scss';

const LOADED_IMAGE_CONTAINER_SIZE = 480;
const PREVIEW_CONTAINER_SIDE = 288;

const PrettoSlider = withStyles({
  root: {
    color: '#5665d7',
    height: 4,
    width: '280px',
    float: 'left',
    marginLeft: '0px'
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: 'currentColor',
    border: '2px solid currentColor',
    marginTop: -10,
    marginLeft: -12,
    '&:focus,&:hover,&$active': {
      boxShadow: 'inherit'
    }
  },
  track: {
    height: 4,
    borderRadius: 4
  },
  rail: {
    height: 4,
    borderRadius: 4
  }
})(Slider);

const Title = ({ text, width, height }) => (
  <div className="title-wrapper">
    <span className="title">
      {text}
      {`: `}
    </span>
    <span className="size">{`${width} x ${height}`}</span>
  </div>
);

const ImageCrop = props => {
  const { toWidth, toHeight, image, onCrop, minZoom, maxZoom } = props;
  const cropSize = {
    width: toWidth,
    height: toHeight
  };

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation] = useState(0);
  const [aspect] = useState(toWidth / toHeight);
  const [loadedSize, setLoadedSize] = useState({ width: 0, height: 0 });
  const [croppedImage, setCroppedImage] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onImageLoaded = imageSize => {
    console.log('onImageLoaded', imageSize);
    const { naturalWidth, naturalHeight } = imageSize;

    if (naturalWidth < toWidth || naturalHeight < toHeight) {
      throw Error(
        `Image with size (${naturalWidth}x${naturalHeight}) is smaller than the required size (${toWidth}x${toHeight})`
      );
    }

    if (imageSize.naturalWidth > LOADED_IMAGE_CONTAINER_SIZE) {
      setZoom(imageSize.naturalWidth / LOADED_IMAGE_CONTAINER_SIZE);
    }
  };

  const onCropComplete = (newCroppedArea, newCroppedAreaPixels) => {
    console.log('onCropComplete', newCroppedArea, newCroppedArea);
    if (!croppedAreaPixels) getCroppedImageToPreview(newCroppedAreaPixels);
    setCroppedAreaPixels(newCroppedAreaPixels);
  };

  const onInteractionEnd = () => {
    getCroppedImageToPreview();
  };

  const getCroppedImageToPreview = async currCroppedAreaPixels => {
    const finalCroppedAreaPixels = currCroppedAreaPixels || croppedAreaPixels;

    if (image && finalCroppedAreaPixels) {
      const croppedImage = await getCroppedImg(
        image,
        finalCroppedAreaPixels,
        rotation
      );
      setCroppedImage(croppedImage);
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

  const handleZoomChange = (_, zoom) => {
    console.log('zoom change', zoom);
    setZoom(zoom);
  };

  const handleSave = () => {
    if (onCrop) {
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
            onInteractionEnd={onInteractionEnd}
            classes={{
              containerClassName: 'cropper-container',
              imageClassName: 'image',
              cropAreaClassName: 'crop-area'
            }}
          />
        </div>
      </div>

      <div className="preview">
        <Title text="Preview" width={toWidth} height={toHeight} />
        <div className="preview-container">
          <div
            className="preview-background"
            style={{
              width:
                toWidth > PREVIEW_CONTAINER_SIDE ||
                toHeight > PREVIEW_CONTAINER_SIDE
                  ? PREVIEW_CONTAINER_SIDE
                  : toWidth,
              height:
                toWidth > PREVIEW_CONTAINER_SIDE ||
                toHeight > PREVIEW_CONTAINER_SIDE
                  ? PREVIEW_CONTAINER_SIDE
                  : toHeight,
              backgroundImage: `url('images/fake-transparent.png')`,
              backgroundRepeat: 'repeat'
            }}
          >
            {croppedImage && (
              <img
                src={croppedImage}
                alt="preview"
                className="image-preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            )}
          </div>
          <div className="controls">
            <div className="zoom-section">
              <PrettoSlider
                value={zoom}
                min={minZoom}
                max={maxZoom}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={handleZoomChange}
              />
            </div>
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
  maxZoom: 50
};

export default ImageCrop;
