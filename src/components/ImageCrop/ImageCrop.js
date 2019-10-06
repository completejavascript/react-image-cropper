import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Cropper from 'react-easy-crop';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import { withStyles } from '@material-ui/core/styles';
import { createImage, getCroppedImg } from '../../utils/ImageHandler';
import './ImageCrop.scss';

const LOADED_IMAGE_CONTAINER_SIZE = 480;
const PREVIEW_CONTAINER_SIZE = 288;

const PrettoSlider = withStyles({
  root: {
    color: '#5665d7',
    height: 4,
    width: '160px',
    marginLeft: '15px',
    marginRight: '15px'
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
  },
  active: {}
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
        backgroundRepeat: 'repeat',
        border: '1px solid #909090',
        marginBottom: '15px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
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

const ZoomSection = ({
  zoom,
  minZoom,
  maxZoom,
  adaptZoomBase,
  handleZoomChange
}) => {
  const [percentage, setPercentage] = useState(
    Math.round((zoom * 100) / adaptZoomBase)
  );

  const handleOnChange = event => {
    const newZoom = (Number(event.target.value) * adaptZoomBase) / 100;
    handleZoomChange('', newZoom);
  };

  useEffect(() => {
    setPercentage(Math.round((zoom * 100) / adaptZoomBase));
  }, [zoom, adaptZoomBase]);

  return (
    <div className="zoom-section">
      <span className="title">Zoom</span>
      <PrettoSlider
        value={zoom}
        min={minZoom}
        max={maxZoom}
        step={0.1}
        aria-labelledby="Zoom"
        onChange={handleZoomChange}
      />
      <Input
        className="percentage-input"
        type="number"
        value={percentage}
        onChange={handleOnChange}
      />
      <span className="value">%</span>
    </div>
  );
};

const SaveSection = ({ handleSave }) => {
  return (
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

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation] = useState(0);
  const [aspect] = useState(toWidth / toHeight);
  const [loadedSize, setLoadedSize] = useState({ width: 0, height: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [adaptZoomBase, setAdaptZoomBase] = useState(1);

  const onImageLoaded = imageSize => {
    const { naturalWidth, naturalHeight } = imageSize;

    if (naturalWidth < toWidth || naturalHeight < toHeight) {
      throw Error(
        `Image with size (${naturalWidth}x${naturalHeight}) is smaller than the required size (${toWidth}x${toHeight})`
      );
    }

    if (
      imageSize.naturalWidth > LOADED_IMAGE_CONTAINER_SIZE ||
      imageSize.naturalHeight > LOADED_IMAGE_CONTAINER_SIZE
    ) {
      const zoomValue = Math.max(
        imageSize.naturalWidth / LOADED_IMAGE_CONTAINER_SIZE,
        imageSize.naturalHeight / LOADED_IMAGE_CONTAINER_SIZE
      );
      setZoom(zoomValue);
      setAdaptZoomBase(zoomValue);
    }
  };

  const onCropComplete = (newCroppedArea, newCroppedAreaPixels) => {
    console.log(
      'onCropComplete',
      newCroppedArea,
      newCroppedAreaPixels,
      zoom,
      adaptZoomBase
    );
    setCroppedAreaPixels(newCroppedAreaPixels);
  };

  const getCroppedImageToPreview = async () => {
    if (image && croppedAreaPixels) {
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

  const handleZoomChange = (_, zoom) => {
    setZoom(zoom);
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
          <div className="preview-title-wrapper">
            <Title
              text="Preview"
              width={croppedAreaPixels.width}
              height={croppedAreaPixels.height}
            />
          </div>
        )}
        <div className="preview-container">
          <div className="top">
            <PreviewImage
              largerPreviewSize={largerPreviewSize}
              croppedAreaPixels={croppedAreaPixels}
              toWidth={toWidth}
              toHeight={toHeight}
              image={image}
            />
            <ZoomSection
              zoom={zoom}
              minZoom={minZoom}
              maxZoom={maxZoom}
              adaptZoomBase={adaptZoomBase}
              handleZoomChange={handleZoomChange}
            />
          </div>
          <div className="bottom">
            <SaveSection handleSave={handleSave} />
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
