import { squareCrop, fileToAvatarDataUrl } from "./avatar";

describe("squareCrop", () => {
  it("centers a landscape image", () => {
    expect(squareCrop(400, 200)).toEqual({ sx: 100, sy: 0, side: 200 });
  });
  it("centers a portrait image", () => {
    expect(squareCrop(300, 500)).toEqual({ sx: 0, sy: 100, side: 300 });
  });
  it("keeps a square image whole", () => {
    expect(squareCrop(256, 256)).toEqual({ sx: 0, sy: 0, side: 256 });
  });
});

describe("fileToAvatarDataUrl", () => {
  it("rejects non-image files", async () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    await expect(fileToAvatarDataUrl(file)).rejects.toThrow("image");
  });
  it("rejects a missing file", async () => {
    await expect(fileToAvatarDataUrl(undefined)).rejects.toThrow("image");
  });
});
