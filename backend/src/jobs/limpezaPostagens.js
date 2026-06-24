const cron = require('node-cron');
const Postagem = require('../models/Postagem');

const MESES_INATIVIDADE = Number(process.env.LIMPEZA_MESES_INATIVIDADE) || 2;
const CRON_EXPRESSAO = process.env.LIMPEZA_CRON || '0 3 * * *';

async function executarLimpeza() {
  try {
    const removidas = await Postagem.limparPostagensInativas(MESES_INATIVIDADE);
    if (removidas > 0) {
      console.log(`[RNF5] ${removidas} postagem(ns) inativa(s) removida(s).`);
    }
  } catch (erro) {
    console.error('[RNF5] Erro na limpeza de postagens:', erro.message);
  }
}

function iniciarJobLimpeza() {
  cron.schedule(CRON_EXPRESSAO, executarLimpeza);
  console.log(
    `Job de limpeza (RNF5) agendado: "${CRON_EXPRESSAO}" (${MESES_INATIVIDADE} meses sem atividade).`
  );
}

module.exports = { iniciarJobLimpeza, executarLimpeza };
