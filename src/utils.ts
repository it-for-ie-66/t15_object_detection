import * as cocoSsd from "@tensorflow-models/coco-ssd";

declare global {
  interface Window {
    mobileCheck: () => boolean;
  }
}

export function vdo_params() {
  // Add mobile check to window
  window.mobileCheck = function () {
    let check = false;
    (function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(navigator.userAgent);
    return check;
  };

  const isMobile = window.mobileCheck();

  // Figure out video size
  const vdoInit = {
    maxHeight: 800,
    maxWidth: 800,
    heightFactor: 0.75,
    widthFactor: 0.75,
  };
  const width = Math.min(
    Math.round(window.innerWidth * vdoInit.widthFactor),
    vdoInit.maxWidth
  );
  const height = Math.min(
    Math.round(window.innerHeight * vdoInit.heightFactor),
    vdoInit.maxHeight
  );

  return { width, height, isMobile };
}

export function getVideoConstraints(
  width: number,
  height: number,
  isMobile: boolean,
  switched: boolean
) {
  // Determine if we should switch the width and height in the video constraints or not.
  // In mobile, the default video contraints will always be landscape, so we need to switch it.
  // However, if mobile is in landscape, the video will be in portraits.
  const useSwitchedContrained = true;

  let videoConstraints = {
    height: height,
    width: width,
    facingMode: "environment",
  };

  if (useSwitchedContrained) {
    videoConstraints = {
      height: !isMobile ? height : width,
      width: !isMobile ? width : height,
      facingMode: "environment",
    };
  }

  if (switched) {
    const tempHeight = videoConstraints.height;
    const tempWidth = videoConstraints.width;
    videoConstraints.height = tempWidth;
    videoConstraints.width = tempHeight;
  }

  return videoConstraints;
}

export function handleWebcamError(
  err: string | DOMException,
  setError: (err: string) => void
) {
  if (typeof err === "string" || err instanceof String) {
    setError(String(err));
  } else {
    const text = err?.message || "Unknown Error";
    setError(`Error Loading Webcam: ${text}`);
  }
}

export function displayPredictions(
  predictions: cocoSsd.DetectedObject[],
  width: number,
  height: number
) {
  // Validation
  var canvas = (document.getElementById("canvas") as HTMLCanvasElement) || null;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  if (!ctx) return;

  // Start painting
  ctx.clearRect(0, 0, width, height);
  if (predictions.length > 0) {
    console.log(predictions);
    predictions.forEach((prediction) => {
      if (prediction.score > 0) {
        drawBox(prediction, ctx);
      }
    });
  }
}

function drawBox(
  prediction: cocoSsd.DetectedObject,
  ctx: CanvasRenderingContext2D
) {
  let bboxLeft = prediction.bbox[0];
  let bboxTop = prediction.bbox[1];
  let bboxWidth = prediction.bbox[2];
  let bboxHeight = prediction.bbox[3]; // - bboxTop;

  ctx.beginPath();
  ctx.font = "28px Arial";
  ctx.fillStyle = "red";

  ctx.fillText(
    prediction.class + ": " + Math.round(prediction.score * 100) + "%",
    bboxLeft + 5,
    bboxTop + 30
  );

  ctx.rect(bboxLeft, bboxTop, bboxWidth, bboxHeight);
  ctx.strokeStyle = "#FF0000";
  ctx.fillStyle = "rgba(140, 41, 162, 0.2)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fill();
}

export async function getPrediction(
  model: cocoSsd.ObjectDetection | undefined,
  webcamRef: any
) {
  // Validation
  const img = (document.getElementById("img") as HTMLCanvasElement) || null;
  if (!model || !webcamRef.current || !img) return null;

  // Prediction
  try {
    const predictions = await model.detect(img);
    return predictions;
  } catch (error) {
    console.log(error);
    return null;
  }
}
