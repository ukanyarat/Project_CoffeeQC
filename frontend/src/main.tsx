
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router';

import 'antd/dist/reset.css'; // ← มาก่อน
import './index.css';         // ← ตามด้วยไฟล์ที่มี @tailwind

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
