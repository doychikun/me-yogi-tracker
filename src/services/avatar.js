// Profile pictures are stored as small JPEG data URLs in the Realtime
// Database. This keeps the app on Firebase's free Spark plan: new Firebase
// projects can't use Cloud Storage without the paid Blaze plan.

export const AVATAR_SIZE = 256;
export const AVATAR_QUALITY = 0.8;

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The selected file is not an image."));
    img.src = src;
  });

// Center-crops the image to a square and scales it to AVATAR_SIZE.
export const squareCrop = (width, height) => {
  const side = Math.min(width, height);
  return {
    sx: Math.round((width - side) / 2),
    sy: Math.round((height - side) / 2),
    side,
  };
};

export const fileToAvatarDataUrl = async (file) => {
  if (!file || !file.type || !file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  const img = await loadImage(await readAsDataUrl(file));
  const { sx, sy, side } = squareCrop(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  canvas
    .getContext("2d")
    .drawImage(img, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
  return canvas.toDataURL("image/jpeg", AVATAR_QUALITY);
};
