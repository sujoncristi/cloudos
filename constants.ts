
import { FileItem } from './types';

export const initialFiles: FileItem[] = [
  {
    id: 'demo-1',
    userId: 'guest',
    // Added missing required properties for FileItem interface
    parentId: null,
    isFolder: false,
    name: 'Sample Nature.jpg',
    size: 250000,
    type: 'image',
    dataUrl: 'https://picsum.photos/id/10/800/600',
    createdAt: Date.now() - 86400000,
    tags: [],
    versions: [],
    isShared: false,
    isDeleted: false
  },
  {
    id: 'demo-2',
    userId: 'guest',
    // Added missing required properties for FileItem interface
    parentId: null,
    isFolder: false,
    name: 'Intro_Video.mp4',
    size: 1500000,
    type: 'video',
    dataUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    createdAt: Date.now() - 43200000,
    tags: [],
    versions: [],
    isShared: false,
    isDeleted: false
  }
];
