/**
 * Potato AI Quality Grading API Service
 * Connects frontend to backend endpoint: POST /api/potato/analyze
 */

const API_BASE = "http://localhost:8000/api";

/**
 * Converts a File or Blob object into a base64 Data URL string.
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (typeof file === "string") {
      // Already a data URL or string
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(new Error("Failed to read image file: " + err));
    reader.readAsDataURL(file);
  });
}

/**
 * Validates selected image files before sending to API.
 */
export function validateImageFiles(files) {
  if (!files || files.length === 0) {
    return { valid: false, error: "Please select at least 1 potato image to analyze." };
  }

  if (files.length > 3) {
    return { valid: false, error: "Maximum 3 potato images are allowed. Please remove extra images." };
  }

  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type && !validTypes.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: `"${file.name}" has an unsupported format. Please upload JPG, JPEG, or PNG images.`
      };
    }

    if (file.size && file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `"${file.name}" exceeds 10MB size limit. Please upload a smaller image.`
      };
    }
  }

  return { valid: true, error: null };
}

/**
 * Calls backend POST /api/potato/analyze
 * Converts input image files to Base64 data strings as expected by PotatoAnalyzeRequest schema.
 *
 * @param {Object} options
 * @param {Array<File|string>} options.images - List of 1 to 3 File objects or base64 data URIs
 * @param {number} [options.quantityKg=2000] - Crop consignment quantity
 * @param {string} [options.batchNotes=""] - Farmer harvest notes
 * @returns {Promise<Object>} Backend PotatoAnalyzeResponse
 */
export async function analyzePotatoCrop({ images = [], quantityKg = 2000, batchNotes = "" }) {
  const validation = validateImageFiles(images);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Convert all files to base64 Data URLs expected by backend
  const encodedImages = await Promise.all(images.map((img) => fileToDataUrl(img)));

  const payload = {
    crop: "Potato",
    quantity_kg: Number(quantityKg) || 2000.0,
    images: encodedImages,
    batch_notes: batchNotes || "Farmer field quality check"
  };

  try {
    const response = await fetch(`${API_BASE}/potato/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorDetail = "Server error occurred during quality analysis.";
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          if (Array.isArray(errorJson.detail)) {
            errorDetail = errorJson.detail.map((d) => d.msg || d.detail).join("; ");
          } else {
            errorDetail = errorJson.detail;
          }
        }
      } catch {
        errorDetail = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorDetail);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Unable to connect to the AI service. Please verify the backend server is running at http://localhost:8000.");
    }
    throw err;
  }
}
