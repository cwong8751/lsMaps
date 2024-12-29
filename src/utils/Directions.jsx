// function to get a list of directions using the geoapify routing api 
export function getDirection(startPt, endPt, driveMode, maxSpeed, avoidFerry, avoidFreeway) {
    return new Promise((resolve, reject) => {
        // Fetch data from the GeoApify API
        const requestOptions = {
            method: 'GET',
        };

        // Build API URL
        const baseUrl = "https://api.geoapify.com/v1/routing?waypoints=";
        const apiKey = "1f05d34fdcdc443a93731af1f6bb1c7f";

        // Construct query parameters
        let avoidParams = "";
        if (avoidFerry && avoidFreeway) {
            avoidParams = "&avoid=ferries|highways";
        } else if (avoidFerry) {
            avoidParams = "&avoid=ferries";
        } else if (avoidFreeway) {
            avoidParams = "&avoid=highways";
        }

        // Construct the full URL
        const url = `${baseUrl}${startPt}%7C${endPt}&mode=${driveMode}&max_speed=${maxSpeed}${avoidParams}&units=imperial&apiKey=${apiKey}`;

        // Fetch data from the API
        fetch(url, requestOptions)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorBody => {
                        if (
                            response.status === 400 &&
                            errorBody.message?.includes("Too long distance between locations")
                        ) {
                            // setting error message
                            alert("API result: Too long distance between locations");
                        }
                        // Throw an error with detailed information for further handling
                        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorBody.message}`);
                    });
                }
                return response.json();
            })
            .then(result => {
                // Ensure result has the expected structure
                if (!result.features || result.features.length === 0) {
                    throw new Error("No features found in the API response.");
                }

                const feature = result.features[0];
                const { properties, geometry } = feature;

                // Extract and organize data
                const modeOfTravel = properties.mode;
                const units = properties.units;
                const totalDistance = properties.distance;
                const totalTime = properties.time;

                const startPoint = properties.waypoints[0]?.location;
                const endPoint = properties.waypoints[1]?.location;

                const maxSpeed = properties.max_speed;

                const steps = properties.legs[0]?.steps.map(step => ({
                    fromIndex: step.from_index,
                    toIndex: step.to_index,
                    distance: step.distance,
                    time: step.time,
                    instruction: step.instruction?.text
                }));

                const fullPath = geometry.coordinates[0];

                // Debug output
                console.log("Mode of Travel:", modeOfTravel);
                console.log("Units:", units);
                console.log("Total Distance:", totalDistance, units);
                console.log("Total Time:", totalTime, "seconds");
                console.log("Starting Point:", startPoint);
                console.log("Ending Point:", endPoint);
                console.log("Steps:", steps);
                console.log("max speed:", maxSpeed);
                console.log("Full Path:", fullPath);

                resolve({ modeOfTravel, units, totalDistance, totalTime, startPoint, endPoint, steps, fullPath });
            })
            .catch(error => {
                console.error('Error fetching directions:', error);
                reject(error);
            });
    });
}


// function to translate human readable address to lat and long
export function getGeocode(address) {
    return new Promise((resolve, reject) => {
        const requestOptions = {
            method: 'GET',
        };

        const baseUrl = "https://api.geoapify.com/v1/geocode/search?text=";
        const apiKey = "1f05d34fdcdc443a93731af1f6bb1c7f";
        const url = baseUrl + encodeURIComponent(address) + "&apiKey=" + apiKey;

        fetch(url, requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result.features && result.features.length > 0) {
                    const feature = result.features[0];
                    const latitude = feature.properties.lat;
                    const longitude = feature.properties.lon;

                    console.log("Latitude:", latitude);
                    console.log("Longitude:", longitude);

                    resolve({ latitude, longitude });
                } else {
                    console.error("No features found in the API result.");
                    resolve(null); // Gracefully handle the case where no data is found
                }
            })
            .catch(error => {
                console.error('Error in getGeocode:', error);
                reject(error); // Propagate errors to the calling function
            });
    });
}
