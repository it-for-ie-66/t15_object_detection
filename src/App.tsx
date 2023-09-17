import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { useEffect, useState, useRef } from "react";
import { load_model } from "./model";
import {
  vdo_params,
  handleWebcamError,
  getVideoConstraints,
  displayPredictions,
  getPrediction,
} from "./utils";
import Webcam from "react-webcam";
import "./App.css";
import { div } from "@tensorflow/tfjs";

const { width, height, isMobile } = vdo_params();

function App() {
  const [model, setModel] = useState<cocoSsd.ObjectDetection>();

  const [ready, setReady] = useState(false);

  const [previewImage, setPreviewImage] = useState<any>(null);

  const webcamRef = useRef<any>(null);
  const [error, setError] = useState("");
  const [switched, setSwitched] = useState(false);

  const [predictions, setPredictions] = useState<
    cocoSsd.DetectedObject[] | null
  >([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const sub = useRef<any>(null);

  useEffect(() => {
    load_model().then((model) => {
      setModel(model);
      setReady(true);
    });
  }, []);

  const videoConstraints = getVideoConstraints(
    width,
    height,
    isMobile,
    switched
  );

  async function singlePrediction() {
    const predictions = await getPrediction(model, webcamRef);
    setPredictions(predictions);
    if (predictions) displayPredictions(predictions, width, height);
  }

  function continuousPrediction() {
    setIsPredicting(true);
    sub.current = setInterval(async () => {
      const predictions = await getPrediction(model, webcamRef);
      setPredictions(predictions);
      if (predictions) displayPredictions(predictions, width, height);
    }, 1000);
  }

  function stopPrediction() {
    setIsPredicting(false);
    if (sub.current) clearInterval(sub.current);
  }

  function switchCamera() {
    setSwitched(!switched);
  }

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    // User needs to select an image
    if (!e.target.files) return;
    // There has to be one file.
    if (e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Read the file
    const fileReader = new FileReader();
    fileReader.addEventListener("load", async () => {
      setPreviewImage(fileReader.result);
      setPredictions([]);
    });
    fileReader.readAsDataURL(file);
  };

  function handleLoad(e: any) {
    if (!model) return;
    model
      .detect(e.target)
      .then((predictions) => {
        setPredictions(predictions);
        if (predictions) displayPredictions(predictions, width, height);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  if (!ready) return <div>...loading</div>;
  if (error) return <div>{error}</div>;

  // Testing image detection, no webcam
  return (
    <>
      <>
        <h1>Image Classifier</h1>
        <div>
          <input type="file" onChange={handleSelectImage} />
        </div>
        <div>
          {previewImage && (
            <img
              src={previewImage}
              alt="preview-image"
              style={{ height: "50vh" }}
              onLoad={handleLoad}
            />
          )}
        </div>

        <div>
          <h2>Prediction</h2>
          {predictions?.map((p, idx) => (
            <div key={idx}>
              {p.class} (มั่นใจ {(p.score * 100).toFixed(0)}%) (Location:{" "}
              {p.bbox[0].toFixed(0)} {p.bbox[1].toFixed(0)}{" "}
              {p.bbox[2].toFixed(0)} {p.bbox[3].toFixed(0)})
            </div>
          ))}
        </div>
      </>
    </>
  );

  // Actual webcam detection
  return (
    <>
      {/* Menu */}
      <div className="menu">
        <button onClick={singlePrediction} disabled={isPredicting}>
          Single
        </button>
        <button onClick={continuousPrediction} disabled={isPredicting}>
          Continuous
        </button>
        <button onClick={stopPrediction} disabled={!isPredicting}>
          Stop Detect
        </button>
        <button onClick={switchCamera} disabled={isPredicting}>
          Rotate Camera
        </button>
      </div>
      {/* Webcam */}
      <div
        className="wrapper"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <canvas id="canvas" width={width} height={height} className="canvas" />
        <div className="webcam">
          <Webcam
            audio={false}
            id="img"
            ref={webcamRef}
            width={width}
            height={height}
            screenshotQuality={1}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMediaError={(err) => handleWebcamError(err, setError)}
          />
        </div>
      </div>
      {/* Predictions */}
      <div className="prediction-wrapper">
        {predictions?.map((prediction, index) => {
          const percentage = Math.round(prediction.score * 100);
          const text = `${prediction.class} - ${percentage}%`;
          return (
            <div key={index} className="prediction">
              {text}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
