const path = require('path');
const fs = require('fs');
const multer = require('multer');

const diretorioUploads = path.join(__dirname, '../../uploads');

if (!fs.existsSync(diretorioUploads)) {
  fs.mkdirSync(diretorioUploads, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, diretorioUploads),
  filename: (_req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const nomeUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;
    cb(null, nomeUnico);
  },
});

const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (tiposPermitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagem não suportado. Use JPEG, PNG, WEBP ou GIF.'));
    }
  },
});

module.exports = upload;
