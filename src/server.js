import dotenv from 'dotenv';
import app from './app.js';
import galleryRouter from './routes/gallery.route.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(galleryRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
