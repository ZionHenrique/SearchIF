const Usuario = require('../models/Usuario');
const Categoria = require('../models/Categoria');
const Item = require('../models/Item');
const Postagem = require('../models/Postagem');
const Tag = require('../models/Tag');
const {
  TIPOS_USUARIO,
  TIPOS_FORUM,
  STATUS_ITEM,
  validarSenha,
  validarEmail,
  validarIdNumerico,
  validarData,
  validarPeriodoPerda,
  criarErroHttp,
} = require('./validacoes');

async function validarCadastroUsuario(dados) {
  const { nome, email, senha, tipo_usuario, matricula, turma } = dados;

  if (!nome?.trim() || !email?.trim() || !senha || !tipo_usuario || !matricula?.trim()) {
    throw criarErroHttp(
      400,
      'Campos obrigatórios: nome, email, senha, tipo_usuario e matricula.'
    );
  }

  if (!TIPOS_USUARIO.includes(tipo_usuario)) {
    throw criarErroHttp(
      400,
      `tipo_usuario deve ser: ${TIPOS_USUARIO.join(', ')}.`
    );
  }

  if (!validarEmail(email)) {
    throw criarErroHttp(400, 'E-mail inválido.');
  }

  const erroSenha = validarSenha(senha);
  if (erroSenha) throw criarErroHttp(400, erroSenha);

  if (tipo_usuario === 'docente' && !turma?.trim()) {
    throw criarErroHttp(400, 'Docentes devem informar a turma.');
  }

  const emailExistente = await Usuario.buscarPorEmail(email.trim());
  if (emailExistente) {
    throw criarErroHttp(409, 'E-mail já cadastrado.');
  }

  const matriculaExistente = await Usuario.buscarPorMatricula(tipo_usuario, matricula.trim());
  if (matriculaExistente) {
    throw criarErroHttp(409, 'Matrícula já cadastrada.');
  }
}

async function validarLogin(dados) {
  const { email, senha } = dados;
  if (!email?.trim() || !senha) {
    throw criarErroHttp(400, 'E-mail e senha são obrigatórios.');
  }
}

async function validarAtualizacaoPerfil(idUsuario, dados) {
  const { email, senha } = dados;

  if (email && !validarEmail(email)) {
    throw criarErroHttp(400, 'E-mail inválido.');
  }

  if (senha) {
    const erroSenha = validarSenha(senha);
    if (erroSenha) throw criarErroHttp(400, erroSenha);
  }

  if (email) {
    const emailExistente = await Usuario.buscarPorEmail(email.trim());
    if (emailExistente && emailExistente.id !== idUsuario) {
      throw criarErroHttp(409, 'E-mail já cadastrado por outro usuário.');
    }
  }
}

async function validarCategoriaExiste(idCategoria) {
  if (idCategoria === undefined || idCategoria === null) return;

  const erroId = validarIdNumerico(idCategoria, 'id_categoria');
  if (erroId) throw criarErroHttp(400, erroId);

  const categoria = await Categoria.buscarPorId(idCategoria);
  if (!categoria) {
    throw criarErroHttp(404, 'Categoria não encontrada.');
  }
}

async function validarTagsExistem(idsTags) {
  if (!idsTags || idsTags.length === 0) return;

  if (!Array.isArray(idsTags)) {
    throw criarErroHttp(400, 'tags deve ser um array de IDs.');
  }

  for (const idTag of idsTags) {
    const erroId = validarIdNumerico(idTag, 'id_tag');
    if (erroId) throw criarErroHttp(400, erroId);

    const tag = await Tag.buscarPorId(idTag);
    if (!tag) {
      throw criarErroHttp(404, `Tag com id ${idTag} não encontrada.`);
    }
  }
}

async function validarCriacaoItem(dados) {
  const { nome, id_categoria, data_perda, data_perda_inicio, data_perda_fim, status_item, tags } =
    dados;

  if (!nome?.trim()) {
    throw criarErroHttp(400, 'O nome do item é obrigatório.');
  }

  await validarCategoriaExiste(id_categoria);
  await validarTagsExistem(tags);

  const erroData = validarData(data_perda, 'data_perda');
  if (erroData) throw criarErroHttp(400, erroData);

  const erroPeriodo = validarPeriodoPerda(data_perda_inicio, data_perda_fim);
  if (erroPeriodo) throw criarErroHttp(400, erroPeriodo);

  if (status_item && !STATUS_ITEM.includes(status_item)) {
    throw criarErroHttp(400, `status_item deve ser: ${STATUS_ITEM.join(', ')}.`);
  }
}

async function validarAtualizacaoItem(dados) {
  const { id_categoria, data_perda, data_perda_inicio, data_perda_fim, status_item, tags } = dados;

  if (id_categoria !== undefined) {
    await validarCategoriaExiste(id_categoria);
  }

  if (tags !== undefined) {
    await validarTagsExistem(tags);
  }

  if (data_perda !== undefined && data_perda !== null) {
    const erroData = validarData(data_perda, 'data_perda');
    if (erroData) throw criarErroHttp(400, erroData);
  }

  const erroPeriodo = validarPeriodoPerda(data_perda_inicio, data_perda_fim);
  if (erroPeriodo) throw criarErroHttp(400, erroPeriodo);

  if (status_item && !STATUS_ITEM.includes(status_item)) {
    throw criarErroHttp(400, `status_item deve ser: ${STATUS_ITEM.join(', ')}.`);
  }
}

function verificarProprietario(registro, idUsuario, mensagem) {
  if (registro.id_usuario !== idUsuario) {
    throw criarErroHttp(403, mensagem);
  }
}

async function validarCriacaoPostagem(dados, idUsuario) {
  const { titulo, tipo_forum, id_item } = dados;

  if (!titulo?.trim() || !tipo_forum || !id_item) {
    throw criarErroHttp(400, 'Campos obrigatórios: titulo, tipo_forum e id_item.');
  }

  if (!TIPOS_FORUM.includes(tipo_forum)) {
    throw criarErroHttp(400, `tipo_forum deve ser: ${TIPOS_FORUM.join(' ou ')}.`);
  }

  const erroId = validarIdNumerico(id_item, 'id_item');
  if (erroId) throw criarErroHttp(400, erroId);

  const item = await Item.buscarPorId(id_item);
  if (!item) throw criarErroHttp(404, 'Item não encontrado.');

  verificarProprietario(item, idUsuario, 'Você só pode publicar itens que você cadastrou.');

  const postagemDuplicada = await Postagem.buscarPorItemETipo(id_item, tipo_forum);
  if (postagemDuplicada) {
    throw criarErroHttp(409, 'Este item já possui postagem neste fórum.');
  }
}

async function validarAtualizacaoPostagem(dados, postagem, idUsuario) {
  verificarProprietario(postagem, idUsuario, 'Você só pode editar suas próprias postagens.');

  if (dados.tipo_forum && !TIPOS_FORUM.includes(dados.tipo_forum)) {
    throw criarErroHttp(400, `tipo_forum deve ser: ${TIPOS_FORUM.join(' ou ')}.`);
  }

  if (dados.id_item !== undefined) {
    const erroId = validarIdNumerico(dados.id_item, 'id_item');
    if (erroId) throw criarErroHttp(400, erroId);

    const item = await Item.buscarPorId(dados.id_item);
    if (!item) throw criarErroHttp(404, 'Item não encontrado.');

    verificarProprietario(item, idUsuario, 'Você só pode vincular itens que você cadastrou.');
  }
}

async function validarComentario(texto) {
  if (!texto?.trim()) {
    throw criarErroHttp(400, 'O texto do comentário é obrigatório.');
  }
}

async function validarNomeCategoria(nome) {
  if (!nome?.trim()) {
    throw criarErroHttp(400, 'O nome da categoria é obrigatório.');
  }
}

module.exports = {
  validarCadastroUsuario,
  validarLogin,
  validarAtualizacaoPerfil,
  validarCriacaoItem,
  validarAtualizacaoItem,
  validarCriacaoPostagem,
  validarAtualizacaoPostagem,
  validarComentario,
  validarNomeCategoria,
  verificarProprietario,
};
