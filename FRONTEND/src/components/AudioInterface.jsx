import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AudioInterface = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [recordResult, setRecordResult] = useState(null);
  const [error, setError] = useState(null);
  
  const visualizerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioChunks = useRef([]);
  
  const renderResponse = (response) => {
    if (!response) return null;
    
    return (
      <div className="space-y-4">
        {response.transcription && (
          <Card>
            <CardHeader>
              <CardTitle>Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{response.transcription}</p>
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
                className="prose max-w-none"
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
      
      canvasCtx.fillStyle = 'rgb(243, 244, 246)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(59, 130, 246)';
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

  const handleFileUpload = async (event) => {
    event.preventDefault();
    const fileInput = event.target.elements.file;
    if (!fileInput.files[0]) return;
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const result = await response.json();
      setUploadResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
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
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Audio Analysis Interface</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Audio File</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <input
              type="file"
              name="file"
              accept=".mp3,.wav"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </form>
          {uploadResult && renderResponse(uploadResult)}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Record Audio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <canvas 
            ref={visualizerRef} 
            className="w-full h-16 bg-gray-100 rounded-md"
          />
          
          <div className="space-x-4">
            <Button
              onClick={startRecording}
              disabled={isRecording}
              className={isRecording ? 'bg-red-600' : ''}
            >
              {isRecording ? 'Recording...' : 'Start Recording'}
            </Button>
            
            <Button
              onClick={stopRecording}
              disabled={!isRecording}
            >
              Stop Recording
            </Button>
          </div>
          
          {recordResult && renderResponse(recordResult)}
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AudioInterface;