export const getTransformedCloudinaryUrl = (originalUrl: string, fileSizeInBytes: number): string => {
  console.log(`[getTransformedCloudinaryUrl] Input - Original URL: "${originalUrl}", Size: ${fileSizeInBytes} bytes`);

  const smallFileTransformation = "f_auto"; // Automatically select format
  const largeFileTransformation = "w_1280,c_limit,q_auto,f_auto"; // Limit width, auto quality, auto format
  const tenMBInBytes = 10 * 1024 * 1024; // 10MB threshold

  // Determine the transformation string based on file size
  const transformationString = fileSizeInBytes < tenMBInBytes ? smallFileTransformation : largeFileTransformation;

  const uploadMarker = '/upload/';
  const parts = originalUrl.split(uploadMarker);

  if (parts.length === 2) {
    const baseUrl = parts[0]; // e.g., https://res.cloudinary.com/cloud_name/resource_type
    let pathAfterUpload = parts[1]; // This part contains potential old transformations, version, and public_id

    // Regex explanation:
    // ^                    - Start of the string (pathAfterUpload)
    // (?:                  - Start of a non-capturing group for old transformations
    //   (.*\/)             - Group 1: Captures any characters followed by a slash (greedy). This is the potential old transformation string.
    // )?                   - End of non-capturing group, makes the old transformation optional.
    // (v\d+\/.*)           - Group 2: Captures a version string (v followed by digits and a slash) and everything after it. This is the asset path starting with a version.
    // |                    - OR
    // (.*)                 - Group 3: Captures everything if the version string pattern is not met. This is the asset path if no version string.
    // $                    - End of the string
    const regex = /^(?:(.*?\/)(v\d+\/.*)|(.*))$/;
    const match = pathAfterUpload.match(regex);

    let publicPath = ''; // This will be the path part like "v123/folder/image.jpg" or "folder/image.jpg"

    if (match) {
      if (match[2]) { // Case 1: Version string found (e.g., "v12345/folder/image.jpg")
        publicPath = match[2]; // This is "v12345/folder/image.jpg"
        const oldTransformations = match[1] || ''; // This is "w_200,h_100/" or empty if no transform before version
        if (oldTransformations) {
          console.log(`[getTransformedCloudinaryUrl] Info: Stripped old transformations "${oldTransformations}" from path "${pathAfterUpload}" because a version string was found.`);
        }
      } else if (match[3]) { // Case 2: No version string found (e.g., "folder/image.jpg" or "old_transform/image.jpg")
        publicPath = match[3]; // This is the entire path after "/upload/"

        const pathSegments = publicPath.split('/');
        const finalSegment = pathSegments[pathSegments.length - 1];
        const leadingPath = pathSegments.slice(0, -1).join('/');

        if (pathSegments.length > 1 && /[a-z_]+,/.test(leadingPath) && !leadingPath.includes('.')) { // Heuristic: looks like a transformation
             console.warn(`[getTransformedCloudinaryUrl] Warning: No version string found in path "${pathAfterUpload}". The path "${leadingPath}" before the final segment "${finalSegment}" looks like it might contain transformations. Prepending new transformation "${transformationString}". This could lead to nested transformations like "${transformationString}/${publicPath}". Original URL: "${originalUrl}"`);
        } else if (pathSegments.length > 1) {
             console.log(`[getTransformedCloudinaryUrl] Info: No version string found in path "${pathAfterUpload}". Path contains folders. Applying transformation "${transformationString}" before full path "${publicPath}". Original URL: "${originalUrl}"`);
        } else {
             console.log(`[getTransformedCloudinaryUrl] Info: No version string found in path "${pathAfterUpload}". Path is a simple public_id. Applying transformation "${transformationString}" before public_id "${publicPath}". Original URL: "${originalUrl}"`);
        }
      } else {
        // This case should ideally not be reached if the regex is comprehensive.
        publicPath = pathAfterUpload;
        console.warn(`[getTransformedCloudinaryUrl] Warning: Could not reliably parse path "${pathAfterUpload}" using regex. Using full path. Original URL: "${originalUrl}"`);
      }
    } else {
      // Regex failed to match at all, which is highly unexpected.
      publicPath = pathAfterUpload;
      console.error(`[getTransformedCloudinaryUrl] CRITICAL: Regex failed to match path "${pathAfterUpload}". This indicates a flaw in the regex or an unexpected URL structure. Using full path. Original URL: "${originalUrl}"`);
    }

    const newUrl = `${baseUrl}${uploadMarker}${transformationString}/${publicPath}`;
    console.log(`[getTransformedCloudinaryUrl] Output - New URL: "${newUrl}"`);
    return newUrl;
  }

  console.warn(`[getTransformedCloudinaryUrl] Warning: Original URL "${originalUrl}" does not seem to be a valid Cloudinary URL (missing "${uploadMarker}" marker). Returning original URL.`);
  return originalUrl;
};
