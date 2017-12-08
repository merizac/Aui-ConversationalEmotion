
// On document load resolve the SDK dependency
function Initialize(onComplete) {
  require(["Speech.Browser.Sdk"], function(SDK) {
    onComplete(SDK);
  });
}

// Setup the recognizer
function RecognizerSetup(SDK, recognitionMode, language, format, subscriptionKey) {

  switch (recognitionMode) {
    case "Interactive" :
    recognitionMode = SDK.RecognitionMode.Interactive;
    break;
    case "Conversation" :
    recognitionMode = SDK.RecognitionMode.Conversation;
    break;
    case "Dictation" :
    recognitionMode = SDK.RecognitionMode.Dictation;
    break;
    default:
    recognitionMode = SDK.RecognitionMode.Interactive;
  }

  var recognizerConfig = new SDK.RecognizerConfig(
    new SDK.SpeechConfig(
      new SDK.Context(
        new SDK.OS(navigator.userAgent, "Browser", null),
        new SDK.Device("SpeechSample", "SpeechSample", "1.0.00000"))),
        recognitionMode,
        language, // Supported languages are specific to each recognition mode. Refer to docs.
        format); // SDK.SpeechResultFormat.Simple (Options - Simple/Detailed)


        var useTokenAuth = false;

        var authentication = function() {
          if (!useTokenAuth)
          return new SDK.CognitiveSubscriptionKeyAuthentication(subscriptionKey);

          var callback = function() {
            var tokenDeferral = new SDK.Deferred();
            try {
              var xhr = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
              xhr.open('GET', '/token', 1);
              xhr.onload = function () {
                if (xhr.status === 200)  {
                  tokenDeferral.Resolve(xhr.responseText);
                } else {
                  tokenDeferral.Reject('Issue token request failed.');
                }
              };
              xhr.send();
            } catch (e) {
              window.console && console.log(e);
              tokenDeferral.Reject(e.message);
            }
            return tokenDeferral.Promise();
          }

          return new SDK.CognitiveTokenAuthentication(callback, callback);
        }();
      return SDK.CreateRecognizer(recognizerConfig, authentication);

      }

