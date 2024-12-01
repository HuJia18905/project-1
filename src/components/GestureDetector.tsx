import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { X } from 'lucide-react';
import { Client } from "@gradio/client";
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { useProducts } from '../hooks/useProducts';
import ProductGrid from './ProductGrid';
import { Product } from '../lib/types';

interface GestureDetectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GestureDetector({ isOpen, onClose }: GestureDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { products } = useProducts();
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
  const [lastGesture, setLastGesture] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomedProduct, setZoomedProduct] = useState<Product | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [processedImage, setProcessedImage] = useState<string>('');
  const lastGestureTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const selectedIndexRef = useRef<number>(selectedIndex);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    const initializeGestureRecognizer = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
      );

      const recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO"
      });

      setGestureRecognizer(recognizer);
    };

    initializeGestureRecognizer();

    return () => {
      if (gestureRecognizer) {
        gestureRecognizer.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        toast.error('Failed to access camera');
      }
    };

    startCamera();
    setSelectedIndex(0);

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setSelectedIndex(-1);
      setIsZoomed(false);
      setZoomedProduct(null);
      setProcessedImage(null);
    };
  }, [isOpen]);

  const captureVideoFrame = async (): Promise<Blob | null> => {
    if (!videoRef.current) return null;

    try {
      // Create canvas if it doesn't exist
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvasRef.current = canvas;
      }

      const context = canvasRef.current.getContext('2d');
      if (!context) return null;

      // Draw the current video frame
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      // Convert to blob
      return new Promise((resolve) => {
        canvasRef.current?.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } catch (error) {
      console.error('Error capturing video frame:', error);
      return null;
    }
  };

  const fetchProductImage = async (url: string): Promise<Blob | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch product image');
      return await response.blob();
    } catch (error) {
      console.error('Error fetching product image:', error);
      return null;
    }
  };

  const handleVirtualTryOn = async (product: Product) => {
    if (product.category !== 'Clothing') {
      toast.error('Virtual try-on is only available for clothing items');
      return;
    }

    try {
      setIsProcessingImage(true);
      
      // Capture video frame
      toast.loading('Capturing current frame...', { id: 'capture' });
      const personImage = await captureVideoFrame();
      //const response_0 = await fetch("https://levihsu-ootdiffusion.hf.space/file=/tmp/gradio/2e0cca23e744c036b3905c4b6167371632942e1c/model_1.png");
      //const personImage = await response_0.blob();
      if (!personImage) throw new Error('Failed to capture video frame');
      toast.success('Frame captured successfully', { id: 'capture' });

      // Fetch product image
      toast.loading('Fetching product image...', { id: 'fetch' });
      const productImage = await fetchProductImage(product.image_url);
      //const response_1 = await fetch("https://levihsu-ootdiffusion.hf.space/file=/tmp/gradio/180d4e2a1139071a8685a5edee7ab24bcf1639f5/03244_00.jpg");
      //const productImage = await response_1.blob();
      if (!productImage) throw new Error('Failed to fetch product image');
      toast.success('Product image fetched successfully', { id: 'fetch' });

      // Connect to API
      toast.loading('Connecting to virtual try-on service...', { id: 'connect' });
      const client = await Client.connect("levihsu/OOTDiffusion");
      toast.success('Connected to service', { id: 'connect' });

      // Process images
      console.log("Starting Processing Images.")
      const result = await client.predict("/process_hd", {
          vton_img: personImage,
          garm_img: productImage,
          n_samples: 1,
          n_steps: 20,
          image_scale: 1,
          seed: -1,
      });

      // Add detailed logging
      console.log("Full result data:", JSON.stringify(result.data, null, 2));

      // Fix the URL extraction - note the additional array level
      const imageUrl = result.data[0]?.[0]?.image?.url;
      if (!imageUrl) throw new Error('No image URL in response');

      setProcessedImage(imageUrl);
      toast.success('Virtual try-on completed!', { id: 'process' });
    } catch (error) {
      console.error('Virtual try-on failed:', error);
      toast.error('Virtual try-on failed.', { id: 'process' });
    }finally {
      setIsProcessingImage(false);
    }
  };

  const detectGesture = async () => {
    if (!videoRef.current || !gestureRecognizer || !videoRef.current.videoWidth) {
      animationFrameRef.current = requestAnimationFrame(detectGesture);
      return;
    }

    const nowInMs = Date.now();
    const results = gestureRecognizer.recognizeForVideo(videoRef.current, nowInMs);

    if (results.gestures.length > 0) {
      const gesture = results.gestures[0][0].categoryName;

      if (gesture !== lastGesture && nowInMs - lastGestureTimeRef.current > 1000) {
        setLastGesture(gesture);
        lastGestureTimeRef.current = nowInMs;

        switch (gesture) {
          case 'Thumb_Up':
            setSelectedIndex((prev) => Math.min(prev + 1, products.length - 1));
            break;

          case 'Thumb_Down':
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
            break;

          case 'Open_Palm':
            const currentIndex = selectedIndexRef.current;
            if (products[currentIndex]) {
              setZoomedProduct(products[currentIndex]);
              setIsZoomed(true);
            }
            break;

          case 'Closed_Fist':
            setIsZoomed(false);
            setZoomedProduct(null);
            setProcessedImage(null);
            break;

          case 'Victory':
            const selectedProduct = products[selectedIndexRef.current];
            if (selectedProduct?.category === 'Clothing') {
              handleVirtualTryOn(selectedProduct);
            } else {
              toast.error('Virtual try-on is only available for clothing items');
            }
            break;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectGesture);
  };

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.onloadeddata = () => {
        detectGesture();
      };
    }
  }, [isOpen, gestureRecognizer]);

  if (!isOpen) return null;

  return (
    <div className="relative">
      <div className="fixed bottom-4 left-4 z-50">
        <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-64 h-48 object-cover"
          />
          {lastGesture && (
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {lastGesture.replace('_', ' ')}
            </div>
          )}
        </div>
      </div>

      {isZoomed && zoomedProduct && (
        <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center">
          <div className="relative max-w-2xl w-full mx-4">
            <button
              onClick={() => {
                setIsZoomed(false);
                setZoomedProduct(null);
                setProcessedImage(null);
              }}
              className="absolute top-4 right-4 text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="bg-white rounded-lg p-4">
              {isProcessingImage ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4" />
                  <p className="text-gray-600">Processing virtual try-on...</p>
                </div>
              ) : processedImage ? (
                <img
                  src={processedImage}
                  alt="Virtual Try-on Result"
                  className="w-full h-96 object-contain"
                />
              ) : (
                <img
                  src={zoomedProduct.image_url}
                  alt={zoomedProduct.name}
                  className="w-full h-96 object-contain"
                />
              )}
              <div className="mt-4">
                <h3 className="text-xl font-bold">{zoomedProduct.name}</h3>
                <p className="text-gray-600">${zoomedProduct.price}</p>
                {zoomedProduct.category === 'Clothing' && (
                  <p className="text-sm text-gray-500 mt-2">
                    Make a Victory gesture to try this item on virtually!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-16">
        <ProductGrid selectedIndex={selectedIndex} />
      </div>
    </div>
  );
}