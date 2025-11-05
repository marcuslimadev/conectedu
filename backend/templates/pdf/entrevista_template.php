<?php
/**
 * Template PDF: Entrevista com o Responsavel (Versão Completa)
 *
 * Inclui todos os campos do modelo de referência para garantir fidelidade total.
 */

// Helpers
function v($data, $key, $default = '') {
    return htmlspecialchars($data[$key] ?? $default, ENT_QUOTES, 'UTF-8');
}

function render_checkbox_text($value, $text, $checked_symbol = '&#9745;', $unchecked_symbol = '&#9744;') {
    return '<span class="checkbox">' . ($value ? $checked_symbol : $unchecked_symbol) . '</span> ' . $text;
}

function render_field($label, $value) {
    return "<p><span class='field-label'>{$label}:</span> <span class='field-value'>{$value}</span></p>";
}

function render_textarea($label, $value, $small_text = '') {
    $html = "<div class='field-row'><span class='field-label'>{$label}</span>";
    if ($small_text) {
        $html .= "<br><span class='small-text'>{$small_text}</span>";
    }
    $html .= "<div class='textarea-field'>" . nl2br($value) . "</div></div>";
    return $html;
}

$css = file_get_contents(__DIR__ . '/style.css');
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Entrevista com Responsável</title>
    <style><?php echo $css; ?></style>
