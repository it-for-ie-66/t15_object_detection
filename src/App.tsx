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

const { width, height, isMobile } = vdo_params();

function App() {
  const [model, setModel] = useState<cocoSsd.ObjectDetection>();

  const [ready, setReady] = useState(false);

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

  if (!ready) return <div>...loading</div>;
  if (error) return <div>{error}</div>;

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
