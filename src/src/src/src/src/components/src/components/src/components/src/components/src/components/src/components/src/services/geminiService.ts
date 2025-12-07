import { GenerationConfig } from "../types";

const API_KEY = 'd92177724f7088bb23e4caa4b2982285'; // Kie.ai Key
const IMGBB_API_KEY = '4d72448894522d67def3f74993a95274'; // REPLACE THIS WITH YOUR IMGBB KEY
const BASE_URL = 'https://api.kie.ai/api/v1/jobs';

/**
 * Enhances a user prompt locally.
 */
export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  const qualityKeywords = ["8k", "highly detailed", "photorealistic", "cinematic lighting", "masterpiece"];
  const hasQualityKeywords = qualityKeywords.some(keyword => originalPrompt.toLowerCase().includes(keyword));
  
  if (!hasQualityKeywords) {
    return `${originalPrompt}, highly detailed, 8k resolution, cinematic lighting, professional photography, aesthetic masterpiece`;
  }
  
  return originalPrompt;
};

/**
 * Uploads a file to ImgBB and returns the direct display URL.
 */
const uploadToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  // ImgBB API Endpoint
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(`ImgBB Upload Failed: ${data.error?.message || 'Unknown error'}`);
  }

  return data.data.url;
};

/**
 * Polls the Kie.ai API for job completion.
 */
const pollJob = async (jobId: string): Promise<string> => {
  const maxAttempts = 60; 
  const interval = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${BASE_URL}/recordInfo?taskId=${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      const data = await response.json();
      const jobData = data.data || data;
      
      const statusRaw = jobData.status !== undefined ? jobData.status : jobData.state;
      const status = String(statusRaw).toUpperCase();

      if (['COMPLETED', 'SUCCEEDED', 'SUCCESS', '1'].includes(status)) {
        
        let resultJsonParsed = null;
        if (jobData.resultJson && typeof jobData.resultJson === 'string') {
          try {
            resultJsonParsed = JSON.parse(jobData.resultJson);
          } catch (e) {
            console.warn("Failed to parse resultJson field:", e);
          }
        }

        const possibleUrlCandidates = [
          resultJsonParsed?.resultUrls?.[0],
          resultJsonParsed?.imageUrl,
          resultJsonParsed?.image_url,
          jobData.output?.image_url,
          jobData.output?.imageUrl,
          jobData.output?.url,
          typeof jobData.output === 'string' ? jobData.output : null,
          jobData.result?.image_url,
          jobData.result?.imageUrl,
          jobData.result?.url,
          typeof jobData.result === 'string' ? jobData.result : null,
          jobData.imageUrl,
          jobData.image_url,
          jobData.url,
          jobData.data?.image_url,
          jobData.data?.output?.image_url,
          Array.isArray(jobData.images) && jobData.images[0]?.url ? jobData.images[0].url : null,
          Array.isArray(jobData.images) && typeof jobData.images[0] === 'string' ? jobData.images[0] : null,
          Array.isArray(jobData.output) && jobData.output[0]?.image_url ? jobData.output[0].image_url : null
        ];

        const imageUrl = possibleUrlCandidates.find(
          candidate => typeof candidate === 'string' && (candidate.startsWith('http://') || candidate.startsWith('https://'))
        );

        if (imageUrl) {
          return imageUrl;
        }
        
        console.error("Job reported success but extraction failed. Full Response:", JSON.stringify(data));
        throw new Error("Job completed but no valid image URL found in response.");
      }

      if (['FAILED', 'FAILURE', '-1'].includes(status)) {
        throw new Error(jobData.error || jobData.failReason || jobData.msg || "Image generation failed");
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      console.error("Polling error:", error);
      if (i === maxAttempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  throw new Error("Image generation timed out");
};

/**
 * Generates an image using Kie.ai Nano Banana Pro model.
 */
export const generateImage = async (config: GenerationConfig): Promise<string> => {
  const resolutionMap: Record<string, string> = {
    'basic': '1K',
    'standard': '1K',
    'hd': '2K'
  };
  const resolution = resolutionMap[config.quality] || '1K';

  try {
    // Step 1: Upload images to ImgBB if they exist
    let imageUrls: string[] = [];
    
    if (config.images && config.images.length > 0) {
      if (IMGBB_API_KEY === 'YOUR_IMGBB_API_KEY') {
        throw new Error("ImgBB API Key is missing. Please add your key in services/geminiService.ts");
      }
      
      // Upload all images in parallel
      imageUrls = await Promise.all(config.images.map(file => uploadToImgBB(file)));
      console.log("Images uploaded to ImgBB:", imageUrls);
    }

    // Step 2: Prepare Kie.ai Payload
    const requestBody = {
      model: 'nano-banana-pro',
      callBackUrl: 'https://placeholder.com/callback', 
      input: {
        prompt: config.prompt,
        aspect_ratio: config.aspectRatio,
        resolution: resolution,
        output_format: 'png',
        // Pass the array of public URLs
        ...(imageUrls.length > 0 ? { image_input: imageUrls } : {})
      }
    };

    // Step 3: Send to Kie.ai
    const response = await fetch(`${BASE_URL}/createTask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Request Failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Create Response:", data);

    if (data.code && data.code !== 0 && data.code !== 200) {
      throw new Error(data.msg || data.message || `API returned error code: ${data.code}`);
    }

    const jobId = data.data?.taskId || data.data?.task_id || data.data?.id || data.task_id || data.id || data.jobId;

    if (!jobId) {
      throw new Error(`Received invalid response from API: No Job ID found.`);
    }

    return await pollJob(jobId);

  } catch (error: any) {
    console.error("Image generation error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};