</head>
<body>
    <!-- Cabeçalho e Rodapé -->
    <htmlpageheader name="Header">
        <div class="header-container">ConectAEE | Entrevista com Responsável</div>
    </htmlpageheader>
    <htmlpagefooter name="Footer">
        <div class="footer-container">
            <div class="page-number"></div>
            Gerado em <?php echo date('d/m/Y H:i'); ?>
        </div>
    </htmlpagefooter>

    <h1>ENTREVISTA COM O RESPONSÁVEL</h1>
    <h2 class="document-subtitle">Data da Entrevista: <?php echo v($data, 'data_entrevista_formatada', date('d/m/Y')); ?></h2>

    <!-- DADOS DE IDENTIFICAÇÃO -->
    <div class="section">
        <div class="section-title">DADOS DE IDENTIFICAÇÃO</div>
        <?php if (!empty($data['photo_url'])): ?>
            <div class="photo-container"><img src="<?php echo $data['photo_url']; ?>" alt="Foto do Aluno"></div>
        <?php endif; ?>
        <?php echo render_field('Nome do estudante', v($data, 'nome_estudante')); ?>
        <table class="grid-container">
            <tr>
                <td style="width:50%;"><?php echo render_field('Data de Nascimento', v($data, 'data_nascimento_formatada')); ?></td>
                <td style="width:50%;"><?php echo render_field('Naturalidade', v($data, 'naturalidade')); ?></td>
            </tr>
        </table>
        <?php echo render_field('Nome da Escola', v($data, 'nome_escola')); ?>
        <table class="grid-container">
            <tr>
                <td style="width:50%;"><?php echo render_field('Série/Ano', v($data, 'serie_ano')); ?></td>
                <td style="width:50%;"><?php echo render_field('Turno', v($data, 'turno')); ?></td>
            </tr>
        </table>
        <table class="grid-container">
            <tr>
                <td style="width:40%;"><?php echo render_field('Pai', v($data, 'nome_pai')); ?></td>
                <td style="width:15%;"><?php echo render_field('Idade', v($data, 'idade_pai')); ?></td>
                <td style="width:45%;"><?php echo render_field('Escolaridade', v($data, 'escolaridade_pai')); ?></td>
            </tr>
            <tr>
                <td><?php echo render_field('Mãe', v($data, 'nome_mae')); ?></td>
                <td><?php echo render_field('Idade', v($data, 'idade_mae')); ?></td>
                <td><?php echo render_field('Escolaridade', v($data, 'escolaridade_mae')); ?></td>
            </tr>
        </table>
        <?php echo render_field('Endereço', v($data, 'endereco_completo')); ?>
        <?php echo render_field('Telefone', v($data, 'telefone')); ?>
        <div class="field-row">
            <span class="field-label">Motivo da Entrevista:</span><br>
            <?php echo render_checkbox_text(v($data, 'motivo_entrevista') == 'primeira', 'Primeira Entrevista'); ?> &nbsp;&nbsp;
            <?php echo render_checkbox_text(v($data, 'motivo_entrevista') == 'atualizacao', 'Atualização'); ?> &nbsp;&nbsp;
            <?php echo render_checkbox_text(v($data, 'motivo_entrevista') == 'outros', 'Outros: ' . v($data, 'motivo_outros')); ?>
        </div>
    </div>

    <!-- INFORMAÇÕES DA FAMÍLIA -->
    <div class="section">
        <div class="section-title">INFORMAÇÕES DA FAMÍLIA</div>
        <?php echo render_textarea('Como era composta a família na época da concepção da criança:', v($data, 'composicao_familia_concepcao')); ?>
        <table class="grid-container">
            <tr>
                <td style="width:50%;"><?php echo render_field('Tem Irmãos', v($data, 'tem_irmaos')); ?></td>
                <td style="width:50%;"><?php echo render_field('Quantos', v($data, 'quantos_irmaos')); ?></td>
            </tr>
        </table>
        <?php echo render_textarea('Vida Social da Família (amigos, festas, passeios, moradia, nível econômico):', v($data, 'vida_social_familia')); ?>
        <?php echo render_textarea('Como é o hábito familiar do estudante? (Relatar como é o dia a dia)', v($data, 'habito_familiar')); ?>
        <?php echo render_textarea('Benefícios sociais? (Bolsa Família / BPC/ Passe Livre/ Outros)', v($data, 'beneficios_sociais')); ?>
    </div>

    <!-- GESTAÇÃO/NASCIMENTO -->
    <div class="section">
        <div class="section-title">GESTAÇÃO/NASCIMENTO</div>
        <?php echo render_textarea('A gravidez foi planejada pelos pais?', v($data, 'gravidez_planejada_relato')); ?>
        <?php echo render_textarea('Como foi a saúde e o estado emocional da mãe durante a gestação?', v($data, 'saude_mae_gestacao')); ?>
        <?php echo render_field('Fez Pré-natal', v($data, 'fez_prenatal')); ?>
        <?php echo render_field('Nascimento – Tipo de parto', v($data, 'tipo_parto')); ?>
        <?php echo render_field('Nasceu no tempo normal?', v($data, 'nasceu_tempo_normal')); ?>
        <?php echo render_textarea('Observações sobre o nascimento', v($data, 'observacoes_nascimento')); ?>
        <div class="field-row">
            <span class="field-label">O bebê ao nascer:</span><br>
            <?php echo render_checkbox_text(v($data, 'bebe_necessitou_oxigenio'), 'Necessitou oxigênio'); ?> &nbsp;
            <?php echo render_checkbox_text(v($data, 'bebe_teve_convulsao'), 'Teve convulsão'); ?> &nbsp;
            <?php echo render_checkbox_text(v($data, 'bebe_ictericia'), 'Icterícia'); ?> &nbsp;
            <?php echo render_checkbox_text(v($data, 'bebe_incubadora'), 'Incubadora'); ?>
        </div>
    </div>

    <div class="page-break"></div>

    <!-- ALIMENTAÇÃO, SAÚDE E DESENVOLVIMENTO -->
    <div class="section">
        <div class="section-title">ALIMENTAÇÃO, SAÚDE E DESENVOLVIMENTO</div>
        <?php echo render_field('Foi amamentado?', v($data, 'foi_amamentado') . (v($data, 'foi_amamentado') == 'sim' ? ' até ' . v($data, 'amamentacao_ate_idade') : '')); ?>
        <?php echo render_textarea('Alimentação atual e possíveis problemas:', v($data, 'alimentacao_atual')); ?>
        <?php echo render_textarea('Deficiência informada:', v($data, 'deficiencia_informada')); ?>
        <?php echo render_field('Faz uso de medicamento?', v($data, 'uso_medicamento') . (v($data, 'uso_medicamento') == 'sim' ? ' - ' . v($data, 'medicamento_nome') . ' (' . v($data, 'medicamento_horarios') . ')' : '')); ?>
        <?php echo render_textarea('Acompanhamentos médicos ou tratamentos atuais:', v($data, 'algum_tratamento_medico')); ?>
        <?php echo render_field('Idade em que engatinhou', v($data, 'idade_engatinhou')); ?>
        <?php echo render_field('Idade em que andou', v($data, 'idade_andou')); ?>
        <?php echo render_field('Idade em que falou', v($data, 'idade_falou')); ?>
        <?php echo render_textarea('Comunicação atual (verbal, dificuldades, outras formas):', v($data, 'como_se_comunica_filho')); ?>
    </div>

    <!-- VIDA DIÁRIA E COMPORTAMENTO -->
    <div class="section">
        <div class="section-title">VIDA DIÁRIA E COMPORTAMENTO</div>
        <?php echo render_field('Alimenta-se de forma independente?', v($data, 'alimenta_independente')); ?>
        <?php echo render_field('Faz uso do banheiro de forma independente?', v($data, 'usa_banheiro_independente')); ?>
        <?php echo render_field('Qualidade do Sono', v($data, 'sono_qualidade')); ?>
        <?php echo render_textarea('Brinquedos e brincadeiras de preferência:', v($data, 'brinquedos_preferencia')); ?>
        <?php echo render_textarea('Como lida com a negativa/frustração?', v($data, 'lida_negativa_desejo')); ?>
        <?php echo render_textarea('Tem algum hábito/mania ou hiperfoco?', v($data, 'habito_mania_descricao')); ?>
    </div>

    <div class="page-break"></div>

    <!-- VIDA ESCOLAR -->
    <div class="section">
        <div class="section-title">VIDA ESCOLAR</div>
        <?php echo render_field('Idade em que entrou na escola', v($data, 'idade_entrou_escola')); ?>
        <?php echo render_textarea('Como foi a adaptação?', v($data, 'adaptacao_escola')); ?>
        <?php echo render_textarea('A família participa da vida escolar do filho(a)? De que forma?', v($data, 'familia_participa_como')); ?>
        <?php echo render_textarea('O que acha do atendimento da escola?', v($data, 'opiniao_atendimento_escola')); ?>
        <?php echo render_field('Frequenta Sala de Recursos?', v($data, 'frequenta_sala_recursos') . (v($data, 'frequenta_sala_recursos') == 'sim' ? ' - Frequência: ' . v($data, 'frequencia_atendimento') : '')); ?>
    </div>

    <!-- INFORMAÇÕES COMPLEMENTARES -->
    <div class="section">
        <div class="section-title">INFORMAÇÕES COMPLEMENTARES</div>
        <div class="textarea-field" style="min-height: 100px;"><?php echo nl2br(v($data, 'informacoes_complementares')); ?></div>
    </div>

    <!-- ASSINATURAS -->
    <div class="signature-area">
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label"><?php echo v($data, 'nome_entrevistador'); ?></div>
            <div class="signature-info"><?php echo v($data, 'funcao_entrevistador'); ?></div>
        </div>
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label"><?php echo v($data, 'nome_responsavel_entrevistado'); ?></div>
            <div class="signature-info">Responsável pelas Informações (Parentesco: <?php echo v($data, 'parentesco_responsavel'); ?>)</div>
        </div>
    </div>

</body>
</html>
