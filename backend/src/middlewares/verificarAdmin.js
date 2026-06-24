function verificarAdmin(req, res, next) {
  if (!req.usuario || req.usuario.tipo_usuario !== 'administrador') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores.' });
  }
  next();
}

module.exports = verificarAdmin;
