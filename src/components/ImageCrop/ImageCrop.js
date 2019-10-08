import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Cropper from 'cropperjs';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { createImage } from '../../utils/helpers/ImageHandler';
import 'cropperjs/dist/cropper.css';
import './ImageCrop.scss';

const Title = ({ text, width, height }) => (
  <div className="title-wrapper">
    <span className="title">
      {text}
      {`: `}
    </span>
    <span className="size">{`${width} x ${height}`}</span>
  </div>
);

const SaveSection = ({ handleSave, cropping }) => {
  return (
    <div className="btn-save-wrapper">
      <Button
        className="btn-save"
        onClick={handleSave}
        variant="contained"
        color="primary"
      >
        <span
          style={{
            paddingRight: `${cropping ? '10px' : '0px'}`
          }}
        >
          Save
        </span>
        {cropping && <CircularProgress size={20} color="inherit" />}
      </Button>
    </div>
  );
};

let cropper = null;

const ImageCrop = props => {
  const { toWidth, toHeight, image, onCrop, fixedSize } = props;
  const imgRef = useRef(null);
  const [loadedSize, setLoadedSize] = useState({ width: 0, height: 0 });
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const [cropBoxSize, setCropBoxSize] = useState({ width: 0, height: 0 });
  const [adaptZoomBase, setAdaptZoomBase] = useState(1);
  const [cropStatus, setCropStatus] = useState('init');
  const [cropping, setCropping] = useState(false);

  const handleKeyDown = event => {
    const e = event || window.event;

    if (!cropper) {
      return;
    }

    switch (e.keyCode) {
      case 37: // left arrow
      case 65: // a
        e.preventDefault();
        cropper.move(-1, 0);
        break;
      case 38: // up arrow
      case 87: // w
        e.preventDefault();
        cropper.move(0, -1);
        break;
      case 39: // right arrow
      case 68: // d
        e.preventDefault();
        cropper.move(1, 0);
        break;
      case 40: // down arrow
      case 83: // s
        e.preventDefault();
        cropper.move(0, 1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (loadedSize.width > 0 && loadedSize.height > 0) {
      cropper = new Cropper(imgRef.current, {
        preview: '.img-preview',
        width: toWidth,
        aspectRatio: toWidth / toHeight,
        ready: () => {
          const data = cropper.getData();
          const cropBoxData = cropper.getCropBoxData();
          const curAdaptZoomBase = data.width / cropBoxData.width;
          setAdaptZoomBase(curAdaptZoomBase);
          setCropBoxSize({
            width: toWidth / curAdaptZoomBase,
            height: toHeight / curAdaptZoomBase
          });
        },
        cropstart: () => {
          setCropStatus('start');
        },
        cropmove: () => {
          setCropStatus('move');
        },
        cropend: () => {
          setCropStatus('end');
        },
        crop: e => {
          const data = e.detail;
          const height = Math.round(data.height);
          const width = Math.round(data.width);
          setPreviewSize({ width, height });
        },
        zoom: e => {
          const { ratio, oldRatio } = e.detail;
          const data = cropper.getData();
          const cropBoxData = cropper.getCropBoxData();
          const curAdaptZoomBase =
            ((data.width / cropBoxData.width) * oldRatio) / ratio;

          const newCropBoxWidth = toWidth / curAdaptZoomBase;
          const newCropBoxHeight = toHeight / curAdaptZoomBase;

          // Keep crop box is smaller than container (480x480)
          if (newCropBoxWidth <= 450 && newCropBoxHeight <= 450) {
            setAdaptZoomBase(curAdaptZoomBase);
            if (fixedSize) {
              setCropBoxSize({
                width: newCropBoxWidth,
                height: newCropBoxHeight
              });
            }
          } else {
            e.preventDefault();
          }
        }
      });
      document.body.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      cropper && cropper.destroy();
      document.body.removeEventListener('keydown', handleKeyDown);
    };
  }, [toWidth, toHeight, loadedSize, fixedSize]);

  useEffect(() => {
    if (cropper && cropStatus === 'end' && fixedSize) {
      setCropBoxSize({
        width: toWidth / adaptZoomBase,
        height: toHeight / adaptZoomBase
      });
    }
  }, [cropStatus, adaptZoomBase, toWidth, toHeight, fixedSize]);

  useEffect(() => {
    cropper && cropper.setCropBoxData(cropBoxSize);
  }, [cropBoxSize]);

  const handleSave = async () => {
    if (onCrop && cropper) {
      setCropping(true);

      const croppedImage = cropper
        .getCroppedCanvas({
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high'
        })
        .toDataURL();
      onCrop(croppedImage);

      setCropping(false);
    }
  };

  useEffect(() => {
    const getImageSize = async dataURL => {
      try {
        if (dataURL) {
          const { width, height } = await createImage(dataURL);
          if (width >= toWidth && height >= toHeight) {
            setLoadedSize({ width, height });
          } else {
            throw Error(
              `Image with size (${width}x${height}) is smaller than the required size (${toWidth}x${toHeight})`
            );
          }
        }
      } catch (error) {
        console.error('Error to image size: ', dataURL, error);
      }
    };

    getImageSize(image);
  }, [image, toWidth, toHeight]);

  return (
    <div className="image-crop-wrapper">
      <div className="origin">
        <Title
          text="Loaded Image"
          width={loadedSize.width}
          height={loadedSize.height}
        />
        {image && (
          <div className="img-container">
            <img src={image} alt="origin" ref={imgRef} />
          </div>
        )}
      </div>

      <div className="preview">
        <div className="top">
          <Title
            text="Preview"
            width={previewSize.width}
            height={previewSize.height}
          />
          <div className="img-container">
            <div className="img-preview" />
          </div>
        </div>
        <div className="bottom">
          <SaveSection handleSave={handleSave} cropping={cropping} />
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
  fixedSize: PropTypes.bool
};

ImageCrop.defaultProps = {
  fixedSize: true
};

export default ImageCrop;
