import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";

export async function load_model() {
  try {
    await tf.ready();
    const model = await cocoSsd.load();
    return model;
  } catch (error) {
    console.log(error);
  }
}
