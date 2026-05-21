'use client';

import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, X, Check, Image as ImageIcon } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string; // Base64 or object URL of the raw uploaded image
  onCropCompleted: (croppedDataUrl: string, croppedBlob: Blob) => void;
  isUploading?: boolean;
}

export default function ImageCropperModal({
  isOpen,
  onClose,
  imageSrc,
  onCropCompleted,
  isUploading = false,
}: ImageCropperModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);

  // Crop dimension inside the canvas
  const cropSize = 200;

  // Reset parameters when image source changes or modal opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImageEl(img);
        // Reset scale and offset
        setScale(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  // Redraw the canvas on scale, rotation, offset, or image load
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageEl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    
    // Move to center of canvas for rotation and drawing
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.translate(centerX + offset.x, centerY + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate dimensions to preserve aspect ratio
    const imgWidth = imageEl.width;
    const imgHeight = imageEl.height;
    const ratio = Math.min(width / imgWidth, height / imgHeight);
    const drawWidth = imgWidth * ratio * scale;
    const drawHeight = imgHeight * ratio * scale;

    // Draw the image centered at translation point
    ctx.drawImage(imageEl, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    // Draw circular masking overlay (soft dark background with circular cut-out)
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    
    // Create mask path
    ctx.beginPath();
    ctx.rect(0, 0, width, height); // Outer rectangle
    ctx.arc(centerX, centerY, cropSize / 2, 0, Math.PI * 2, true); // Inner circle (reverse direction to cut out)
    ctx.fill();

    // Draw thin elegant border for the circular crop guide
    ctx.beginPath();
    ctx.arc(centerX, centerY, cropSize / 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }, [imageEl, scale, rotation, offset]);

  // Handle Drag / Pan controls (Mouse & Touch)
  const handleStartDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleDrag = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleStopDrag = () => {
    setIsDragging(false);
  };

  // Perform crop calculation on click
  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageEl) return;

    // Create a temporary off-screen canvas to extract only the cropped circle area
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropSize;
    cropCanvas.height = cropSize;
    const cropCtx = cropCanvas.getContext('2d');

    if (!cropCtx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw circular clipping path on offscreen canvas
    cropCtx.beginPath();
    cropCtx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
    cropCtx.clip();

    // Draw the image exactly matching the position and transformations of the original canvas
    cropCtx.save();
    
    // Map the cropped coordinates from the main canvas relative center
    cropCtx.translate(cropSize / 2 + offset.x, cropSize / 2 + offset.y);
    cropCtx.rotate((rotation * Math.PI) / 180);

    const imgWidth = imageEl.width;
    const imgHeight = imageEl.height;
    const ratio = Math.min(width / imgWidth, height / imgHeight);
    const drawWidth = imgWidth * ratio * scale;
    const drawHeight = imgHeight * ratio * scale;

    cropCtx.drawImage(imageEl, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    cropCtx.restore();

    // Extract cropped image as Base64 and Blob
    const dataUrl = cropCanvas.toDataURL('image/png');
    
    cropCanvas.toBlob((blob) => {
      if (blob) {
        onCropCompleted(dataUrl, blob);
      }
    }, 'image/png');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-150">
          <h3 className="text-base font-extrabold text-gray-950 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#01017b]" />
            Recortar Foto de Perfil
          </h3>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="my-6 flex justify-center">
          <canvas
            ref={canvasRef}
            width={340}
            height={340}
            className="rounded-xl border border-gray-200 cursor-move bg-gray-50 max-w-full"
            onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
            onMouseMove={(e) => handleDrag(e.clientX, e.clientY)}
            onMouseUp={handleStopDrag}
            onMouseLeave={handleStopDrag}
            onTouchStart={(e) => {
              if (e.touches[0]) {
                handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) {
                handleDrag(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={handleStopDrag}
          />
        </div>

        {/* Info */}
        <p className="text-center text-xs text-gray-400 font-semibold mb-6">
          Arrastra para centrar e interactúa con los controles para ajustar tu imagen.
        </p>

        {/* Controls */}
        <div className="flex items-center justify-between bg-gray-50/80 p-3.5 rounded-xl mb-6 border border-gray-100 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
              className="p-2 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-600 transition-all active:scale-95"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-24 accent-[#01017b] h-1.5 rounded-lg appearance-none bg-gray-200 cursor-pointer"
            />
            <button
              onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
              className="p-2 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-600 transition-all active:scale-95"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="h-5 w-[1px] bg-gray-200"></div>

          <button
            onClick={() => setRotation(prev => (prev + 90) % 360)}
            className="p-2 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-600 flex items-center gap-1.5 transition-all active:scale-95 text-xs font-bold"
            title="Rotar 90°"
          >
            <RotateCw className="w-4 h-4" />
            Rotar
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-150">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 border border-gray-250 text-gray-700 text-xs font-extrabold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCrop}
            disabled={isUploading || !imageEl}
            className="px-4 py-2 bg-[#01017b] hover:bg-[#01017b]/90 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 shadow-md shadow-[#01017b]/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Subiendo...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Cortar y Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
