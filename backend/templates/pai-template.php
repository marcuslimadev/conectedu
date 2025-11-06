<?php
// backend/templates/pai-template.php

include __DIR__ . '/partials/header.php';

$pai = $data['pai'];
$photo_path = $data['photo_path'];

$fotoHtml = '';
if ($photo_path && file_exists($photo_path)) {
    $fotoHtml = '<img src="' . $photo_path . '" class="student-photo">';
}
?>

<!-- TÍTULO DO DOCUMENTO -->
<div style="text-align: center;">
    <h1 style="font-size: 14pt; font-weight: bold; margin-bottom: 5px;">Plano de Atendimento Individual (PAI)</h1>
</div>

<?php echo $fotoHtml; ?>

<!-- SEÇÃO 1 - IDENTIFICAÇÃO -->
<div class="section">
    <div class="section-title">1. Identificação do Aluno e da Equipe</div>

    <div class="field-row"><span class="field-label">Nome da Escola:</span> <span class="field-value"><?php echo v($pai, 'nome_escola'); ?></span></div>
    <div class="field-row"><span class="field-label">Nome do Estudante:</span> <span class="field-value"><?php echo v($pai, 'nome_aluno'); ?></span></div>
    <div class="field-row"><span class="field-label">Data de Nascimento:</span> <span class="field-value"><?php echo v($pai, 'data_nascimento') ? date('d/m/Y', strtotime(v($pai, 'data_nascimento'))) : ''; ?></span> <span class="field-label">Idade:</span> <span class="field-value"><?php echo v($pai, 'idade'); ?></span></div>

    <table style="margin-top: 10px; font-size: 9pt;">
        <tr>
            <td><strong>Série/Ano:</strong><br><?php echo v($pai, 'serie_ano'); ?></td>
            <td><strong>Turno:</strong><br><?php echo ucfirst(v($pai, 'turno')); ?></td>
            <td><strong>Nome do Responsável:</strong><br><?php echo v($pai, 'nome_responsavel'); ?></td>
            <td><strong>Tel. para contato:</strong><br><?php echo v($pai, 'telefone_contato'); ?></td>
        </tr>
    </table>

    <div class="field-row" style="margin-top: 5px;"><span class="field-label">Endereço Residencial:</span><div class="textarea-field"><?php echo v($pai, 'endereco_residencial'); ?></div></div>
    <div class="field-row"><span class="field-label">Diagnóstico/CID:</span><div class="textarea-field"><?php echo v($pai, 'diagnostico_cid'); ?></div></div>

    <div class="field-row" style="margin-top: 10px;"><span class="field-label">Professor(a) Regente:</span> <span class="field-value"><?php echo v($pai, 'professor_regente'); ?></span></div>
    <div class="field-row"><span class="field-label">Professor(a) do AEE:</span> <span class="field-value"><?php echo v($pai, 'professor_aee'); ?></span></div>
    <div class="field-row"><span class="field-label">Outros Profissionais Envolvidos:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'outros_profissionais')); ?></div></div>

    <table style="margin-top: 10px; font-size: 9pt;">
        <tr>
            <td><strong>Data de Elaboração do PAI:</strong><br><?php echo v($pai, 'data_elaboracao') ? date('d/m/Y', strtotime(v($pai, 'data_elaboracao'))) : ''; ?></td>
            <td><strong>Data da Avaliação Diagnóstica:</strong><br><?php echo v($pai, 'data_avaliacao_diagnostica') ? date('d/m/Y', strtotime(v($pai, 'data_avaliacao_diagnostica'))) : ''; ?></td>
            <td><strong>Período de Vigência:</strong><br><?php echo v($pai, 'periodo_vigencia'); ?></td>
            <td><strong>Data Prevista para Reavaliação:</strong><br><?php echo v($pai, 'data_prevista_reavaliacao') ? date('d/m/Y', strtotime(v($pai, 'data_prevista_reavaliacao'))) : ''; ?></td>
        </tr>
    </table>
</div>

<!-- SEÇÃO 2 - HISTÓRICO E CONTEXTUALIZAÇÃO -->
<div class="section">
    <div class="section-title">2. Histórico do Estudante e Contextualização</div>
    <h3 style="font-size: 10pt;">Histórico Escolar:</h3>
    <div class="textarea-field"><?php echo nl2br(v($pai, 'historico_escolar')); ?></div>

    <h3 style="font-size: 10pt; margin-top: 10px;">Histórico Familiar e Social:</h3>
    <div class="textarea-field"><?php echo nl2br(v($pai, 'historico_familiar_social')); ?></div>

    <h3 style="font-size: 10pt; margin-top: 10px;">Interesses e Preferências do Estudante:</h3>
    <div class="textarea-field"><?php echo nl2br(v($pai, 'interesses_preferencias')); ?></div>

    <h3 style="font-size: 10pt; margin-top: 10px;">Dificuldades:</h3>
    <div class="textarea-field"><?php echo nl2br(v($pai, 'dificuldades')); ?></div>

    <h3 style="font-size: 10pt; margin-top: 10px;">Potencialidades Observadas:</h3>
    <div class="textarea-field"><?php echo nl2br(v($pai, 'potencialidades_observadas')); ?></div>
</div>

<div style="page-break-after: always;"></div>

<!-- SEÇÃO 3 - AVALIAÇÃO DIAGNÓSTICA -->
<div class="section">
    <div class="section-title">3. Avaliação Diagnóstica e Levantamento de Necessidades</div>

    <h3 style="font-size: 10pt;">I. Habilidades de Comunicação e Linguagem:</h3>
    <div class="field-row"><span class="field-label">Oralidade:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'oralidade')); ?></div></div>
    <div class="field-row"><span class="field-label">Compreensão:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'compreensao')); ?></div></div>
    <div class="field-row"><span class="field-label">Expressão verbal:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'expressao_verbal')); ?></div></div>
    <div class="field-row" style="margin-top: 5px;">
        <span class="field-label">Clareza:</span>
        <?php echo checkbox(v($pai, 'clareza_frases_completas'), 'sim'); ?> Usa frases completas? &nbsp;
        <?php echo checkbox(v($pai, 'interage_verbalmente'), 'sim'); ?> Interage verbalmente?
    </div>

    <table style="margin-top: 10px; font-size: 9pt;">
        <tr>
            <td style="width: 50%">
                <strong>Escreve:</strong> <?php echo checkbox(v($pai, 'escreve'), 'sim'); ?> Sim / <?php echo checkbox(v($pai, 'escreve'), 'nao'); ?> Não<br>
                <strong>Grafia é legível:</strong> <?php echo checkbox(v($pai, 'grafia_legivel'), 'sim'); ?> Sim / <?php echo checkbox(v($pai, 'grafia_legivel'), 'nao'); ?> Não<br>
                <strong>Escreve certo:</strong> <?php echo checkbox(v($pai, 'escreve_certo'), 'sim'); ?> Sim / <?php echo checkbox(v($pai, 'escreve_certo'), 'nao'); ?> Não<br>
                <strong>Produção de textos:</strong> <?php echo checkbox(v($pai, 'producao_textos'), 'sim'); ?> Sim / <?php echo checkbox(v($pai, 'producao_textos'), 'nao'); ?> Não<br>
            </td>
            <td style="width: 50%">
                <strong>Desenha:</strong> <?php echo checkbox(v($pai, 'desenha'), 'sim'); ?> Sim / <?php echo checkbox(v($pai, 'desenha'), 'nao'); ?> Não<br>
                <strong>Copia:</strong> <?php echo checkbox(v($pai, 'copia'), 'sim'); ?> Sim / <?php echo checkbox(v($pai, 'copia'), 'nao'); ?> Não<br>
                <strong>Faz garatujas:</strong> <?php echo checkbox(v($pai, 'faz_garatujas'), 'sim'); ?> Sim / <?php echo checkbox(v($pai, 'faz_garatujas'), 'nao'); ?> Não<br>
            </td>
        </tr>
    </table>

    <div class="field-row" style="margin-top: 5px;"><span class="field-label">Leitura (Nível):</span><div class="textarea-field"><?php echo nl2br(v($pai, 'leitura_nivel')); ?></div></div>
    <div class="field-row"><span class="field-label">Comunicação Não-Verbal/Alternativa:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'comunicacao_nao_verbal')); ?></div></div>

    <h3 style="font-size: 10pt; margin-top: 15px;">II. Habilidades Cognitivas e Acadêmicas:</h3>
    <div class="field-row"><span class="field-label">Raciocínio Lógico-Matemático:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'raciocinio_logico_matematico')); ?></div></div>
    <div class="field-row"><span class="field-label">Conceitos Acadêmicos:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'conceitos_academicos')); ?></div></div>
    <div class="field-row"><span class="field-label">Atenção e Concentração:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'atencao_concentracao')); ?></div></div>
    <div class="field-row"><span class="field-label">Memória:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'memoria')); ?></div></div>
    <div class="field-row"><span class="field-label">Organização e Planejamento:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'organizacao_planejamento')); ?></div></div>

    <div style="page-break-after: always;"></div>

    <h3 style="font-size: 10pt; margin-top: 15px;">III. Habilidades Socioemocionais e Comportamentais:</h3>
    <div class="field-row"><span class="field-label">Interação Social:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'interacao_social')); ?></div></div>
    <div class="field-row"><span class="field-label">Autonomia e Independência:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'autonomia_independencia')); ?></div></div>
    <div class="field-row"><span class="field-label">Manejo de Emoções:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'manejo_emocoes')); ?></div></div>
    <div class="field-row"><span class="field-label">Comportamento em Sala:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'comportamento_sala')); ?></div></div>

    <h3 style="font-size: 10pt; margin-top: 15px;">IV. Habilidades Motoras e Perceptivas:</h3>
    <div class="field-row"><span class="field-label">Coordenação Motora Fina:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'coordenacao_motora_fina')); ?></div></div>
    <div class="field-row"><span class="field-label">Coordenação Motora Grossa:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'coordenacao_motora_grossa')); ?></div></div>
    <div class="field-row"><span class="field-label">Orientação Espacial e Temporal:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'orientacao_espacial_temporal')); ?></div></div>
    <div class="field-row"><span class="field-label">Percepção Visual e Auditiva:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'percepcao_visual_auditiva')); ?></div></div>
</div>

<div style="page-break-after: always;"></div>

<!-- SEÇÃO 4 - OBJETIVOS E METAS -->
<div class="section">
    <div class="section-title">4. Definição de Objetivos e Metas</div>
    <h3 style="font-size: 10pt;">Objetivo Geral do PAI:</h3>
    <div class="textarea-field" style="min-height: 60px;"><?php echo nl2br(v($pai, 'objetivo_geral')); ?></div>

    <h3 style="font-size: 10pt; margin-top: 15px;">Objetivos Específicos:</h3>
    <div class="textarea-field" style="min-height: 120px;"><?php echo nl2br(v($pai, 'objetivos_especificos')); ?></div>
</div>

<!-- SEÇÃO 5 - ESTRATÉGIAS E RECURSOS -->
<div class="section">
    <div class="section-title">5. Estratégias e Recursos Pedagógicos</div>
    <div class="field-row"><span class="field-label">Adaptações Curriculares:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'adaptacoes_curriculares')); ?></div></div>
    <div class="field-row"><span class="field-label">Recursos Didáticos e Tecnologias Assistivas:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'recursos_didaticos_tecnologias')); ?></div></div>
    <div class="field-row"><span class="field-label">Estratégias de Ensino:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'estrategias_ensino')); ?></div></div>
    <div class="field-row"><span class="field-label">Adaptações no Ambiente Escolar:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'adaptacoes_ambiente_escolar')); ?></div></div>
    <div class="field-row"><span class="field-label">Atendimento do AEE:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'atendimento_aee')); ?></div></div>
    <div class="field-row"><span class="field-label">Envolvimento da Família:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'envolvimento_familia')); ?></div></div>
    <div class="field-row"><span class="field-label">Articulação com Outros Profissionais:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'articulacao_outros_profissionais')); ?></div></div>
</div>

<div style="page-break-after: always;"></div>

<!-- SEÇÃO 6 - AVALIAÇÃO E ACOMPANHAMENTO -->
<div class="section">
    <div class="section-title">6. Avaliação e Acompanhamento</div>
    <div class="field-row"><span class="field-label">Critérios de Avaliação:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'criterios_avaliacao')); ?></div></div>
    <div class="field-row"><span class="field-label">Periodicidade das Reavaliações:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'periodicidade_reavaliacoes')); ?></div></div>
    <div class="field-row"><span class="field-label">Registro de Progresso:</span><div class="textarea-field"><?php echo nl2br(v($pai, 'registro_progresso')); ?></div></div>
</div>

<!-- SEÇÃO 7 - ASSINATURAS -->
<div class="section signature-box">
    <div class="section-title">7. Assinaturas e Consenso</div>
    <div style="display:inline-block; margin-top: 30px; text-align: center;">
        <div class="signature-line"></div>
        <div><?php echo v($pai, 'professor_regente'); ?></div>
        <div style="font-size:9pt;">Professor(a) Regente</div>
    </div>
    <div style="display:inline-block; margin-top: 30px; text-align: center;">
        <div class="signature-line"></div>
        <div><?php echo v($pai, 'professor_aee'); ?></div>
        <div style="font-size:9pt;">Professor(a) de AEE</div>
    </div>
    <div style="display:inline-block; margin-top: 30px; text-align: center;">
        <div class="signature-line"></div>
        <div style="font-size:9pt;">Coordenação Pedagógica</div>
    </div>
    <div style="display:inline-block; margin-top: 30px; text-align: center;">
        <div class="signature-line"></div>
        <div style="font-size:9pt;">Direção Escolar</div>
    </div>
    <div style="display:inline-block; margin-top: 30px; text-align: center;">
        <div class="signature-line"></div>
        <div><?php echo v($pai, 'nome_responsavel'); ?></div>
        <div style="font-size:9pt;">Responsável pelo Aluno</div>
    </div>
</div>


<?php
include __DIR__ . '/partials/footer.php';
?>
