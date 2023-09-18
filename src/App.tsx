import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { useEffect, useState } from "react";
import { load_model } from "./model";

function App() {
  const [model, setModel] = useState<cocoSsd.ObjectDetection>();
  const [ready, setReady] = useState(false);
  const [previewImage, setPreviewImage] = useState<any>(null);
  const [predictions, setPredictions] = useState<
    cocoSsd.DetectedObject[] | null
  >([]);

  useEffect(() => {
    load_model().then((model) => {
      setModel(model);
      setReady(true);
    });
  }, []);

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
      })
      .catch((err) => {
        console.log(err);
      });
  }

  if (!ready) return <div>...loading</div>;

  return (
    <>
      <>
        <h1>Object Detection</h1>
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
}

export default App;