// Start the recognition
function RecognizerStart(SDK, recognizer) {
    recognizer.Recognize(function (event) {
        /*
        Alternative syntax for typescript devs.
        if (event instanceof SDK.RecognitionTriggeredEvent)
        */
        switch (event.Name) {
            case "RecognitionTriggeredEvent" :
                //UpdateStatus("Initializing");
                break;
            case "ListeningStartedEvent" :
                //UpdateStatus("Listening");
                break;
            case "RecognitionStartedEvent" :
                //UpdateStatus("Listening_Recognizing");
                break;
            // case "SpeechStartDetectedEvent" :
            // UpdateStatus("Listening_DetectedSpeech_Recognizing");
            // console.log(JSON.stringify(event.Result)); // check console for other information in result
            // break;
            case "SpeechHypothesisEvent" :
                UpdateRecognizedHypothesis(event.Result.Text, false);
                console.log(JSON.stringify(event.Result)); // check console for other information in result
                break;
            // case "SpeechFragmentEvent" :
            // UpdateRecognizedHypothesis(event.Result.Text, true);
            // console.log(JSON.stringify(event.Result)); // check console for other information in result
            // break;
            case "SpeechEndDetectedEvent" :
                OnSpeechEndDetected();
                //UpdateStatus("Processing_Adding_Final_Touches");
                console.log(JSON.stringify(event.Result)); // check console for other information in result
                break;
            case "SpeechSimplePhraseEvent" :
                UpdateRecognizedPhrase(JSON.stringify(event.Result, null, 3));
                break;
            case "SpeechDetailedPhraseEvent" :
                UpdateRecognizedPhrase(JSON.stringify(event.Result, null, 3));
                break;
            case "RecognitionEndedEvent" :
                OnComplete();
                //UpdateStatus("Idle");
                console.log(JSON.stringify(event)); // Debug information
                break;
            default:
                console.log(JSON.stringify(event)); // Debug information
        }
    })
        .On(function() {
                // The request succeeded. Nothing to do here.
            },
            function (error){
                console.error(error);
            });
}

      // Stop the Recognition.
      function RecognizerStop(SDK, recognizer) {
        // recognizer.AudioSource.Detach(audioNodeId) can be also used here. (audioNodeId is part of ListeningStartedEvent)
        recognizer.AudioSource.TurnOff();
      }

      var startBtn, stopBtn, hypothesisDiv,
          phraseDiv, videoBtn, createBtn, analyzeBtn,
          myChart;
      var key;
      var SDK;
      var recognizer;

      document.addEventListener("DOMContentLoaded", function () {
        createBtn = document.getElementById("createBtn");
        startBtn = document.getElementById("startBtn");
        stopBtn = document.getElementById("stopBtn");
        analyzeBtn = document.getElementById("analyzeBtn");
        phraseDiv = document.getElementById("phraseDiv");
        hypothesisDiv = document.getElementById("hypothesisDiv");
        videoBtn = document.getElementById("goToVideosBtn");


        $.get('/key?service=STT', function(response){
          key=response;
        });


        startBtn.addEventListener("click", function () {
            if (!recognizer) {
              Setup();
            }

            hypothesisDiv.innerHTML = "";
            phraseDiv.innerHTML = "";
            RecognizerStart(SDK, recognizer);
            startBtn.disabled = true;
            stopBtn.disabled = false;
        });

        analyzeBtn.addEventListener("click", function(){
          startBtn.disabled = true;
          analyzeBtn.disabled = true;

          document.getElementById('prosegui').style.display = "block";

          var text = phraseDiv.value;
          var url = '/tone-analyzer?text='+text;

          var ctx = document.getElementById("myChart");

          $.get(url, function(responseText) {

              var tones = responseText.document_tone.tone_categories[0].tones;

              myChart = new Chart(ctx, {
                  type: 'doughnut',
                  data: {

                      labels: [tones[0].tone_id,
                          tones[1].tone_id,
                          tones[2].tone_id,
                          tones[3].tone_id,
                          tones[4].tone_id],

                      datasets: [{
                          data: [tones[0].score,
                                 tones[1].score,
                                 tones[2].score,
                                 tones[3].score,
                                 tones[4].score],

                          backgroundColor: [
                              'rgba(242, 22, 22, 1)',
                              'rgba(28, 178, 20, 1)',
                              'rgba(147, 75, 235, 1)',
                              'rgba(255, 251, 71, 1)',
                              'rgba(39, 57, 194, 1)'
                          ]
                      }],

                  },

                  options: {
                      responsive: true
                  }
              });
          });

        });

        videoBtn.addEventListener("click", function(){
            var emotions =myChart.data.labels;
            var data = myChart.data.datasets[0].data;
            var largest = Math.max.apply(Math, data);
            var arr = Array.prototype.slice.call(data);
            var emotion = emotions[arr.indexOf(largest)];
            var sel = document.getElementById("numberVideos");
            var numVideo= sel.options[sel.selectedIndex].text;

            location.href="/session2?emotion="+ emotion +"&num_video=" + numVideo;

        })

        stopBtn.addEventListener("click", function () {
          RecognizerStop(SDK, recognizer);
          startBtn.disabled = false;
          stopBtn.disabled = true;
        });

        Initialize(function (speechSdk) {
          SDK = speechSdk;
          startBtn.disabled = false;
        });
      });

      function Setup() {
        if (recognizer != null) {
          RecognizerStop(SDK, recognizer);
        }
        console.log("key: "+ key);
        recognizer = RecognizerSetup(SDK, "Interactive", "it-IT", SDK.SpeechResultFormat["Simple"], key);
      }

      /*function UpdateStatus(status) {
        statusDiv.innerHTML = status;
      }*/

      function UpdateRecognizedHypothesis(text, append) {
        if (append)
        hypothesisDiv.innerHTML += text + " ";
        else
        hypothesisDiv.innerHTML = text;

        var length = hypothesisDiv.innerHTML.length;
        if (length > 403) {
          hypothesisDiv.innerHTML = "..." + hypothesisDiv.innerHTML.substr(length-400, length);
        }
      }

      function OnSpeechEndDetected() {
        stopBtn.disabled = true;
      }

      function UpdateRecognizedPhrase(json) {
        hypothesisDiv.innerHTML = "";
        var json = JSON.parse(json);
        if(json.RecognitionStatus== "Success"){
          phraseDiv.innerHTML += json.DisplayText + "\n";
        }
        else {
          allert("Error...");
          OnComplete();
        }
        analyzeBtn.disabled = false;
      }

      function OnComplete() {
        startBtn.disabled = false;
        stopBtn.disabled = true;
      }
