/* eslint-disable */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Cropper from 'react-easy-crop';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import { createImage, getCroppedImg } from '../../utils/helpers/ImageHandler';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
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
        width: largerPreviewSize ? PREVIEW_CONTAINER_SIZE : toWidth + 2,
        height: largerPreviewSize ? PREVIEW_CONTAINER_SIZE : toHeight + 2,
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

class ImageCrop extends PureComponent {
  state = {
    loadedSize: { width: 0, height: 0 },
    croppedImageUrl: null,
    crop: {
      unit: 'px',
      width: this.props.toWidth,
      aspect: this.props.toWidth / this.props.toHeight
    }
  };

  onImageLoaded = image => {
    this.imageRef = image;
  };

  onCropComplete = crop => {
    console.log('onCropComplete', crop);
    this.makeClientCrop(crop);
  };

  onCropChange = crop => {
    console.log(
      'onCropChange',
      crop,
      this.imageRef.naturalWidth,
      this.imageRef.naturalHeight,
      this.imageRef.width,
      this.imageRef.height
    );
    this.setState({ crop });
  };

  async makeClientCrop(crop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(
        this.imageRef,
        crop,
        'newFile.jpeg'
      );
      this.setState({ croppedImageUrl });
    }
  }

  getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        blob.name = fileName;
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
      }, 'image/jpeg');
    });
  }

  getImageSize = async dataURL => {
    try {
      if (dataURL) {
        const loadedSize = await createImage(dataURL);
        this.setState({ loadedSize });
      }
    } catch (error) {
      console.error('Error to image size: ', dataURL, error);
    }
  };

  componentDidMount() {
    const { image } = this.props;

    if (image) {
      this.getImageSize(image);
    } else {
      console.error('Image is empty');
    }
  }

  render() {
    const { loadedSize, croppedImageUrl, crop } = this.state;
    const { image, toWidth, toHeight } = this.props;
    const largerPreviewSize =
      toWidth > PREVIEW_CONTAINER_SIZE || toHeight > PREVIEW_CONTAINER_SIZE;
    console.log('render', toWidth, toHeight);

    return (
      <div className="image-crop-wrapper">
        <div className="origin">
          {loadedSize && (
            <Title
              text="Loaded Image"
              width={loadedSize.width}
              height={loadedSize.height}
            />
          )}
          <div className="crop-container">
            {image && (
              <ReactCrop
                src={image}
                crop={crop}
                onImageLoaded={this.onImageLoaded}
                onComplete={this.onCropComplete}
                onChange={this.onCropChange}
              />
            )}
          </div>
        </div>

        <div className="preview">
          {croppedImageUrl && (
            <div>
              <div className="preview-title-wrapper">
                <Title
                  text="Preview"
                  width={Math.round(
                    (crop.width * this.imageRef.naturalWidth) /
                      this.imageRef.width
                  )}
                  height={Math.round(
                    (crop.width * this.imageRef.naturalWidth) /
                      this.imageRef.width /
                      this.state.crop.aspect
                  )}
                />
              </div>
              <PreviewImage
                largerPreviewSize={largerPreviewSize}
                croppedAreaPixels={{
                  width:
                    (crop.width * this.imageRef.naturalWidth) /
                    this.imageRef.width,
                  height:
                    (crop.height * this.imageRef.naturalHeight) /
                    this.imageRef.height,
                  x:
                    (crop.x * this.imageRef.naturalWidth) / this.imageRef.width,
                  y:
                    (crop.y * this.imageRef.naturalHeight) /
                    this.imageRef.height
                }}
                toWidth={toWidth}
                toHeight={toHeight}
                image={image}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

ImageCrop.propTypes = {
  toWidth: PropTypes.number.isRequired,
  toHeight: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  onCrop: PropTypes.func.isRequired,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  fixedSize: PropTypes.bool
};

ImageCrop.defaultProps = {
  minZoom: 0.1,
  maxZoom: 25,
  fixedSize: true
};

export default ImageCrop;
