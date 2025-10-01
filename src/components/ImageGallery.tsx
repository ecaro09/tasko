import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ImageGallery: React.FC = () => {
  const images = [
    "https://via.placeholder.com/100",
    "https://via.placeholder.com/100",
    "https://via.placeholder.com/100",
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Image Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-2">
          {images.map((src, index) => (
            <img key={index} src={src} alt={`Sample ${index + 1}`} className="w-24 h-24 object-cover rounded-md shadow-sm" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageGallery;