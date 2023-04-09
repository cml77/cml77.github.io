/*jshint esversion:6*/
$(function() {
    const video = $("video")[0];

    var model;
    var cameraMode = "environment"; // or "user"

    const startVideoStreamPromise = navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: {
                facingMode: cameraMode
            }
        })
        .then(function(stream) {
            return new Promise(function(resolve) {
                video.srcObject = stream;
                video.onloadeddata = function() {
                    video.play();
                    resolve();
                };
            });
        });

    var publishable_key = "rf_5w20VzQObTXjJhTjq6kad9ubrm33";
    var toLoad = {
        model: "lazycube-faces",
        version: 1
    };

    var clipboardText = '-';
//    setInterval(function() {
      /*navigator.clipboard.readText()
        .then(text => {
            clipboardText = text;
            alert(text);
            //ctx.lineWidth = color_hash.includes(text) ? 32: 4;
            //console.log("Text from clipboard:", text);
        })
        .catch(err => {
            alert("Failed to read text from clipboard:" + err);
        });*/
//    }, 3000);

    /*setInterval(function() {
      var clipboardData = window.clipboardData || undefined;
      if (clipboardData && clipboardData.getData) {
        clipboardText = clipboardData.getData('Text');
        alert(clipboardText);
      }
    }, 3000);*/

    document.addEventListener('paste', function(event) {
        // Handle the paste event
        var clipboardData = event.clipboardData || window.clipboardData;
        clipboardText = clipboardData.getData('text');
        console.log(clipboardText);
        //alert(clipboardText);
    });


    const loadModelPromise = new Promise(function(resolve, reject) {
        roboflow
            .auth({
                publishable_key: publishable_key
            })
            .load(toLoad)
            .then(function(m) {
                model = m;
                model.configure({
                    threshold: 0.75,
                    overlap: 0.05,
                    max_objects: 20
                });
                resolve();
            });
    });

    Promise.all([startVideoStreamPromise, loadModelPromise]).then(function() {
        $("body").removeClass("loading");
        resizeCanvas();
        detectFrame();
    });

    var canvas, ctx;
    const font = "16px sans-serif";

    function videoDimensions(video) {
        // Ratio of the video's intrisic dimensions
        var videoRatio = video.videoWidth / video.videoHeight;

        // The width and height of the video element
        var width = video.offsetWidth,
            height = video.offsetHeight;

        // The ratio of the element's width to its height
        var elementRatio = width / height;

        // If the video element is short and wide
        if (elementRatio > videoRatio) {
            width = height * videoRatio;
        } else {
            // It must be tall and thin, or exactly equal to the original ratio
            height = width / videoRatio;
        }

        return {
            width: width,
            height: height
        };
    }

    $(window).resize(function() {
        resizeCanvas();
    });

    const resizeCanvas = function() {
        $("canvas").remove();

        canvas = $("<canvas/>");

        ctx = canvas[0].getContext("2d");

        var dimensions = videoDimensions(video);

        console.log(
            video.videoWidth,
            video.videoHeight,
            video.offsetWidth,
            video.offsetHeight,
            dimensions
        );

        canvas[0].width = video.videoWidth;
        canvas[0].height = video.videoHeight;

        canvas.css({
            width: dimensions.width,
            height: dimensions.height,
            left: ($(window).width() - dimensions.width) / 2,
            top: ($(window).height() - dimensions.height) / 2
        });

        $("body").append(canvas);
    };

    var color_hash = '';
    var yes = '';

    function get_color_hash(predictions) {
        color_hash = '';
        for (let i = 0; i < predictions.length; i++) {
            if (predictions[i]['class'] !== 'Face') {
                color_hash += predictions[i]['class'][0];
            }
        }
        return color_hash;
    }

    function remove_faces(predictions) {
        // Use filter method to create a new array of predictions without any items with class 'Face'
        const predictions_without_face = predictions.filter(pred => pred['class'] !== 'Face');

        // Create a new object with the updated list of predictions
        //      return {'predictions': predictions_without_face};
        return predictions_without_face;
    }

    const sort_normalize_y = function(predictions) {
        //function sort_normalize_y(predictions) {
        // Define the range within which y coordinates will be considered the same
        const y_range = 10;

        // Sort the predictions by y coordinate, then by x coordinate
        const sorted_predictions = predictions.sort((a, b) => {
            if (a.bbox.y === b.bbox.y) {
                return a.bbox.x - b.bbox.x;
            } else {
                return a.bbox.y - b.bbox.y;
            }
        });

        // Set the initial y coordinate to the y coordinate of the first prediction
        //      let previous_y = sorted_predictions[0]['y'];
        let previous_y = sorted_predictions[0].y;

        // Iterate over the sorted predictions and change the y coordinate if it is within the given range
        for (let i = 0; i < sorted_predictions.length; i++) {
            const pred = sorted_predictions[i];
            if (Math.abs(pred.bbox.y - previous_y) <= y_range) {
                pred.bbox.y = previous_y;
            } else {
                previous_y = pred.bbox.y;
            }
        }

        // console.log(sorted_predictions);
        return sorted_predictions;
    };


    function isSquare(prediction) {
        const ratio = prediction.bbox.width / prediction.bbox.height;
        return Math.abs(ratio - 1) < 0.2; // assuming a square ratio of 1:1
    }

    function isHashMatch(color_hash) {
        return clipboardText != null && clipboardText.trim() !== ''
                && color_hash.includes(clipboardText);
    }

    /////////////////inference////////////////////////////////
    const renderPredictions = function(predictions) {
        //console.log(predictions);
        if(clipboardText != null && clipboardText.trim() !== ''
                && color_hash.includes(clipboardText)) return;

        //isHashMatch(color_hash) return;

        predictions = remove_faces(predictions);
//        predictions = predictions.filter(isSquare);
        predictions = sort_normalize_y(predictions);
        /*predictions = predictions.sort((a, b) => {
            if (a.bbox.y === b.bbox.y) {
              return a.bbox.x - b.bbox.x;
            } else {
              return a.bbox.y - b.bbox.y;
            }
            });*/

        /*var text='';
        predictions.forEach(function(prediction) {
          text+=('['+prediction.bbox.x +','+prediction.bbox.y+','+prediction.class+'],');
        });
        //alert(text);*/

        /*predictions = predictions.sort((a, b) => {
          if (a['y'] === b['y']) {
            return a['x'] - b['x'];
          } else {
            return a['y'] - b['y'];
          }
        });*/

        //alert(_predictions[0]);

        color_hash = get_color_hash(predictions);

        var dimensions = videoDimensions(video);

        var scale = 1;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        let i = -1;
        predictions.forEach(function(prediction) {
            const x = prediction.bbox.x;
            const y = prediction.bbox.y;

            const width = prediction.bbox.width;
            const height = prediction.bbox.height;

            // Draw the bounding box.
            //            ctx.strokeStyle = prediction.color;
            ctx.strokeStyle = prediction.class;
            //            ctx.lineWidth = color_hash.includes('OYGGWBBOR') ? 32: 4;

            ctx.lineWidth = (clipboardText != null && clipboardText.trim() !== ''
                && color_hash.includes(clipboardText)) ? 32 : 4;
//            ctx.lineWidth = isHashMatch(color_hash) ? 32 : 4;

            ctx.strokeRect(
                (x - width / 2) / scale,
                (y - height / 2) / scale,
                width / scale,
                height / scale
            );

            // Draw the label background.
            //            ctx.fillStyle = prediction.color;
            ctx.fillStyle = prediction.class;
            const textWidth = ctx.measureText(prediction.class).width;
            const textHeight = parseInt(font, 10); // base 10
            ctx.fillRect(
                (x - width / 2) / scale,
                (y - height / 2) / scale,
                textWidth + 8,
                textHeight + 4
            );
        });

        predictions.forEach(function(prediction) {
            i += 1;
            const x = prediction.bbox.x;
            const y = prediction.bbox.y;

            const width = prediction.bbox.width;
            const height = prediction.bbox.height;

            // Draw the text last to ensure it's on top.
            ctx.font = font;
            ctx.textBaseline = "top";
            ctx.fillStyle = "#000000";
            ctx.fillText(i + ':' +
                prediction.class,
                (x - width / 2) / scale + 4,
                (y - height / 2) / scale + 1
            );
        });
    };

    var prevTime;
    var pastFrameTimes = [];
    const detectFrame = function() {
        if (!model) return requestAnimationFrame(detectFrame);

        model
            .detect(video)
            .then(function(predictions) {
                requestAnimationFrame(detectFrame);
                renderPredictions(predictions);

                if (prevTime) {
                    pastFrameTimes.push(Date.now() - prevTime);
                    if (pastFrameTimes.length > 30) pastFrameTimes.shift();

                    var total = 0;
                    _.each(pastFrameTimes, function(t) {
                        total += t / 1000;
                    });

                    var fps = pastFrameTimes.length / total;
//                    $("#fps").text(Math.round(clipboardText));
                    $("#fps").text(clipboardText);
//                    $("#fps").text(color_hash.includes('OYGGWBBOR') ? "YESSSSSSSSSSSSSSSSSSSS!!": color_hash);

//                    if (color_hash.includes('OYGGWBBOR')) yes = 'yes';
//                    $("#fps").text(yes);

                }
                prevTime = Date.now();
            })
            .catch(function(e) {
                console.log("CAUGHT", e);
                requestAnimationFrame(detectFrame);
            });
    };
});