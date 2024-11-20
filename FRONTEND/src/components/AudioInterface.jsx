import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Upload, Mic, StopCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AudioInterface = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [recordResult, setRecordResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const visualizerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunks = useRef([]);

  const challengeInfo = (
    <div className="mb-8 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">AssemblyAI Hackathon Project</h2>
      <p>
        This Speech Analyzer is a project created for the{" "}
        <a 
          href="https://dev.to/devteam/join-us-for-the-assemblyai-challenge-and-capture-the-nuance-of-human-speech-3000-in-prizes-4g4f?bb=189416" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          AssemblyAI Hackathon Challenge
        </a>
        . It aims to capture the nuances of human speech and provide valuable insights.
      </p>
    </div>
  );
  
  const renderResponse = (response) => {
    if (!response) return null;
    
    return (
      <div className="space-y-4 animate-slide-in">
        {response.transcription && (
          <Card>
            <CardHeader>
              <CardTitle>Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{response.transcription}</p>
            </CardContent>
          </Card>
        )}
        
        {response.lemur_resp && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ 
                  __html: response.lemur_resp.replace(/\n/g, '<br>')
                }} 
              />
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              {Object.entries(response).map(([key, value]) => {
                if (key !== 'transcription' && key !== 'lemur_resp') {
                  return (
                    <React.Fragment key={key}>
                      <dt className="font-semibold">{key}</dt>
                      <dd>{JSON.stringify(value)}</dd>
                    </React.Fragment>
                  );
                }
                return null;
              })}
            </dl>
          </CardContent>
        </Card>
      </div>
    );
  };

  const visualize = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 2048;
    source.connect(analyzer);
    
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const canvas = visualizerRef.current;
    const canvasCtx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const draw = () => {
      requestAnimationFrame(draw);
      analyzer.getByteTimeDomainData(dataArray);
      
      canvasCtx.fillStyle = 'rgba(200, 200, 200, 0.2)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 125, 255)';
      canvasCtx.beginPath();
      
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };
    
    draw();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      setIsUploading(false);
      setIsAnalyzing(true);
      const result = await response.json();
      setUploadResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const startRecording = async () => {
    try {
      audioChunks.current = [];
      audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(audioStreamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      visualize(audioStreamRef.current);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setError(null);
      
    } catch (err) {
      setError(err.message);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;
    
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsAnalyzing(true);
    
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    
    try {
      const response = await fetch('http://127.0.0.1:5000/record', {
        method: 'POST',
        body: audioBlob,
        headers: {
          'Content-Type': 'audio/webm',
          'Accept': 'application/json'
        }
      });
      
      const result = await response.json();
      setRecordResult(result);
      
    } catch (err) {
      setError(err.message);
    } finally {
      audioStreamRef.current?.getTracks().forEach(track => track.stop());
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold tracking-tight">Speech Analyzer Interface</h2>
      
      {challengeInfo}
      
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Audio</TabsTrigger>
          <TabsTrigger value="record">Record Audio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio File</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-colors duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">MP3 or WAV (MAX. 10MB)</p>
                    </div>
                    <input id="dropzone-file" type="file" name="file" accept=".mp3,.wav" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                {selectedFile && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Selected file: {selectedFile.name}
                  </p>
                )}
                <Button type="submit" disabled={isUploading || isAnalyzing || !selectedFile}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </form>
              {(isUploading || isAnalyzing) && (
                <div className="mt-4 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="mt-2">{isUploading ? 'Uploading...' : 'Analyzing your audio...'}</p>
                </div>
              )}
              {uploadResult && renderResponse(uploadResult)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="record">
          <Card>
            <CardHeader>
              <CardTitle>Record Audio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <canvas 
                ref={visualizerRef} 
                className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-md"
              />
              
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={startRecording}
                  disabled={isRecording || isAnalyzing}
                  className={isRecording ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {isRecording ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={stopRecording}
                  disabled={!isRecording || isAnalyzing}
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Recording
                </Button>
              </div>
              
              {isAnalyzing && (
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="mt-2">Analyzing your speech...</p>
                </div>
              )}
              
              {recordResult && renderResponse(recordResult)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {error && (
        <Alert variant="destructive" className="animate-slide-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AudioInterface;